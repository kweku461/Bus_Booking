import { Link, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle, Printer } from 'lucide-react';
import '../styles/Confirmation.css';

export default function Confirmation() {
  const { state } = useLocation();

  // Opened directly or refreshed with no booking data, so go home
  if (!state || !state.bookings?.length) return <Navigate to="/" replace />;

  const { trip, bookings } = state;
  const first = bookings[0];
  const seats = bookings.map((b) => b.seat_number).sort((a, b) => a - b);
  const total = seats.length * Number(trip.price);
  const ref = `FT-${String(first.id).padStart(5, '0')}`;

  const d = new Date(trip.departure_time);
  const date = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="container confirm">
      <div className="confirm__head">
        <CheckCircle size={52} />
        <h1>Booking confirmed</h1>
        <p>Your seat{seats.length > 1 ? 's are' : ' is'} reserved. Show this ticket when you board.</p>
      </div>

      <article className="ticket">
        <div className="ticket__top">
          <span className="ticket__brand">FastTrip</span>
          <span className={`badge badge--${trip.bus_type.toLowerCase()}`}>{trip.bus_type}</span>
        </div>

        <div className="ticket__route">
          <div>
            <small>From</small>
            <strong>{trip.origin}</strong>
          </div>
          <span className="ticket__line" />
          <div>
            <small>To</small>
            <strong>{trip.destination}</strong>
          </div>
        </div>

        <div className="ticket__grid">
          <div><small>Date</small><strong>{date}</strong></div>
          <div><small>Departure</small><strong>{time}</strong></div>
          <div><small>Passenger</small><strong>{first.name}</strong></div>
          <div><small>Seat{seats.length > 1 ? 's' : ''}</small><strong>{seats.join(', ')}</strong></div>
        </div>

        <div className="ticket__cut" />

        <div className="ticket__bottom">
          <div>
            <small>Booking reference</small>
            <strong className="ticket__ref">{ref}</strong>
          </div>
          <div>
            <small>Total</small>
            <strong className="ticket__ref">GH₵{total.toFixed(0)}</strong>
          </div>
        </div>
      </article>

      <div className="confirm__actions">
        <button className="btn btn--outline" onClick={() => window.print()}>
          <Printer size={18} /> Print ticket
        </button>
        <Link to="/" className="btn">Book another trip</Link>
      </div>
    </main>
  );
}