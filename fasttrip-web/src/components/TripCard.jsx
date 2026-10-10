import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import './TripCard.css';

export default function TripCard({ trip }) {
  const d = new Date(trip.departure_time);
  const date = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const low = trip.seats_left > 0 && trip.seats_left <= 5;
  const soldOut = trip.seats_left === 0;

  return (
    <article className="trip-card">
      <div className="trip-card__top">
        <span className={`badge badge--${trip.bus_type.toLowerCase()}`}>{trip.bus_type}</span>
        <span className="trip-card__date">{date}</span>
      </div>

      <div className="trip-card__route">
        <strong>{trip.origin}</strong>
        <span className="trip-card__line" />
        <strong>{trip.destination}</strong>
      </div>

      <div className="trip-card__meta">
        <span><Clock size={16} /> {time}</span>
        <span className={low ? 'is-low' : ''}>
          <Users size={16} /> {soldOut ? 'Sold out' : `${trip.seats_left} seats left`}
        </span>
      </div>

      <div className="trip-card__bottom">
        <span className="trip-card__price">GH₵{Number(trip.price).toFixed(0)}</span>
        {soldOut ? (
          <button className="btn btn--disabled" disabled>Sold out</button>
        ) : (
          <Link to={`/trips/${trip.id}`} className="btn">Select seat</Link>
        )}
      </div>
    </article>
  );
}