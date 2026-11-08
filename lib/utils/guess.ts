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

/**
 * Whether the guess grid has the right shape for the crossword (an array of
 * `cols` columns, each an array of `rows` strings) and only valid characters.
 *
 * Doesn't trust the type, as the grid may come from storage or a consumer.
 */
export function validateGuessGrid(
  guessGrid: GuessGrid,
  cols: number,
  rows: number,
  cellMatcher: RegExp,
) {
  const value: unknown = guessGrid?.value;

  // check there's an array of rows for each column
  if (
    !Array.isArray(value) ||
    value.length !== cols ||
    !value.every((col) => Array.isArray(col) && col.length === rows)
  ) {
    return false;
  }

  // check all entries are empty or valid characters
  return (value as unknown[][]).every((col) =>
    col.every(
      (cell) =>
        cell === '' ||
        (typeof cell === 'string' && Boolean(isValidChar(cell, cellMatcher))),
    ),
  );
}
