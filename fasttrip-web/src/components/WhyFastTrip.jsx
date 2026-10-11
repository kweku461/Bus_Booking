import { Clock, Armchair, ShieldCheck, Ticket } from 'lucide-react';
import '../styles/WhyFastTrip.css';

const REASONS = [
  { icon: Clock, tone: 'indigo', title: '24/7 Booking', text: 'Book anytime, anywhere. No need to queue at the terminal.' },
  { icon: Armchair, tone: 'green', title: 'Seat Selection', text: 'Choose your exact seat on our interactive seat map.' },
  { icon: ShieldCheck, tone: 'gold', title: 'No Double Booking', text: 'A seat is locked the moment it is booked, so nobody else can take it.' },
  { icon: Ticket, tone: 'purple', title: 'Instant E-Ticket', text: 'Get your digital ticket as soon as you confirm, ready to show or print.' },
];

export default function WhyFastTrip() {
  return (
    <section className="container">
      <div className="why">
        <h2>Why Book Online with FastTrip?</h2>
        <p className="why__sub">Fast, simple and fair seat booking for every trip.</p>

        <div className="why__grid">
          {REASONS.map(({ icon: Icon, tone, title, text }) => (
            <article className="why__card" key={title}>
              <span className={`why__icon why__icon--${tone}`}><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}