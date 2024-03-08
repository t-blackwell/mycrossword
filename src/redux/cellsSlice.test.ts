import { CellPosition } from '../interfaces';
import testData from '../testData/test.valid.1';
import { initialiseCells } from '../utils/cell';
import { initialiseStore } from '../utils/test';
import { clearGrid, revealGrid, select, updateGrid } from './cellsSlice';
import { store } from './store';

function getState() {
  return store.getState().cells.cells;
}

test('it updates grid', () => {
  const cells = initialiseCells({
    cols: testData.dimensions.cols,
    rows: testData.dimensions.rows,
    entries: testData.entries,
  });
  store.dispatch(updateGrid(cells));
  expect(getState()).toStrictEqual(cells);
});

test('it selects cell', () => {
  initialiseStore(store, testData);

  // nothing should be selected
  expect(getState().filter((cell) => cell.selected).length).toBe(0);

  // select cell
  const cellPos: CellPosition = { col: 0, row: 0 };
  const nextCellPos: CellPosition = { col: 1, row: 0 };

  store.dispatch(select(cellPos));

  const selectedCell = getState().find(
    (cell) => cell.pos.col === cellPos.col && cell.pos.row === cellPos.row,
  );
  expect(selectedCell).toBeDefined();
  expect(selectedCell?.selected).toBeTruthy();

  // should only be one selection
  expect(getState().filter((cell) => cell.selected).length).toBe(1);

  // make another selection
  store.dispatch(select(nextCellPos));

  const nextSelectedCell = getState().find(
    (cell) =>
      cell.pos.col === nextCellPos.col && cell.pos.row === nextCellPos.row,
  );
  expect(nextSelectedCell).toBeDefined();
  expect(nextSelectedCell?.selected).toBeTruthy();

  // should still only be one selection
  expect(getState().filter((cell) => cell.selected).length).toBe(1);
});

test('it clears/reveals grid', () => {
  initialiseStore(store, testData);

  // reveal all cells
  store.dispatch(revealGrid());

  getState().forEach((cell) => {
    expect(cell.guess).toBe(cell.val);
  });

  // clear all cells
  store.dispatch(clearGrid());

  getState().forEach((cell) => {
    expect(cell.guess).toBeUndefined();
  });
});
