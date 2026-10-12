require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const HOLD_MINUTES = 10;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0 or 1, so IDs are easy to read

// Booking ID like FT-7K3M9QXD
function makeReference() {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `FT-${s}`;
}

// Unpaid holds that ran out of time free their seats again
async function releaseExpiredHolds() {
  await pool.query(
    `DELETE FROM bookings WHERE status = 'pending' AND expires_at < now()`
  );
}

// GHS amounts go to Paystack in pesewas (GH₵1 = 100 pesewas)
const toPesewas = (price, count) => Math.round(Number(price) * count * 100);

// Small wrapper around the Paystack API. The secret key never leaves the server.
async function paystack(path, options = {}) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.status) {
    const err = new Error(body.message || 'Paystack error');
    err.status = res.status;
    throw err;
  }
  return body.data;
}

// A booking (all its seats) plus its trip, found by booking ID
async function loadBooking(reference) {
  const b = await pool.query(
    'SELECT * FROM bookings WHERE reference = $1 ORDER BY seat_number',
    [reference]
  );
  if (b.rowCount === 0) return null;
  const t = await pool.query('SELECT * FROM trips WHERE id = $1', [b.rows[0].trip_id]);
  return { trip: t.rows[0], bookings: b.rows };
}

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
const FRONTEND_URL = (process.env.FRONTEND_URL || allowedOrigins[0]).replace(/\/$/, '');

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

// Public: list upcoming trips with seats left (held seats count as taken)
app.get('/trips', async (req, res) => {
  const { origin = null, destination = null, date = null } = req.query;

  try {
    await releaseExpiredHolds();

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
    await releaseExpiredHolds();

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

// Public: hold seats and start the payment. Returns the Paystack checkout link.
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
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Payments are not configured' });
  }

  try {
    await releaseExpiredHolds();

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
    const reference = makeReference();
    const { rows } = await pool.query(
      `INSERT INTO bookings
         (trip_id, seat_number, name, email, note, status, reference, expires_at)
       SELECT $1, s, $3, $4, $5, 'pending', $6, now() + $7::int * interval '1 minute'
       FROM unnest($2::int[]) AS s
       RETURNING *`,
      [trip_id, seats, name.trim(), email.trim(), note || null, reference, HOLD_MINUTES]
    );

    // The amount is worked out here, never taken from the browser
    const amount = toPesewas(trip.rows[0].price, seats.length) / 100;

    let authorization_url;
    try {
      const init = await paystack('/transaction/initialize', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          amount: Math.round(amount * 100),
          currency: 'GHS',
          reference,
          callback_url: `${FRONTEND_URL}/payment/callback`,
          // Kept so a late payment can still be matched to its seats
          metadata: { trip_id, seats, name: name.trim(), note: note || null },
        }),
      });
      authorization_url = init.authorization_url;
    } catch (err) {
      // Couldn't start the payment, so give the seats straight back
      await pool.query('DELETE FROM bookings WHERE reference = $1', [reference]);
      console.error('Paystack initialize failed:', err.message);
      return res.status(502).json({ error: 'Could not start the payment. Please try again.' });
    }

    res.status(201).json({
      reference,
      amount,
      expires_at: rows[0].expires_at,
      authorization_url,
      trip: trip.rows[0],
    });
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

// Public: confirm a payment with Paystack, then confirm the seats.
// Safe to call more than once for the same booking ID.
app.post('/payments/verify', async (req, res) => {
  const { reference } = req.body;
  if (typeof reference !== 'string' || !/^FT-[A-Z0-9]{8}$/.test(reference)) {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  try {
    // Ask Paystack directly. We never trust the browser's word that it was paid.
    const tx = await paystack(`/transaction/verify/${reference}`);
    if (tx.status !== 'success') {
      return res.status(402).json({ error: 'Payment not completed', payment_status: tx.status });
    }

    let found = await loadBooking(reference);

    if (!found) {
      // The hold ran out before the payment finished, so the seats were released.
      // Try to take the same seats back using the details saved with the payment.
      const m = tx.metadata || {};
      const seats = Array.isArray(m.seats) ? m.seats : [];
      const t = Number.isInteger(m.trip_id)
        ? await pool.query('SELECT price FROM trips WHERE id = $1', [m.trip_id])
        : { rowCount: 0 };

      if (t.rowCount === 0 || seats.length === 0) {
        console.error('PAID BUT NO BOOKING. Refund needed:', reference);
        return res.status(409).json({
          error: 'We could not match this payment to a booking. Please contact support.',
          needs_refund: true,
        });
      }
      if (tx.amount !== toPesewas(t.rows[0].price, seats.length) || tx.currency !== 'GHS') {
        console.error('Amount mismatch on late payment:', reference);
        return res.status(409).json({ error: 'Payment amount does not match this booking' });
      }

      try {
        await pool.query(
          `INSERT INTO bookings
             (trip_id, seat_number, name, email, note, status, reference, paid_at)
           SELECT $1, s, $3, $4, $5, 'confirmed', $6, now() FROM unnest($2::int[]) AS s`,
          [m.trip_id, seats, m.name, tx.customer.email, m.note || null, reference]
        );
      } catch (err) {
        if (err.code === '23505') {
          console.error('PAID BUT SEATS TAKEN. Refund needed:', reference);
          return res.status(409).json({
            error: 'Your payment went through, but those seats were taken while it was processing. You will be refunded.',
            needs_refund: true,
          });
        }
        throw err;
      }
      found = await loadBooking(reference);
    } else {
      const expected = toPesewas(found.trip.price, found.bookings.length);
      if (tx.amount !== expected || tx.currency !== 'GHS') {
        console.error('Amount mismatch:', reference, tx.amount, expected);
        return res.status(409).json({ error: 'Payment amount does not match this booking' });
      }
      await pool.query(
        `UPDATE bookings
         SET status = 'confirmed', paid_at = COALESCE(paid_at, now())
         WHERE reference = $1 AND status = 'pending'`,
        [reference]
      );
      found = await loadBooking(reference);
    }

    res.json({
      ...found,
      reference,
      amount: toPesewas(found.trip.price, found.bookings.length) / 100,
    });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: 'No payment found for this booking ID' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));