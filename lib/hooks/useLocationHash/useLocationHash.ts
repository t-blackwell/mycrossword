import { useState, useEffect } from 'react';

export default function useLocationHash() {
  const [hash, setHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash : '',
  );

  useEffect(() => {
    setHash(window.location.hash);

    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateHash = (newHash: string) => {
    if (typeof window !== 'undefined' && newHash !== hash) {
      window.location.hash = newHash;
    }
  };

  return [hash, updateHash] as const;
}
