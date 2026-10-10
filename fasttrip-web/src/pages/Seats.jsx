import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/Seats.css';

const API = import.meta.env.VITE_API_URL;
const MAX_SEATS = 5;
const COLS = { Standard: 4, Executive: 3 }; // 2+2 and 2+1 layouts

export default function Seats() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    fetch(`${API}/trips/${id}/seats`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError('Could not load this trip.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <p className="container seats-msg">Loading seats…</p>;
  if (error || !data) {
    return (
      <div className="container seats-msg">
        <p>{error || 'Trip not found.'}</p>
        <Link to="/">Back to trips</Link>
      </div>
    );
  }

  const { trip, taken_seats } = data;
  const cols = COLS[trip.bus_type] || 4;
  const seats = Array.from({ length: trip.total_seats }, (_, i) => i + 1);
  const rows = [];
  for (let i = 0; i < seats.length; i += cols) rows.push(seats.slice(i, i + cols));

  const d = new Date(trip.departure_time);
  const when =
    d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const total = selected.length * Number(trip.price);

  const toggle = (n) => {
    if (taken_seats.includes(n)) return;
    setFormError('');
    setSelected((cur) => {
      if (cur.includes(n)) return cur.filter((s) => s !== n);
      if (cur.length >= MAX_SEATS) return cur;
      return [...cur, n].sort((a, b) => a - b);
    });
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: trip.id, seats: selected, ...form }),
      });
      const body = await res.json();

      if (res.ok) {
        navigate('/confirmation', { state: body });
        return;
      }
      setFormError(body.error || 'Something went wrong.');
      if (res.status === 409) {
        setSelected([]); // someone else got there first, so reload the map
        await load();
      }
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const Seat = ({ n }) => (
    <button
      type="button"
      aria-label={`Seat ${n}`}
      disabled={taken_seats.includes(n)}
      className={
        'seat' +
        (taken_seats.includes(n) ? ' seat--taken' : '') +
        (selected.includes(n) ? ' seat--selected' : '')
      }
      onClick={() => toggle(n)}
    >
      {n}
    </button>
  );

  return (
    <main className="container seats-page">
      <Link to="/" className="back-link"><ArrowLeft size={18} /> Back to trips</Link>

      <div className="seats-head">
        <h1>{trip.origin} → {trip.destination}</h1>
        <span className={`badge badge--${trip.bus_type.toLowerCase()}`}>{trip.bus_type}</span>
        <p>{when}</p>
      </div>

      <div className="seats-layout">
        <section className="bus">
          <div className="bus__front">Front of bus</div>
          <div className="bus__rows">
            {rows.map((row, i) => (
              <div className="bus__row" key={i}>
                <div className="bus__side bus__side--left">
                  {row.slice(0, 2).map((n) => <Seat key={n} n={n} />)}
                </div>
                <div className="bus__side bus__side--right">
                  {row.slice(2).map((n) => <Seat key={n} n={n} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="legend">
            <span><i className="seat-dot" /> Available</span>
            <span><i className="seat-dot seat-dot--selected" /> Selected</span>
            <span><i className="seat-dot seat-dot--taken" /> Taken</span>
          </div>
        </section>

        <form className="panel" onSubmit={submit}>
          <h2>Your booking</h2>
          <p className="panel__seats">
            {selected.length
              ? `Seat${selected.length > 1 ? 's' : ''} ${selected.join(', ')}`
              : `Pick up to ${MAX_SEATS} seats`}
          </p>

          <div className="panel__total">
            <span>Total</span>
            <strong>GH₵{total.toFixed(0)}</strong>
          </div>

          <label className="field">
            Full name
            <input required value={form.name} onChange={update('name')} placeholder="Ama Mensah" />
          </label>
          <label className="field">
            Email
            <input required type="email" value={form.email} onChange={update('email')} placeholder="ama@example.com" />
          </label>
          <label className="field">
            Note (optional)
            <input value={form.note} onChange={update('note')} placeholder="Anything we should know?" />
          </label>

          {formError && <p className="error">{formError}</p>}

          <button className="btn panel__btn" disabled={!selected.length || submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </form>
      </div>
    </main>
  );
}