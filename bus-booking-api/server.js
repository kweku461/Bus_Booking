require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header means Postman, curl or a script, not a browser page
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false); // browser will block the response
    },
  })
);
app.use(express.json());

// Admin guard: requires the x-admin-key header to match ADMIN_KEY
function requireAdmin(req, res, next) {
  if (req.get('x-admin-key') !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/', (req, res) => res.json({ status: 'ok' }));

// Admin: create a trip
// Admin: create trips. Either one departure_time, or a date range x list of times.
app.post('/admin/trips', requireAdmin, async (req, res) => {
  const {
    origin, destination, price, departure_time,
    bus_type = 'Standard', start_date, days = 1, times,
  } = req.body;

  if (!origin || !destination || price == null) {
    return res.status(400).json({ error: 'origin, destination and price are required' });
  }
  if (!['Standard', 'Executive'].includes(bus_type)) {
    return res.status(400).json({ error: 'bus_type must be Standard or Executive' });
  }

  // Build the list of departures (Ghana is UTC+0, so "Z" is the local time)
  let departures = [];
  if (start_date && Array.isArray(times)) {
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(start_date) && !isNaN(Date.parse(start_date));
    const validTimes =
      times.length >= 1 && times.length <= 20 &&
      times.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t));
    if (!validDate || !validTimes || !Number.isInteger(days) || days < 1 || days > 30) {
      return res.status(400).json({
        error: 'Use start_date YYYY-MM-DD, days 1-30, and times like "06:00"',
      });
    }
    for (let i = 0; i < days; i++) {
      const d = new Date(`${start_date}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + i);
      const day = d.toISOString().slice(0, 10);
      for (const t of times) departures.push(`${day}T${t}:00Z`);
    }
  } else if (departure_time && !isNaN(Date.parse(departure_time))) {
    departures = [departure_time];
  } else {
    return res.status(400).json({ error: 'Provide departure_time, or start_date with times' });
  }

  const total_seats = bus_type === 'Executive' ? 30 : 44;

  try {
    const { rows } = await pool.query(
      `INSERT INTO trips (origin, destination, departure_time, bus_type, total_seats, price)
       SELECT $1, $2, d, $3, $4, $5 FROM unnest($6::timestamptz[]) AS d
       ON CONFLICT (origin, destination, departure_time, bus_type) DO NOTHING
       RETURNING *`,
      [origin.trim(), destination.trim(), bus_type, total_seats, price, departures]
    );

    if (rows.length === 0) {
      return res.status(409).json({ error: 'These trips already exist' });
    }
    res.status(201).json({
      created: rows.length,
      skipped: departures.length - rows.length,
      trips: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: list upcoming trips with seats left, optional filters
app.get('/trips', async (req, res) => {
  const { origin = null, destination = null, date = null } = req.query;

  try {
    const { rows } = await pool.query(
      `SELECT t.*, t.total_seats - COUNT(b.id)::int AS seats_left
       FROM trips t
       LEFT JOIN bookings b ON b.trip_id = t.id
       WHERE t.departure_time > now()
         AND ($1::text IS NULL OR t.origin ILIKE $1)
         AND ($2::text IS NULL OR t.destination ILIKE $2)
         AND ($3::date IS NULL OR t.departure_time::date = $3::date)
       GROUP BY t.id
       ORDER BY t.departure_time`,
      [origin, destination, date]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: seat map for one trip
app.get('/trips/:id/seats', async (req, res) => {
  const tripId = parseInt(req.params.id, 10);
  if (!Number.isInteger(tripId)) {
    return res.status(400).json({ error: 'Invalid trip id' });
  }

  try {
    const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (trip.rowCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const taken = await pool.query(
      'SELECT seat_number FROM bookings WHERE trip_id = $1 ORDER BY seat_number',
      [tripId]
    );

    res.json({
      trip: trip.rows[0],
      taken_seats: taken.rows.map((r) => r.seat_number),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: book one or more seats on a trip
app.post('/bookings', async (req, res) => {
  const { trip_id, seats, name, email, note } = req.body;

  // Validation
  if (!Number.isInteger(trip_id)) {
    return res.status(400).json({ error: 'trip_id must be a number' });
  }
  if (!Array.isArray(seats) || seats.length === 0 || seats.length > 5) {
    return res.status(400).json({ error: 'Choose between 1 and 5 seats' });
  }
  if (!seats.every(Number.isInteger) || new Set(seats).size !== seats.length) {
    return res.status(400).json({ error: 'Seats must be unique whole numbers' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  try {
    const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [trip_id]);
    if (trip.rowCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const { total_seats, departure_time } = trip.rows[0];

    if (new Date(departure_time) <= new Date()) {
      return res.status(400).json({ error: 'This trip has already departed' });
    }
    if (seats.some((s) => s < 1 || s > total_seats)) {
      return res.status(400).json({ error: `Seats must be between 1 and ${total_seats}` });
    }

    // One INSERT statement = all seats succeed or none do.
    // The UNIQUE (trip_id, seat_number) constraint is the real guard.
    const { rows } = await pool.query(
      `INSERT INTO bookings (trip_id, seat_number, name, email, note)
       SELECT $1, s, $3, $4, $5 FROM unnest($2::int[]) AS s
       RETURNING *`,
      [trip_id, seats, name.trim(), email.trim(), note || null]
    );

    res.status(201).json({ trip: trip.rows[0], bookings: rows });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'One or more of those seats were just taken. Please pick again.',
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));