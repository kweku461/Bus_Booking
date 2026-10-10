const body = JSON.stringify({
  trip_id: 1,
  seats: [30],
  name: 'Racer',
  email: 'race@example.com',
});

const send = () =>
  fetch('http://localhost:5001/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).then((r) => r.status);

Promise.all([send(), send(), send(), send(), send()]).then((statuses) =>
  console.log(statuses)
);