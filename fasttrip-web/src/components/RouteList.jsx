import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RouteCard from './RouteCard.jsx';
import RouteRow from './RouteRow.jsx';
import ConfirmTripModal from './ConfirmTripModal.jsx';
import { useIsDesktop } from '../hooks/useIsDesktop.js';
import '../styles/RouteList.css';

export default function RouteList({ groups }) {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null); // the trip waiting for confirmation

  const list = isDesktop ? (
    <div className="route-table">
      <div className="route-table__head">
        <span>Traveling From</span>
        <span>Traveling To</span>
        <span>Trip Type</span>
        <span>Schedule</span>
        <span>Price</span>
        <span />
      </div>
      {groups.map((g) => <RouteRow key={g.day + g.key} group={g} onBook={setPending} />)}
    </div>
  ) : (
    <div className="route-cards">
      {groups.map((g) => <RouteCard key={g.day + g.key} group={g} onBook={setPending} />)}
    </div>
  );

  return (
    <>
      {list}
      {pending && (
        <ConfirmTripModal
          trip={pending}
          onClose={() => setPending(null)}
          onConfirm={() => navigate(`/trips/${pending.id}`)}
        />
      )}
    </>
  );
}