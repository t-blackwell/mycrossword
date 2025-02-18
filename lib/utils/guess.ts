import type { Cell, GuessGrid } from '~/types';
import { isValidChar } from './general';

/**
 * Initialise a guess grid with a single char (default = '').
 */
export function initialiseGuessGrid(
  cols: number,
  rows: number,
  char: string = '',
) {
  const grid: GuessGrid = {
    value: new Array(cols).fill(char).map(() => new Array(rows).fill(char)),
  };

  return grid;
}

/**
 * Generate guess grid from cells.
 */
export function getGuessGrid(cols: number, rows: number, cells: Cell[]) {
  const grid = initialiseGuessGrid(cols, rows);

  // overlay the guesses from the cells
  cells.forEach(({ guess, pos }) => {
    grid.value[pos.col][pos.row] = guess !== undefined ? guess : '';
  });

  return grid;
}

export function validateGuessGrid(
  guessGrid: GuessGrid,
  cols: number,
  rows: number,
  cellMatcher: RegExp,
) {
  // check grid has correct total
  const total = guessGrid.value.reduce((count, row) => count + row.length, 0);
  if (total !== cols * rows) {
    return false;
  }

  // check all entries are valid characters
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const cell = guessGrid.value[i][j];
      if (cell !== '' && !isValidChar(cell, cellMatcher)) {
        return false;
      }
    }
  }

  return true;
}
