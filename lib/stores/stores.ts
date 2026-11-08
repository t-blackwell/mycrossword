import * as React from 'react';
import { useStore } from 'zustand';
import { createCellsStore, CellsState, CellsStore } from './cellsStore';
import { createCluesStore, CluesState, CluesStore } from './cluesStore';

/** The stores for a single crossword. */
export type CrosswordStores = {
  cells: CellsStore;
  clues: CluesStore;
};

export function createCrosswordStores(): CrosswordStores {
  return {
    cells: createCellsStore(),
    clues: createCluesStore(),
  };
}

export const CrosswordStoresContext =
  React.createContext<CrosswordStores | null>(null);

/**
 * Returns the current crossword's stores, e.g. to read their latest state in
 * an event handler with `getState()`. The stores are stable for the lifetime
 * of the crossword, so they're safe to omit from hook dependencies.
 */
export function useCrosswordStores(): CrosswordStores {
  const stores = React.useContext(CrosswordStoresContext);

  if (stores === null) {
    throw new Error(
      'Crossword stores not found: wrap the component in a CrosswordStoresProvider',
    );
  }

  return stores;
}

/** Selects from the current crossword's cells store. */
export function useCellsStore<T>(selector: (state: CellsState) => T): T {
  return useStore(useCrosswordStores().cells, selector);
}

/** Selects from the current crossword's clues store. */
export function useCluesStore<T>(selector: (state: CluesState) => T): T {
  return useStore(useCrosswordStores().clues, selector);
}
