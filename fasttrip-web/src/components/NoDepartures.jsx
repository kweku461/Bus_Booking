import { dayLabel } from '../utils/trips.js';
import '../styles/NoDepartures.css';

export default function NoDepartures({ date, today, nextDate, onJump }) {
  return (
    <div className="empty">
      <p>
        {date === today
          ? 'No departures left today for this search.'
          : 'No departures on this date for this search.'}
      </p>
      {nextDate && (
        <button className="btn" onClick={() => onJump(nextDate)}>
          See {dayLabel(nextDate)}
        </button>
      )}
    </div>
  );
}