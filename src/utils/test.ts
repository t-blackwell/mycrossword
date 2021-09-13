import { EnhancedStore } from '@reduxjs/toolkit';
import { GuardianCrossword, GuessGrid } from 'interfaces';
import { updateGrid as cellsUpdateGrid } from 'redux/cellsSlice';
import { updateGrid as cluesUpdateGrid } from 'redux/cluesSlice';
import { initialiseCells } from './cell';
import { initialiseClues } from './clue';

// eslint-disable-next-line import/prefer-default-export
export function initialiseStore(
  store: EnhancedStore,
  data: GuardianCrossword,
  guessGrid?: GuessGrid,
) {
  const cells = initialiseCells(
    data.dimensions.cols,
    data.dimensions.rows,
    data.entries,
    guessGrid,
  );

  const clues = initialiseClues(data.entries, cells);

  store.dispatch(cellsUpdateGrid(cells));
  store.dispatch(cluesUpdateGrid(clues));
}
