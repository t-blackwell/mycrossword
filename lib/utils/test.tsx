import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GuardianCrossword, GuessGrid } from '~/types';
import { initialiseCells } from './cell';
import { initialiseClues } from './clue';
import { createCrosswordStores, CrosswordStores } from '~/stores/stores';
import CrosswordStoresProvider from '~/stores/CrosswordStoresProvider';

export type TestStores = CrosswordStores & {
  /** Renders the UI within a provider for these stores. */
  render: (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
  ) => ReturnType<typeof render>;
};

/**
 * Creates a crossword's stores for a test, initialised from the data if
 * given, along with a `render` function that provides them to the UI.
 */
export function createTestStores(
  data?: GuardianCrossword,
  guessGrid?: GuessGrid,
): TestStores {
  const stores = createCrosswordStores();

  if (data !== undefined) {
    const cells = initialiseCells({
      cols: data.dimensions.cols,
      rows: data.dimensions.rows,
      entries: data.entries,
      guessGrid,
    });

    stores.cells.setState({ cells });
    stores.clues.setState({ clues: initialiseClues(data.entries, cells) });
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <CrosswordStoresProvider stores={stores}>
        {children}
      </CrosswordStoresProvider>
    );
  }

  return {
    ...stores,
    render: (ui, options) => render(ui, { ...options, wrapper: Wrapper }),
  };
}

type ConsoleMessageType = 'info' | 'log' | 'debug' | 'warn' | 'error';

export function suppressConsoleMessage(type: ConsoleMessageType) {
  vi.spyOn(console, type).mockImplementation(() => vi.fn());
}

export function restoreConsoleMessage(type: ConsoleMessageType) {
  vi.spyOn(console, type).mockRestore();
}
