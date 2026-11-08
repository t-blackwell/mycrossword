import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);

  return () => window.removeEventListener('hashchange', onChange);
}

function getHash() {
  return window.location.hash;
}

// unknown on the server (and while hydrating)
function getServerHash() {
  return '';
}

export default function useLocationHash() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);

  const updateHash = (newHash: string) => {
    if (typeof window !== 'undefined' && newHash !== hash) {
      window.location.hash = newHash;
    }
  };

  return [hash, updateHash] as const;
}
