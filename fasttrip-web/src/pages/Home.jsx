import { useRef, useState } from 'react';
import { MapPin, Calendar, Search } from 'lucide-react';
import WhyFastTrip from '../components/WhyFastTrip.jsx';
import RouteList from '../components/RouteList.jsx';
import NoDepartures from '../components/NoDepartures.jsx';
import { useTrips } from '../hooks/useTrips.js';
import { localDate, groupRoutes, dayLabel, nextDepartureDate } from '../utils/trips.js';
import '../styles/Home.css';

const today = localDate(new Date());
const START = { origin: '', destination: '', date: today };

export default function Home() {
  const { trips, loading, error } = useTrips();
  const [form, setForm] = useState(START);
  const [filters, setFilters] = useState(START);
  const resultsRef = useRef(null);

  const origins = [...new Set(trips.map((t) => t.origin))].sort();
  const destinations = [...new Set(trips.map((t) => t.destination))].sort();

  const visible = trips.filter(
    (t) =>
      (!filters.origin || t.origin === filters.origin) &&
      (!filters.destination || t.destination === filters.destination) &&
      localDate(t.departure_time) === filters.date
  );
  const groups = groupRoutes(visible);

  const nextDate =
    !loading && visible.length === 0
      ? nextDepartureDate(trips, filters.date, filters.origin, filters.destination)
      : null;

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSearch = (e) => {
    e.preventDefault();
    setFilters(form);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpTo = (date) => {
    const next = { ...filters, date };
    setForm(next);
    setFilters(next);
  };

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Your seat, sorted before you leave home.</h1>
          <p>Search intercity trips and pick the exact seat you want.</p>
        </div>
      </section>

      <div className="container">
        <form className="search" onSubmit={onSearch}>
          <label className="search__field">
            <MapPin size={18} />
            <select value={form.origin} onChange={update('origin')}>
              <option value="">From: any city</option>
              {origins.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="search__field">
            <MapPin size={18} />
            <select value={form.destination} onChange={update('destination')}>
              <option value="">To: any city</option>
              {destinations.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="search__field">
            <Calendar size={18} />
            <input type="date" value={form.date} min={today} required onChange={update('date')} />
          </label>

          <button type="submit" className="btn search__btn">
            <Search size={18} /> Search
          </button>
        </form>
      </div>

      <WhyFastTrip />

      <div className="container results" ref={resultsRef}>
        <h2 className="results__title">Available trips</h2>
        <p className="results__sub">
          {loading
            ? 'Loading trips… the server may take a moment to wake up.'
            : `${dayLabel(filters.date)} · ${visible.length} departures`}
        </p>

        {error && <p className="error">{error}</p>}

        {!loading && !error && groups.length > 0 && <RouteList groups={groups} />}

        {!loading && !error && groups.length === 0 && (
          <NoDepartures date={filters.date} today={today} nextDate={nextDate} onJump={jumpTo} />
        )}
      </div>
    </main>
  );
}