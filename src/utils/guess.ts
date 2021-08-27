import { Cell, GuessGrid } from 'interfaces';

/**
 * Generate empty guess grid.
 * @param cols
 * @param rows
 * @param cells
 * @returns
 */
// eslint-disable-next-line import/prefer-default-export
export function getGuessGrid(cols: number, rows: number, cells?: Cell[]) {
  const grid: GuessGrid = {
    value: new Array(rows).fill('').map(() => new Array(cols).fill('')),
  };

  // overlay the guesses from the cells
  if (cells !== undefined) {
    cells.forEach(({ guess, pos }) => {
      grid.value[pos.col][pos.row] = guess !== undefined ? guess : '';
    });
  }

  return grid;
}
