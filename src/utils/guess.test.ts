import { revealGrid as cellsActionRevealGrid } from 'redux/cellsSlice';
import testData from 'testData/test.valid.1';
import { getGuessGrid, initialiseGuessGrid } from './guess';
import { store } from './rtl';
import { initialiseStore } from './test';

test('it initialises empty guess grid', () => {
  const gridSize = 13;
  const guessGrid = initialiseGuessGrid(gridSize, gridSize);

  // check row count
  expect(guessGrid.value).toBeDefined();
  expect(guessGrid.value.length).toBe(gridSize);

  // check cell count
  const total = guessGrid.value.reduce((count, row) => count + row.length, 0);
  expect(total).toBe(gridSize * gridSize);

  // check all cells are empty strings
  const flatGuessGrid = guessGrid.value.join().split(',');
  const filtered = flatGuessGrid.filter((cell) => cell === '');
  expect(filtered.length).toBe(gridSize * gridSize);
});

test('it initialises guess grid with char', () => {
  const gridChar = 'X';
  const gridSize = 15;
  const guessGrid = initialiseGuessGrid(gridSize, gridSize, gridChar);

  // check row count
  expect(guessGrid.value).toBeDefined();
  expect(guessGrid.value.length).toBe(gridSize);

  // check cell count
  const total = guessGrid.value.reduce((count, row) => count + row.length, 0);
  expect(total).toBe(gridSize * gridSize);

  // check all cells are 'X'
  const flatGuessGrid = guessGrid.value.join().split(',');
  const filtered = flatGuessGrid.filter((cell) => cell === gridChar);
  expect(filtered.length).toBe(gridSize * gridSize);
});

test('it gets guess grid with defined cells', () => {
  // reveal all cells
  initialiseStore(store, testData);
  store.dispatch(cellsActionRevealGrid());

  const gridSize = testData.dimensions.cols;
  const guessGrid = getGuessGrid(
    gridSize,
    gridSize,
    store.getState().cells.cells,
  );

  // check row count
  expect(guessGrid.value).toBeDefined();
  expect(guessGrid.value.length).toBe(gridSize);

  // check cell count
  const total = guessGrid.value.reduce((count, row) => count + row.length, 0);
  expect(total).toBe(gridSize * gridSize);

  // check cells are correct
  expect(guessGrid.value).toStrictEqual([
    ['Y', 'E', 'L', 'L', 'O', 'W', '', '', '', '', '', '', ''],
    ['O', '', 'I', '', '', '', '', '', '', '', '', '', ''],
    ['Y', '', 'E', '', '', '', '', '', '', '', '', '', ''],
    ['O', 'D', 'D', 'S', 'A', 'N', 'D', '', '', '', '', '', ''],
    ['', '', 'O', '', '', '', '', '', '', '', '', '', ''],
    ['', '', 'W', '', '', '', '', '', '', '', '', '', ''],
    ['', 'E', 'N', 'D', 'S', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ]);
});
