import {
  revealGrid as cellsActionRevealGrid,
  updateGrid as cellsUpdateGrid,
} from 'redux/cellsSlice';
import testData from 'testData/test.valid.1';
import { initialiseCells } from './cell';
import {
  isCluePopulated,
  getCrossingClueIds,
  initialiseClues,
  getGroupSolutionLength,
} from './clue';
import { store } from './rtl';
import { initialiseStore } from './test';

function getClue(clueId: string) {
  return store.getState().clues.clues.find((clue) => clue.id === clueId);
}

test('isCluePopulated returns false', () => {
  initialiseStore(store, testData);

  const oneAcross = getClue('1-across');
  expect(oneAcross).toBeDefined();
  if (oneAcross === undefined) {
    return;
  }

  const cluePopulated = isCluePopulated(
    oneAcross,
    store.getState().cells.cells,
  );
  expect(cluePopulated).toBeFalsy();
});

test('isCluePopulated returns true', () => {
  initialiseStore(store, testData);
  store.dispatch(cellsActionRevealGrid());

  const oneAcross = getClue('1-across');
  expect(oneAcross).toBeDefined();
  if (oneAcross === undefined) {
    return;
  }

  const cluePopulated = isCluePopulated(
    oneAcross,
    store.getState().cells.cells,
  );
  expect(cluePopulated).toBeTruthy();
});

test('getGroupSolutionLength with one element in group', () => {
  initialiseStore(store, testData);
  const groupSolutionLength = getGroupSolutionLength(
    ['1-across'],
    store.getState().clues.clues,
  );
  expect(groupSolutionLength).toBe(4);
});

test('getGroupSolutionLength with several elements in group', () => {
  initialiseStore(store, testData);
  const groupSolutionLength = getGroupSolutionLength(
    ['2-down', '3-down'],
    store.getState().clues.clues,
  );
  expect(groupSolutionLength).toBe(11);
});

test('getGroupSolutionLength with no elements in group', () => {
  initialiseStore(store, testData);
  const groupSolutionLength = getGroupSolutionLength(
    [],
    store.getState().clues.clues,
  );
  expect(groupSolutionLength).toBe(0);
});

test('getCrossingClueIds', () => {
  initialiseStore(store, testData);

  const fourAcross = getClue('4-across');
  expect(fourAcross).toBeDefined();
  if (fourAcross === undefined) {
    return;
  }

  const crossingClueIds = getCrossingClueIds(
    fourAcross,
    store.getState().cells.cells,
  );
  expect(crossingClueIds).toEqual(['4-across', '1-down', '2-down', '3-down']);
});

test('initialiseClues', () => {
  const cells = initialiseCells(
    testData.dimensions.cols,
    testData.dimensions.rows,
    testData.entries,
  );

  const clues = initialiseClues(testData.entries, cells);
  expect(clues).toEqual([
    {
      id: '1-across',
      number: 1,
      humanNumber: '1',
      clue: 'Toy on a string (2-2)',
      direction: 'across',
      length: 4,
      group: ['1-across'],
      position: { x: 0, y: 0 },
      separatorLocations: { '-': [2] },
      solution: 'YOYO',
      answered: false,
      selected: false,
    },
    {
      id: '4-across',
      number: 4,
      humanNumber: '4',
      clue: 'Have a rest (3,4)',
      direction: 'across',
      length: 7,
      group: ['4-across'],
      position: { x: 0, y: 2 },
      separatorLocations: { ',': [3] },
      solution: 'LIEDOWN',
      answered: false,
      selected: false,
    },
    {
      id: '1-down',
      number: 1,
      humanNumber: '1',
      clue: 'Colour (6)',
      direction: 'down',
      length: 6,
      group: ['1-down'],
      position: { x: 0, y: 0 },
      separatorLocations: {},
      solution: 'YELLOW',
      answered: false,
      selected: false,
    },
    {
      id: '2-down',
      number: 2,
      humanNumber: '2',
      clue: 'Bits and bobs (4,3,4)',
      direction: 'down',
      length: 7,
      group: ['2-down', '3-down'],
      position: { x: 3, y: 0 },
      separatorLocations: { ',': [4] },
      solution: 'ODDSAND',
      answered: false,
      selected: false,
    },
    {
      id: '3-down',
      number: 3,
      humanNumber: '3',
      clue: 'See 2',
      direction: 'down',
      length: 4,
      group: ['2-down', '3-down'],
      position: { x: 6, y: 1 },
      separatorLocations: {},
      solution: 'ENDS',
      answered: false,
      selected: false,
    },
  ]);
});

test('initialiseClues with selected clue', () => {
  const cells = initialiseCells(
    testData.dimensions.cols,
    testData.dimensions.rows,
    testData.entries,
  );

  const clues = initialiseClues(testData.entries, cells, '1-across');
  expect(clues).toEqual(
    expect.arrayContaining([
      {
        id: '1-across',
        number: 1,
        humanNumber: '1',
        clue: 'Toy on a string (2-2)',
        direction: 'across',
        length: 4,
        group: ['1-across'],
        position: { x: 0, y: 0 },
        separatorLocations: { '-': [2] },
        solution: 'YOYO',
        answered: false,
        selected: true,
      },
    ]),
  );
});

test('initialiseClues with answered clues', () => {
  const cells = initialiseCells(
    testData.dimensions.cols,
    testData.dimensions.rows,
    testData.entries,
  );

  // reveal all cells
  store.dispatch(cellsUpdateGrid(cells));
  store.dispatch(cellsActionRevealGrid());

  const clues = initialiseClues(testData.entries, store.getState().cells.cells);

  expect(clues).toEqual([
    {
      id: '1-across',
      number: 1,
      humanNumber: '1',
      clue: 'Toy on a string (2-2)',
      direction: 'across',
      length: 4,
      group: ['1-across'],
      position: { x: 0, y: 0 },
      separatorLocations: { '-': [2] },
      solution: 'YOYO',
      answered: true,
      selected: false,
    },
    {
      id: '4-across',
      number: 4,
      humanNumber: '4',
      clue: 'Have a rest (3,4)',
      direction: 'across',
      length: 7,
      group: ['4-across'],
      position: { x: 0, y: 2 },
      separatorLocations: { ',': [3] },
      solution: 'LIEDOWN',
      answered: true,
      selected: false,
    },
    {
      id: '1-down',
      number: 1,
      humanNumber: '1',
      clue: 'Colour (6)',
      direction: 'down',
      length: 6,
      group: ['1-down'],
      position: { x: 0, y: 0 },
      separatorLocations: {},
      solution: 'YELLOW',
      answered: true,
      selected: false,
    },
    {
      id: '2-down',
      number: 2,
      humanNumber: '2',
      clue: 'Bits and bobs (4,3,4)',
      direction: 'down',
      length: 7,
      group: ['2-down', '3-down'],
      position: { x: 3, y: 0 },
      separatorLocations: { ',': [4] },
      solution: 'ODDSAND',
      answered: true,
      selected: false,
    },
    {
      id: '3-down',
      number: 3,
      humanNumber: '3',
      clue: 'See 2',
      direction: 'down',
      length: 4,
      group: ['2-down', '3-down'],
      position: { x: 6, y: 1 },
      separatorLocations: {},
      solution: 'ENDS',
      answered: true,
      selected: false,
    },
  ]);
});
