export function localDate(value) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function dayLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function fmtTime(iso) {
  return new Date(iso)
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toLowerCase();
}

export function groupRoutes(trips) {
  const groups = [];
  const index = new Map();

  for (const trip of trips) {
    const key = `${trip.origin}|${trip.destination}|${trip.bus_type}`;
    let group = index.get(key);
    if (!group) {
      group = {
        key,
        origin: trip.origin,
        destination: trip.destination,
        bus_type: trip.bus_type,
        day: localDate(trip.departure_time),
        weekday: new Date(trip.departure_time).toLocaleDateString('en-GB', { weekday: 'long' }),
        trips: [],
      };
      index.set(key, group);
      groups.push(group);
    }
    group.trips.push(trip);
  }

  return groups.sort(
    (a, b) =>
      a.origin.localeCompare(b.origin) ||
      a.destination.localeCompare(b.destination) ||
      a.bus_type.localeCompare(b.bus_type)
  );
}

export function nextDepartureDate(trips, date, origin = '', destination = '') {
  return trips
    .filter(
      (trip) =>
        (!origin || trip.origin === origin) &&
        (!destination || trip.destination === destination) &&
        localDate(trip.departure_time) > date
    )
    .map((trip) => localDate(trip.departure_time))
    .sort()[0];
}