import { useState } from 'react';
import { Calendar } from 'lucide-react';
import RouteList from '../components/RouteList.jsx';
import NoDepartures from '../components/NoDepartures.jsx';
import { useTrips } from '../hooks/useTrips.js';
import { localDate, groupRoutes, dayLabel, nextDepartureDate } from '../utils/trips.js';
import '../styles/Routes.css';

const today = localDate(new Date());

export default function RoutesPage() {
  const { trips, loading, error } = useTrips();
  const [date, setDate] = useState(today);

  const visible = trips.filter((t) => localDate(t.departure_time) === date);
  const groups = groupRoutes(visible);
  const nextDate = !loading && visible.length === 0 ? nextDepartureDate(trips, date) : null;

  const changeDate = (e) => {
    const v = e.target.value;
    if (v && v >= today) setDate(v);
  };

  return (
    <main className="container routes-page">
      <div className="routes-head">
        <div>
          <h1>Available Routes</h1>
          <p>
            {loading
              ? 'Loading trips… the server may take a moment to wake up.'
              : `${dayLabel(date)} · ${visible.length} departure${visible.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <label className="routes-date">
          Bus Departure Date
          <span className="routes-date__input">
            <Calendar size={18} />
            <input type="date" value={date} min={today} onChange={changeDate} />
          </span>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      {!loading && !error && groups.length > 0 && <RouteList groups={groups} />}

      {!loading && !error && groups.length === 0 && (
        <NoDepartures date={date} today={today} nextDate={nextDate} onJump={setDate} />
      )}
    </main>
  );
}