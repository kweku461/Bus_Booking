import { Link, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle, Printer } from 'lucide-react';
import Ticket from '../components/Ticket.jsx';
import '../styles/Confirmation.css';

// Keeps the ticket on screen if the page is refreshed during the same visit
function readSaved() {
  try {
    return JSON.parse(sessionStorage.getItem('fasttrip:ticket'));
  } catch {
    return null;
  }
}

export default function Confirmation() {
  const { state } = useLocation();
  const data = state || readSaved();

  if (!data || !data.bookings?.length) return <Navigate to="/" replace />;

  return (
    <main className="container confirm">
      <div className="confirm__head">
        <CheckCircle size={52} />
        <h1>Payment successful</h1>
        <p>
          Your booking is confirmed. Save your booking ID. You can use it with your email on the
          Manage Tickets page to view this ticket again.
        </p>
      </div>

      <Ticket
        trip={data.trip}
        bookings={data.bookings}
        reference={data.reference}
        amount={data.amount}
      />

      <div className="confirm__actions">
        <button className="btn btn--outline" onClick={() => window.print()}>
          <Printer size={18} /> Print ticket
        </button>
        <Link to="/" className="btn">Book another trip</Link>
      </div>
    </main>
  );
}