import { useNavigate } from 'react-router-dom';
import { useTripSelection } from '../hooks/useTripSelection.js';
import { fmtTime } from '../utils/trips.js';

export default function RouteCard({ group }) {
  const navigate = useNavigate();
  const { selectedId, setSelectedId, selected } = useTripSelection(group);
  const type = group.bus_type.toLowerCase();

  return (
    <article className={`route-card route-card--${type}`}>
      <div className="route-card__heading">
        <div>
          <strong>{group.origin}</strong>
          <span aria-hidden="true"> to </span>
          <strong>{group.destination}</strong>
        </div>
        <span className={`badge badge--${type}`}>{group.bus_type}</span>
      </div>

      <div className="route-card__schedule">
        <strong>{group.weekday}</strong>
        <div className="chips">
          {group.trips.map((trip) => (
            <button
              key={trip.id}
              type="button"
              disabled={trip.seats_left === 0}
              className={'chip' + (trip.id === selectedId ? ' chip--selected' : '')}
              onClick={() => setSelectedId(trip.id)}
            >
              {fmtTime(trip.departure_time)}
            </button>
          ))}
        </div>
      </div>

      <div className="route-card__footer">
        <div>
          <strong>GH₵{selected ? Number(selected.price).toFixed(2) : '—'}</strong>
          <small>{selected ? `${selected.seats_left} seats left` : 'Sold out'}</small>
        </div>
        <button
          className="btn"
          disabled={!selected}
          onClick={() => navigate(`/trips/${selected.id}`)}
        >
          Book Ticket
        </button>
      </div>
    </article>
  );
}