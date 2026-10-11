import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL;

export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/trips`)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(setTrips)
      .catch(() => setError('Could not load trips. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return { trips, loading, error };
}