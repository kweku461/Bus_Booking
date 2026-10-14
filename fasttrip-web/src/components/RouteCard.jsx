import { Clock, Banknote, Users } from 'lucide-react';
import { useTripSelection } from '../hooks/useTripSelection.js';
import { fmtTime } from '../utils/trips.js';
import { formatPrice } from '../utils/format.js';
import '../styles/RouteCard.css';

export default function RouteCard({ group, onBook }) {
  const { selectedId, setSelectedId, selected } = useTripSelection(group);
  const low = selected && selected.seats_left <= 5;

  return (
    <article className={`route-card route-card--${group.bus_type.toLowerCase()}`}>
      <div className="route-card__name">
        <h3>{group.origin} - {group.destination}</h3>
        <span className={`badge badge--${group.bus_type.toLowerCase()}`}>{group.bus_type}</span>
      </div>

      <div className="route-card__times">
        <Clock size={20} />
        <div className="chips">
          {group.trips.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={t.id === selectedId}
              disabled={t.seats_left === 0}
              className={'chip' + (t.id === selectedId ? ' chip--selected' : '')}
              onClick={() => setSelectedId(t.id)}
            >
              {fmtTime(t.departure_time)}
            </button>
          ))}
        </div>
      </div>

      <div className="route-card__buy">
        <Banknote size={22} />
        <strong className="route-card__price">
          {selected ? formatPrice(selected.price) : '—'}
        </strong>
        <span className="route-card__per">per passenger</span>
        <span className={'route-card__seats' + (low ? ' is-low' : '')}>
          <Users size={15} />{' '}
          {selected ? `${selected.seats_left} seats left` : 'Sold out'}
        </span>
        <button className="btn" disabled={!selected} onClick={() => onBook(selected)}>
          Book Ticket
        </button>
      </div>
    </article>
  );
}