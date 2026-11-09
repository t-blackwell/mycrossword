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

  if (!Array.isArray(value) || value.length !== cols) {
    return false;
  }

  // index every column and cell rather than using `every`, which skips the
  // holes in sparse arrays e.g. `new Array(rows)`
  for (let col = 0; col < cols; col += 1) {
    const column: unknown = value[col];

    if (!Array.isArray(column) || column.length !== rows) {
      return false;
    }

    for (let row = 0; row < rows; row += 1) {
      const cell: unknown = column[row];

      // empty or a valid character
      if (
        cell !== '' &&
        (typeof cell !== 'string' || !isValidChar(cell, cellMatcher))
      ) {
        return false;
      }
    }
  }

  return true;
}
