import * as React from 'react';

interface Breakpoint {
  name: string;
  max: number;
}

const breakpoints: Breakpoint[] = [
  { name: 'xs', max: 576 },
  { name: 'sm', max: 768 },
  { name: 'md', max: 992 },
  { name: 'lg', max: 1200 },
  { name: 'xl', max: 1400 },
  { name: 'xxl', max: 99999 },
];

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);

  return () => window.removeEventListener('resize', onChange);
}

/** The first breakpoint (smallest first) the window is narrower than */
function getBreakpoint() {
  return breakpoints.find((bp) => window.innerWidth < bp.max)?.name;
}

// unknown on the server (and while hydrating)
function getServerBreakpoint() {
  return undefined;
}

export default function useBreakpoint() {
  return React.useSyncExternalStore(
    subscribe,
    getBreakpoint,
    getServerBreakpoint,
  );
}
