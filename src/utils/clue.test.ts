import {
  revealGrid as cellsActionRevealGrid,
  updateGrid as cellsUpdateGrid,
} from '../redux/cellsSlice';
import testData from '../testData/test.valid.1';
import { initialiseCells } from './cell';
import {
  isCluePopulated,
  getCrossingClueIds,
  initialiseClues,
  getGroupCells,
  getGroupSeparators,
} from './clue';
import { store } from './rtl';
import { initialiseStore } from './test';

function getClue(clueId: string) {
  return store.getState().clues.clues.find((clue) => clue.id === clueId);
}

describe('getGroupCells', () => {
  test('returns cells in group (1 clue)', () => {
    initialiseStore(store, testData);
    const groupCells = getGroupCells(
      ['1-across'],
      store.getState().cells.cells,
    );
    expect(groupCells.length).toBe(4);
    expect(groupCells[0].val).toBe('Y');
    expect(groupCells[1].val).toBe('O');
    expect(groupCells[2].val).toBe('Y');
    expect(groupCells[3].val).toBe('O');
  });

  test('returns cells in group (2 clues)', () => {
    initialiseStore(store, testData);
    const groupCells = getGroupCells(
      ['2-down', '3-down'],
      store.getState().cells.cells,
    );
    expect(groupCells.length).toBe(11);
    expect(groupCells[0].val).toBe('O');
    expect(groupCells[1].val).toBe('D');
    expect(groupCells[2].val).toBe('D');
    expect(groupCells[3].val).toBe('S');
    expect(groupCells[4].val).toBe('A');
    expect(groupCells[5].val).toBe('N');
    expect(groupCells[6].val).toBe('D');
    expect(groupCells[7].val).toBe('E');
    expect(groupCells[8].val).toBe('N');
    expect(groupCells[9].val).toBe('D');
    expect(groupCells[10].val).toBe('S');
  });

  test('returns cells in group (0 clues)', () => {
    initialiseStore(store, testData);
    const groupCells = getGroupCells([], store.getState().cells.cells);
    expect(groupCells.length).toBe(0);
  });
});

describe('getGroupSeparators', () => {
  test('single clue with no separators', () => {
    initialiseStore(store, testData);
    const groupSeparators = getGroupSeparators(
      ['1-down'],
      store.getState().clues.clues,
    );
    expect(groupSeparators).toEqual({ ',': [], '-': [] });
  });

  test('single clue with separators', () => {
    initialiseStore(store, testData);
    const groupSeparators = getGroupSeparators(
      ['1-across'],
      store.getState().clues.clues,
    );
    expect(groupSeparators).toEqual({ ',': [], '-': [2] });
  });

  test('two clues with separator in first', () => {
    initialiseStore(store, testData);
    const groupSeparators = getGroupSeparators(
      ['2-down', '3-down'],
      store.getState().clues.clues,
    );
    expect(groupSeparators).toEqual({ ',': [4, 7], '-': [] });
  });

  test('three clues with separators in all', () => {
    initialiseStore(store, testData);
    const groupSeparators = getGroupSeparators(
      ['1-across', '4-across', '2-down'],
      store.getState().clues.clues,
    );
    expect(groupSeparators).toEqual({ ',': [7, 15, 18], '-': [2] });
  });
});

describe('isCluePopulated', () => {
  test('returns false', () => {
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

  test('returns true', () => {
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
});

describe('getCrossingClueIds', () => {
  test('returns clue ids that cross', () => {
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
});

describe('initialiseClues', () => {
  test('clues get initialised', () => {
    const cells = initialiseCells({
      cols: testData.dimensions.cols,
      rows: testData.dimensions.rows,
      entries: testData.entries,
    });

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
        separatorLocations: { ',': [4, 7] },
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

  test('clues get initialised with selected clue', () => {
    const cells = initialiseCells({
      cols: testData.dimensions.cols,
      rows: testData.dimensions.rows,
      entries: testData.entries,
    });

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

  test('clues get initialised with answered clues', () => {
    const cells = initialiseCells({
      cols: testData.dimensions.cols,
      rows: testData.dimensions.rows,
      entries: testData.entries,
    });

    // reveal all cells
    store.dispatch(cellsUpdateGrid(cells));
    store.dispatch(cellsActionRevealGrid());

    const clues = initialiseClues(
      testData.entries,
      store.getState().cells.cells,
    );

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
        separatorLocations: { ',': [4, 7] },
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
});
