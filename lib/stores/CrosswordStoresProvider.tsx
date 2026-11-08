import * as React from 'react';
import {
  createCrosswordStores,
  CrosswordStores,
  CrosswordStoresContext,
} from './stores';

interface CrosswordStoresProviderProps {
  children: React.ReactNode;
  /** Existing stores to provide, e.g. in tests. Created if not given. */
  stores?: CrosswordStores;
}

/**
 * Provides a crossword's cell and clue stores to the components within it.
 * Each provider has its own stores so that multiple crosswords can be shown
 * on the same page without sharing state.
 */
export default function CrosswordStoresProvider({
  children,
  stores,
}: CrosswordStoresProviderProps) {
  const [ownStores] = React.useState(() => stores ?? createCrosswordStores());

  return (
    <CrosswordStoresContext.Provider value={stores ?? ownStores}>
      {children}
    </CrosswordStoresContext.Provider>
  );
}
