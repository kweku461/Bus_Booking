import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatDate, formatTime, formatPrice } from '../utils/format.js';
import '../styles/Ticket.css';

export default function Ticket({ trip, bookings, reference, amount }) {
  const [copied, setCopied] = useState(false);

  const first = bookings[0];
  const seats = bookings.map((b) => b.seat_number).sort((a, b) => a - b);
  const total = amount ?? seats.length * Number(trip.price);

  const date = formatDate(trip.departure_time, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const time = formatTime(trip.departure_time);
  const paid = first.status === 'confirmed';

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked, the user can still select the text */
    }
  };

  return (
    <article className="ticket">
      <div className="ticket__top">
        <span className="ticket__brand">FastTrip</span>
        <span className="ticket__badges">
          {paid && <span className="ticket__paid">PAID</span>}
          <span className={`badge badge--${trip.bus_type.toLowerCase()}`}>{trip.bus_type}</span>
        </span>
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
          <small>Booking ID</small>
          <strong className="ticket__ref">
            {reference}
            <button
              type="button"
              onClick={copyRef}
              aria-label="Copy booking ID"
              className="ticket__copy"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </strong>
        </div>
        <div>
          <small>{paid ? 'Total paid' : 'Total due'}</small>
          <strong className="ticket__ref">{formatPrice(total)}</strong>
        </div>
      </div>
    </article>
  );
}