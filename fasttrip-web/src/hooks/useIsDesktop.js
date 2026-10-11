import { useEffect, useState } from 'react';

const QUERY = '(min-width: 901px)';

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const onChange = (event) => setIsDesktop(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}