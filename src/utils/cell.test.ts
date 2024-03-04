import { Char } from '../interfaces';
import { revealGrid as cellsActionRevealGrid } from '../redux/cellsSlice';
import invalidData1 from '../testData/test.invalid.1';
import invalidData2 from '../testData/test.invalid.2';
import invalidData3 from '../testData/test.invalid.3';
import invalidData4 from '../testData/test.invalid.4';
import invalidData5 from '../testData/test.invalid.5';
import invalidData6 from '../testData/test.invalid.6';
import invalidData7 from '../testData/test.invalid.7';
import validData from '../testData/test.valid.1';
import { mergeCell, blankNeighbours, initialiseCells } from './cell';
import { initialiseGuessGrid } from './guess';
import { store } from './rtl';
import { initialiseStore } from './test';

test('mergeCell', () => {
  initialiseStore(store, validData);
  const { cells } = store.getState().cells;
  const newCell = {
    clueIds: [],
    guess: undefined,
    num: 1,
    pos: { col: 0, row: 0 },
    selected: false,
    val: 'X' as Char,
  };
  const mergedCells = mergeCell(newCell, cells);
  expect(mergedCells).toEqual(expect.arrayContaining([newCell]));
});

test('mergeCell with invalid cell position', () => {
  initialiseStore(store, validData);
  const { cells } = store.getState().cells;
  const newCell = {
    clueIds: [],
    guess: undefined,
    num: 1,
    pos: { col: 999, row: 999 },
    selected: false,
    val: 'X' as Char,
  };
  const mergedCells = mergeCell(newCell, cells);
  expect(mergedCells).not.toEqual(expect.arrayContaining([newCell]));
});

test('blankNeighbours with empty cells', () => {
  initialiseStore(store, validData);

  const { cells } = store.getState().cells;
  const currentCell = cells.find(
    (cell) => cell.pos.col === 0 && cell.pos.row === 0,
  );
  expect(currentCell).toBeDefined();
  if (currentCell === undefined) {
    return;
  }

  const hasBlankNeighbours = blankNeighbours(cells, currentCell, true);
  expect(hasBlankNeighbours).toBeTruthy();
});

test('blankNeighbours with neighbours', () => {
  initialiseStore(store, validData);
  store.dispatch(cellsActionRevealGrid());

  const { cells } = store.getState().cells;
  const currentCell = cells.find(
    (cell) => cell.pos.col === 0 && cell.pos.row === 0,
  );
  expect(currentCell).toBeDefined();
  if (currentCell === undefined) {
    return;
  }

  const hasBlankNeighbours = blankNeighbours(cells, currentCell, true);
  expect(hasBlankNeighbours).toBeFalsy();
});

test('blankNeighbours without neighbours', () => {
  initialiseStore(store, validData);
  store.dispatch(cellsActionRevealGrid());

  const { cells } = store.getState().cells;
  const currentCell = cells.find(
    (cell) => cell.pos.col === 1 && cell.pos.row === 0,
  );
  expect(currentCell).toBeDefined();
  if (currentCell === undefined) {
    return;
  }

  const hasBlankNeighbours = blankNeighbours(cells, currentCell, true);
  expect(hasBlankNeighbours).toBeTruthy();
});

test('initialiseCells with invalid data 1', () => {
  expect(() =>
    initialiseCells(
      invalidData1.dimensions.cols,
      invalidData1.dimensions.rows,
      invalidData1.entries,
    ),
  ).toThrow('Crossword data error: solution length mismatch');
});

test('initialiseCells with invalid data 2', () => {
  expect(() =>
    initialiseCells(
      invalidData2.dimensions.cols,
      invalidData2.dimensions.rows,
      invalidData2.entries,
    ),
  ).toThrow('Crossword data error: out of bounds');
});

test('initialiseCells with invalid data 3', () => {
  expect(() =>
    initialiseCells(
      invalidData3.dimensions.cols,
      invalidData3.dimensions.rows,
      invalidData3.entries,
    ),
  ).toThrow('Crossword data error: solution character clash');
});

test('initialiseCells with invalid data 4', () => {
  expect(() =>
    initialiseCells(
      invalidData4.dimensions.cols,
      invalidData4.dimensions.rows,
      invalidData4.entries,
    ),
  ).toThrow('Crossword data error: overlapping across solutions');
});

test('initialiseCells with invalid data 5', () => {
  expect(() =>
    initialiseCells(
      invalidData5.dimensions.cols,
      invalidData5.dimensions.rows,
      invalidData5.entries,
    ),
  ).toThrow('Crossword data error: overlapping down solutions');
});

test('initialiseCells with invalid data 6', () => {
  expect(() =>
    initialiseCells(
      invalidData6.dimensions.cols,
      invalidData6.dimensions.rows,
      invalidData6.entries,
    ),
  ).toThrow('Crossword data error: clue id missing from group');
});

test('initialiseCells with invalid data 7', () => {
  expect(() =>
    initialiseCells(
      invalidData7.dimensions.cols,
      invalidData7.dimensions.rows,
      invalidData7.entries,
    ),
  ).toThrow('Crossword data error: group clue id not found');
});

test('initialiseCells with valid data', () => {
  const cells = initialiseCells(
    validData.dimensions.cols,
    validData.dimensions.rows,
    validData.entries,
  );

  expect(cells.length).toBe(23);
  expect(cells).toEqual([
    {
      clueIds: ['1-across', '1-down'],
      guess: undefined,
      num: 1,
      pos: { col: 0, row: 0 },
      selected: false,
      val: 'Y',
    },
    {
      clueIds: ['1-across'],
      guess: undefined,
      num: undefined,
      pos: { col: 1, row: 0 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['1-across'],
      guess: undefined,
      num: undefined,
      pos: { col: 2, row: 0 },
      selected: false,
      val: 'Y',
    },
    {
      clueIds: ['1-across', '2-down'],
      guess: undefined,
      num: 2,
      pos: { col: 3, row: 0 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['4-across', '1-down'],
      guess: undefined,
      num: 4,
      pos: { col: 0, row: 2 },
      selected: false,
      val: 'L',
    },
    {
      clueIds: ['4-across'],
      guess: undefined,
      num: undefined,
      pos: { col: 1, row: 2 },
      selected: false,
      val: 'I',
    },
    {
      clueIds: ['4-across'],
      guess: undefined,
      num: undefined,
      pos: { col: 2, row: 2 },
      selected: false,
      val: 'E',
    },
    {
      clueIds: ['4-across', '2-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 3, row: 2 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['4-across'],
      guess: undefined,
      num: undefined,
      pos: { col: 4, row: 2 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['4-across'],
      guess: undefined,
      num: undefined,
      pos: { col: 5, row: 2 },
      selected: false,
      val: 'W',
    },
    {
      clueIds: ['4-across', '3-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 6, row: 2 },
      selected: false,
      val: 'N',
    },
    {
      clueIds: ['1-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 0, row: 1 },
      selected: false,
      val: 'E',
    },
    {
      clueIds: ['1-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 0, row: 3 },
      selected: false,
      val: 'L',
    },
    {
      clueIds: ['1-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 0, row: 4 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['1-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 0, row: 5 },
      selected: false,
      val: 'W',
    },
    {
      clueIds: ['2-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 3, row: 1 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['2-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 3, row: 3 },
      selected: false,
      val: 'S',
    },
    {
      clueIds: ['2-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 3, row: 4 },
      selected: false,
      val: 'A',
    },
    {
      clueIds: ['2-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 3, row: 5 },
      selected: false,
      val: 'N',
    },
    {
      clueIds: ['2-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 3, row: 6 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['3-down'],
      guess: undefined,
      num: 3,
      pos: { col: 6, row: 1 },
      selected: false,
      val: 'E',
    },
    {
      clueIds: ['3-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 6, row: 3 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['3-down'],
      guess: undefined,
      num: undefined,
      pos: { col: 6, row: 4 },
      selected: false,
      val: 'S',
    },
  ]);
});

test('initialiseCells with valid data and guess grid', () => {
  const gridChar = 'X';
  const guessGrid = initialiseGuessGrid(
    validData.dimensions.cols,
    validData.dimensions.rows,
    gridChar,
  );
  const cells = initialiseCells(
    validData.dimensions.cols,
    validData.dimensions.rows,
    validData.entries,
    guessGrid,
  );

  expect(cells.length).toBe(23);
  expect(cells).toEqual([
    {
      clueIds: ['1-across', '1-down'],
      guess: gridChar,
      num: 1,
      pos: { col: 0, row: 0 },
      selected: false,
      val: 'Y',
    },
    {
      clueIds: ['1-across'],
      guess: gridChar,
      num: undefined,
      pos: { col: 1, row: 0 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['1-across'],
      guess: gridChar,
      num: undefined,
      pos: { col: 2, row: 0 },
      selected: false,
      val: 'Y',
    },
    {
      clueIds: ['1-across', '2-down'],
      guess: gridChar,
      num: 2,
      pos: { col: 3, row: 0 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['4-across', '1-down'],
      guess: gridChar,
      num: 4,
      pos: { col: 0, row: 2 },
      selected: false,
      val: 'L',
    },
    {
      clueIds: ['4-across'],
      guess: gridChar,
      num: undefined,
      pos: { col: 1, row: 2 },
      selected: false,
      val: 'I',
    },
    {
      clueIds: ['4-across'],
      guess: gridChar,
      num: undefined,
      pos: { col: 2, row: 2 },
      selected: false,
      val: 'E',
    },
    {
      clueIds: ['4-across', '2-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 3, row: 2 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['4-across'],
      guess: gridChar,
      num: undefined,
      pos: { col: 4, row: 2 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['4-across'],
      guess: gridChar,
      num: undefined,
      pos: { col: 5, row: 2 },
      selected: false,
      val: 'W',
    },
    {
      clueIds: ['4-across', '3-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 6, row: 2 },
      selected: false,
      val: 'N',
    },
    {
      clueIds: ['1-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 0, row: 1 },
      selected: false,
      val: 'E',
    },
    {
      clueIds: ['1-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 0, row: 3 },
      selected: false,
      val: 'L',
    },
    {
      clueIds: ['1-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 0, row: 4 },
      selected: false,
      val: 'O',
    },
    {
      clueIds: ['1-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 0, row: 5 },
      selected: false,
      val: 'W',
    },
    {
      clueIds: ['2-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 3, row: 1 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['2-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 3, row: 3 },
      selected: false,
      val: 'S',
    },
    {
      clueIds: ['2-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 3, row: 4 },
      selected: false,
      val: 'A',
    },
    {
      clueIds: ['2-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 3, row: 5 },
      selected: false,
      val: 'N',
    },
    {
      clueIds: ['2-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 3, row: 6 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['3-down'],
      guess: gridChar,
      num: 3,
      pos: { col: 6, row: 1 },
      selected: false,
      val: 'E',
    },
    {
      clueIds: ['3-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 6, row: 3 },
      selected: false,
      val: 'D',
    },
    {
      clueIds: ['3-down'],
      guess: gridChar,
      num: undefined,
      pos: { col: 6, row: 4 },
      selected: false,
      val: 'S',
    },
  ]);
});
