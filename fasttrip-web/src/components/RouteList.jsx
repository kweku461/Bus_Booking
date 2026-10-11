import RouteCard from './RouteCard.jsx';
import RouteRow from './RouteRow.jsx';
import { useIsDesktop } from '../hooks/useIsDesktop.js';
import '../styles/RouteList.css';

export default function RouteList({ groups }) {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <div className="route-cards">
        {groups.map((g) => <RouteCard key={g.day + g.key} group={g} />)}
      </div>
    );
  }

  return (
    <div className="route-table">
      <div className="route-table__head">
        <span>Traveling From</span>
        <span>Traveling To</span>
        <span>Trip Type</span>
        <span>Schedule</span>
        <span>Price</span>
        <span />
      </div>
      {groups.map((g) => <RouteRow key={g.day + g.key} group={g} />)}
    </div>
  );
}