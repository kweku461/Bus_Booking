import { useNavigate } from 'react-router-dom';
import { useTripSelection } from '../hooks/useTripSelection.js';
import { fmtTime } from '../utils/trips.js';
import '../styles/RouteRow.css';

export default function RouteRow({ group }) {
  const navigate = useNavigate();
  const { selectedId, setSelectedId, selected } = useTripSelection(group);
  const low = selected && selected.seats_left <= 5;
  const type = group.bus_type.toLowerCase();

  return (
    <div className={`route-row route-row--${type}`}>
      <span className="route-row__city">{group.origin}</span>
      <span className="route-row__city">{group.destination}</span>
      <span><span className={`badge badge--${type}`}>{group.bus_type}</span></span>

      <div className="route-row__schedule">
        <strong>{group.weekday}</strong>
        <div className="chips">
          {group.trips.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={t.seats_left === 0}
              className={'chip' + (t.id === selectedId ? ' chip--selected' : '')}
              onClick={() => setSelectedId(t.id)}
            >
              {fmtTime(t.departure_time)}
            </button>
          ))}
        </div>
      </div>

      <div className="route-row__price">
        <strong>GH₵{selected ? Number(selected.price).toFixed(2) : '—'}</strong>
        <small className={low ? 'is-low' : ''}>
          {selected ? `${selected.seats_left} seats left` : 'Sold out'}
        </small>
      </div>

      <button
        className="btn"
        disabled={!selected}
        onClick={() => navigate(`/trips/${selected.id}`)}
      >
        Book Ticket
      </button>
    </div>
  );
}