import { Link } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import '../styles/Help.css';

const PHONE_DISPLAY = '0535 630 844';
const PHONE_LINK = 'tel:+233535630844';
const WHATSAPP_LINK = 'https://wa.me/233535630844';

const FAQ = [
  {
    title: 'Booking and payment',
    items: [
      {
        q: 'How do I book a ticket?',
        a: 'Go to Routes, pick a date, choose a departure time and press Book Ticket. Confirm your trip details, choose your seats (up to 5 per booking), enter your name and email, then pay securely with Paystack.',
      },
      {
        q: 'How long are my seats held?',
        a: 'Your seats are held for 10 minutes from the moment you continue to payment. If the payment is not completed in that time, the seats are released for other passengers.',
      },
      {
        q: 'Why can I only pick 5 seats?',
        a: 'Each booking is limited to 5 seats. If you are travelling with a bigger group, make more than one booking.',
      },
      {
        q: 'What do the bus types mean?',
        a: 'Standard buses have 44 seats in a 2+2 layout. Executive buses have 30 seats in a 2+1 layout.',
      },
      {
        q: 'What time zone are departure times in?',
        a: 'All departure times are shown in Ghana time, whatever your device is set to.',
      },
    ],
  },
  {
    title: 'Your ticket',
    items: [
      {
        q: 'How do I get my ticket?',
        a: 'Your ticket appears as soon as your payment is confirmed. It shows your booking ID, so save it or print the ticket.',
      },
      {
        q: 'How do I view my ticket again?',
        a: 'Open Manage Tickets and enter your booking ID and the email you booked with.',
        link: { to: '/manage-tickets', label: 'Go to Manage Tickets' },
      },
      {
        q: 'I paid but I did not get a ticket.',
        a: 'Please do not pay again. Try Manage Tickets first. If nothing shows up, contact us with your booking ID or Paystack receipt and we will sort it out.',
      },
      {
        q: 'I lost my booking ID.',
        a: 'It is on your ticket and in your Paystack receipt. If you cannot find it, contact us with the email you booked with.',
      },
    ],
  },
];

export default function Help() {
  return (
    <main className="container help">
      <div className="help__head">
        <h1>Help &amp; Support</h1>
        <p>Answers to common questions, our cancellation policy and how to reach us.</p>
      </div>

      {FAQ.map((section) => (
        <section className="help__section" key={section.title}>
          <h2>{section.title}</h2>
          {section.items.map((item) => (
            <details className="help__item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
              {item.link && <Link to={item.link.to}>{item.link.label}</Link>}
            </details>
          ))}
        </section>
      ))}

      <section className="help__section" id="cancellations">
        <h2>Cancellations and refunds</h2>

        <div className="help__policy">
          <h3>Passenger cancellations</h3>
          <ul>
            <li>
              <strong>Regular trips:</strong> tickets can be cancelled up to 6 hours before the
              scheduled departure.
            </li>
            <li>
              <strong>Morning trips (12:00 AM - 9:00 AM):</strong> tickets must be cancelled at
              least 12 hours before departure.
            </li>
            <li>
              To cancel, contact customer service by phone or WhatsApp with your booking ID and the
              email you booked with.
            </li>
            <li>Cancellations made after the deadline are not eligible for a refund.</li>
            <li>No-shows (passengers who do not board) are not eligible for a refund.</li>
          </ul>

          <h3>Refund processing</h3>
          <ul>
            <li>Approved refunds are processed within 1-2 business days.</li>
            <li>Refunds are made to the original payment method used for the booking.</li>
            <li>Payment processing fees may be deducted from refunds.</li>
            <li>Our team will confirm with you once your refund has been started.</li>
          </ul>

          <h3>Cancellations by FastTrip</h3>
          <p>
            If FastTrip cancels a trip because of mechanical issues, safety concerns or other
            operational reasons, you will get a full refund with no deductions, or you can be
            rebooked on the next available trip at no extra cost.
          </p>
        </div>
      </section>

      <section className="help__contact">
        <h2>Still need help?</h2>
        <p>Call or message us and include your booking ID so we can help faster.</p>
        <div className="help__contact-actions">
          <a className="btn" href={PHONE_LINK}>
            <Phone size={18} /> Call {PHONE_DISPLAY}
          </a>
          <a
            className="btn btn--outline"
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}