import { useState } from 'react';

// Which departure time is selected in a route row. Defaults to the first one with seats.
export function useTripSelection(group) {
  const firstOpen = group.trips.find((t) => t.seats_left > 0);
  const [selectedId, setSelectedId] = useState(firstOpen ? firstOpen.id : null);
  const selected = group.trips.find((t) => t.id === selectedId);
  return { selectedId, setSelectedId, selected };
}