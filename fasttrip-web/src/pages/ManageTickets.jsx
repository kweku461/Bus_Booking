import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Search } from 'lucide-react';
import Ticket from '../components/Ticket.jsx';
import '../styles/ManageTickets.css';

const API = import.meta.env.VITE_API_URL;

export default function ManageTickets() {
  const [form, setForm] = useState({ reference: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  const update = (key) => (e) => {
    const value = key === 'reference' ? e.target.value.toUpperCase() : e.target.value;
    setForm({ ...form, [key]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const res = await fetch(`${API}/tickets/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();

      if (res.ok) {
        setTicket(body);
      } else {
        setError(body.error || 'Something went wrong.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    }
    setLoading(false);
  };

  const reset = () => {
    setTicket(null);
    setError('');
    setForm({ reference: '', email: '' });
  };

  return (
    <main className="container manage">
      <div className="manage__head">
        <h1>Manage Tickets</h1>
        <p>Enter your booking ID and the email you booked with to view your ticket.</p>
      </div>

      {!ticket && (
        <form className="manage__form" onSubmit={submit}>
          <label className="manage__field">
            Booking ID
            <input
              required
              value={form.reference}
              onChange={update('reference')}
              placeholder="FT-7K3M9QXD"
              maxLength={11}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="manage__field">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="ama@example.com"
            />
          </label>

          {error && <p className="error" role="alert">{error}</p>}

          <button className="btn manage__btn" disabled={loading}>
            <Search size={18} /> {loading ? 'Looking up…' : 'Find my ticket'}
          </button>

          <p className="manage__hint">
            Lost your booking ID? It was shown on your ticket right after payment.
          </p>
        </form>
      )}

      {ticket && (
        <>
          <Ticket
            trip={ticket.trip}
            bookings={ticket.bookings}
            reference={ticket.reference}
            amount={ticket.amount}
          />

          <div className="manage__actions">
            <button className="btn btn--outline" onClick={() => window.print()}>
              <Printer size={18} /> Print ticket
            </button>
            <button className="btn btn--outline" onClick={reset}>
              Look up another ticket
            </button>
            <Link to="/" className="btn">Book another trip</Link>
          </div>
        </>
      )}
    </main>
  );
}