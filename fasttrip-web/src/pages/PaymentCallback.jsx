import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import '../styles/PaymentCallback.css';

const API = import.meta.env.VITE_API_URL;

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reference = params.get('reference') || params.get('trxref');
  const started = useRef(false);
  const [state, setState] = useState({ phase: 'checking', message: '' });

  const verify = async () => {
    setState({ phase: 'checking', message: '' });
    try {
      const res = await fetch(`${API}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const body = await res.json();

      if (res.ok) {
        sessionStorage.setItem('fasttrip:ticket', JSON.stringify(body));
        navigate('/confirmation', { replace: true, state: body });
        return;
      }
      if (res.status === 402) {
        setState({ phase: 'unpaid', message: '' });
      } else {
        setState({ phase: 'problem', message: body.error || 'Something went wrong.' });
      }
    } catch {
      setState({ phase: 'network', message: '' });
    }
  };

  useEffect(() => {
    if (!reference) {
      setState({ phase: 'missing', message: '' });
      return;
    }
    if (started.current) return; // React dev mode runs effects twice
    started.current = true;
    verify();
  }, []);

  const { phase, message } = state;

  return (
    <main className="pay-status">
      {phase === 'checking' && (
        <>
          <div className="spinner" />
          <h1>Confirming your payment…</h1>
          <p>Please don't close or refresh this page.</p>
        </>
      )}

      {phase === 'unpaid' && (
        <>
          <XCircle size={52} className="pay-status__bad" />
          <h1>Payment not completed</h1>
          <p>
            We didn't receive a payment for this booking, so no ticket was issued. Your seats are
            held for up to 10 minutes from when you started, and then they are released.
          </p>
          <span className="pay-status__ref">{reference}</span>
          <div className="pay-status__actions">
            <Link to="/" className="btn">Back to trips</Link>
          </div>
        </>
      )}

      {phase === 'problem' && (
        <>
          <XCircle size={52} className="pay-status__bad" />
          <h1>We hit a problem</h1>
          <p>{message}</p>
          <span className="pay-status__ref">{reference}</span>
          <p className="pay-status__small">Keep this booking ID if you need to contact support.</p>
          <div className="pay-status__actions">
            <Link to="/" className="btn">Back to home</Link>
          </div>
        </>
      )}

      {phase === 'network' && (
        <>
          <XCircle size={52} className="pay-status__bad" />
          <h1>We couldn't confirm your payment</h1>
          <p>
            We couldn't reach the server. If you were charged, please don't pay again. Try
            checking again in a moment.
          </p>
          <span className="pay-status__ref">{reference}</span>
          <div className="pay-status__actions">
            <button className="btn" onClick={verify}>Try again</button>
          </div>
        </>
      )}

      {phase === 'missing' && (
        <>
          <h1>Nothing to confirm</h1>
          <p>This page needs a booking ID. Start from the trips page.</p>
          <div className="pay-status__actions">
            <Link to="/" className="btn">Back to trips</Link>
          </div>
        </>
      )}
    </main>
  );
}