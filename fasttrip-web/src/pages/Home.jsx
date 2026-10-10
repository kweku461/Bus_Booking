import { useEffect, useState } from 'react';
import { MapPin, Calendar, Search } from 'lucide-react';
import TripCard from '../components/TripCard.jsx';
import '../styles/Home.css';

const API = import.meta.env.VITE_API_URL;
const EMPTY = { origin: '', destination: '', date: '' };

// YYYY-MM-DD in the browser's own timezone
function localDate(iso) {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);

  useEffect(() => {
    fetch(`${API}/trips`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setTrips)
      .catch(() => setError('Could not load trips. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const origins = [...new Set(trips.map((t) => t.origin))].sort();
  const destinations = [...new Set(trips.map((t) => t.destination))].sort();

  const visible = trips.filter(
    (t) =>
      (!filters.origin || t.origin === filters.origin) &&
      (!filters.destination || t.destination === filters.destination) &&
      (!filters.date || localDate(t.departure_time) === filters.date)
  );

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Your seat, sorted before you leave home.</h1>
          <p>Search intercity trips and pick the exact seat you want.</p>
        </div>
      </section>

      <div className="container">
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters(form);
          }}
        >
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
            <input type="date" value={form.date} onChange={update('date')} />
          </label>

          <button type="submit" className="btn search__btn">
            <Search size={18} /> Search
          </button>
        </form>

        <p className="results-count">
          {loading ? 'Loading trips… the server may take a moment to wake up.' : `${visible.length} trips available`}
        </p>

        {error && <p className="error">{error}</p>}

        <div className="trip-grid">
          {visible.map((t) => <TripCard key={t.id} trip={t} />)}
        </div>

        {!loading && !error && visible.length === 0 && (
          <p className="empty">No trips match your search. Try different cities or a different date.</p>
        )}
      </div>
    </main>
  );
}