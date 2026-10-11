import { useState } from 'react';

export function useTripSelection(group) {
  const firstOpen = group.trips.find((trip) => trip.seats_left > 0);
  const [selectedId, setSelectedId] = useState(firstOpen ? firstOpen.id : null);
  const selected = group.trips.find((trip) => trip.id === selectedId);

  return { selectedId, setSelectedId, selected };
}