// YYYY-MM-DD in the browser's own timezone
export function localDate(value) {
  const d = new Date(value);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// "Sunday, 11 October" from a YYYY-MM-DD string
export function dayLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function fmtTime(iso) {
  return new Date(iso)
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toLowerCase();
}

// One group per route + bus class. Input is one day of trips, sorted by time.
export function groupRoutes(trips) {
  const groups = [];
  const index = new Map();

  for (const t of trips) {
    const key = `${t.origin}|${t.destination}|${t.bus_type}`;
    let g = index.get(key);
    if (!g) {
      g = {
        key,
        origin: t.origin,
        destination: t.destination,
        bus_type: t.bus_type,
        day: localDate(t.departure_time),
        weekday: new Date(t.departure_time).toLocaleDateString('en-GB', { weekday: 'long' }),
        trips: [],
      };
      index.set(key, g);
      groups.push(g);
    }
    g.trips.push(t);
  }

  return groups.sort(
    (a, b) =>
      a.origin.localeCompare(b.origin) ||
      a.destination.localeCompare(b.destination) ||
      a.bus_type.localeCompare(b.bus_type)
  );
}

// Next day after `date` that has departures (optionally for one route)
export function nextDepartureDate(trips, date, origin = '', destination = '') {
  return trips
    .filter(
      (t) =>
        (!origin || t.origin === origin) &&
        (!destination || t.destination === destination) &&
        localDate(t.departure_time) > date
    )
    .map((t) => localDate(t.departure_time))
    .sort()[0];
}