import { useEffect } from 'react';
import {
  AlertTriangle, ArrowRight, Banknote, Bus, Calendar, Check, Clock, MapPin, X,
} from 'lucide-react';
import { fmtTime } from '../utils/trips.js';
import '../styles/ConfirmTripModal.css';

export default function ConfirmTripModal({ trip, onConfirm, onClose }) {
  // Esc closes the popup, and the page behind it doesn't scroll
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const d = new Date(trip.departure_time);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 id="confirm-title">Confirm Your Trip Details</h2>
        <p className="modal__sub">Please verify your journey details before proceeding</p>

        <div className="modal__warning">
          <AlertTriangle size={18} />
          <p>
            <strong>Important:</strong> Please confirm your route is correct. Many passengers
            accidentally select reversed routes (e.g., {trip.destination} to {trip.origin} instead
            of {trip.origin} to {trip.destination}).
          </p>
        </div>

        <div className="modal__route">
          <div>
            <span className="pin pin--from"><MapPin size={22} /></span>
            <small>From</small>
            <strong>{trip.origin}</strong>
          </div>
          <ArrowRight className="modal__arrow" size={26} />
          <div>
            <span className="pin pin--to"><MapPin size={22} /></span>
            <small>To</small>
            <strong>{trip.destination}</strong>
          </div>
        </div>

        <div className="modal__info">
          <div className="modal__tile">
            <small><Calendar size={15} /> Travel Date</small>
            <strong>{date}</strong>
            <span>{weekday}</span>
          </div>
          <div className="modal__tile">
            <small><Clock size={15} /> Departure</small>
            <strong>{fmtTime(trip.departure_time)}</strong>
            <span>{weekday}</span>
          </div>
          <div className="modal__tile">
            <small><Banknote size={15} /> Fare</small>
            <strong>GH₵{Number(trip.price).toFixed(2)}</strong>
            <span>per passenger</span>
          </div>
          <div className="modal__tile">
            <small><Bus size={15} /> Bus</small>
            <strong>{trip.bus_type}</strong>
            <span>{trip.seats_left} seats left</span>
          </div>
        </div>

        <div className="modal__actions">
          <button className="btn btn--block" onClick={onConfirm} autoFocus>
            <Check size={18} /> Yes, this route is correct. Continue
          </button>
          <button className="btn btn--block btn--ghost" onClick={onClose}>
            <X size={18} /> No, let me change. Go back
          </button>
        </div>
      </div>
    </div>
  );
}