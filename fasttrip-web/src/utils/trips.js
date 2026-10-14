const TZ = 'Africa/Accra';

// YYYY-MM-DD in Ghana time, whatever the viewer's device timezone is
export function localDate(value) {
  return new Date(value).toLocaleDateString('en-CA', { timeZone: TZ });
}

// "date" is a YYYY-MM-DD string. Noon UTC keeps it on the right day in Ghana.
export function dayLabel(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TZ,
  });
}

export function fmtTime(iso) {
  return new Date(iso)
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: TZ,
    })
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
        weekday: new Date(trip.departure_time).toLocaleDateString('en-GB', {
          weekday: 'long',
          timeZone: TZ,
        }),
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