import { Cell, GuessGrid } from 'interfaces';

/**
 * Initialise a guess grid with a single char (default = '').
 * @param cols
 * @param rows
 * @param cells
 * @returns
 */
export function initialiseGuessGrid(
  cols: number,
  rows: number,
  char: string = '',
) {
  const grid: GuessGrid = {
    value: new Array(rows).fill(char).map(() => new Array(cols).fill(char)),
  };
  return grid;
}

/**
 * Generate guess grid from cells.
 * @param cols
 * @param rows
 * @param cells
 * @returns
 */
export function getGuessGrid(cols: number, rows: number, cells: Cell[]) {
  const grid = initialiseGuessGrid(cols, rows);

  // overlay the guesses from the cells
  cells.forEach(({ guess, pos }) => {
    grid.value[pos.col][pos.row] = guess !== undefined ? guess : '';
  });

  return grid;
}
