import validData from '~/testData/test.valid.1';
import incompleteData from '~/testData/test.incomplete.1';
import type { Cell, GuardianCrossword } from '~/types';
import {
  blankNeighbours,
  getCellKey,
  getCellsByKey,
  initialiseCells,
  mergeCell,
} from './cell';
import { initialiseGuessGrid } from './guess';

function initialise(
  data: GuardianCrossword,
  options: Partial<Parameters<typeof initialiseCells>[0]> = {},
) {
  return initialiseCells({
    cols: data.dimensions.cols,
    rows: data.dimensions.rows,
    entries: data.entries,
    ...options,
  });
}

function findCell(cells: Cell[], col: number, row: number) {
  return cells.find((cell) => cell.pos.col === col && cell.pos.row === row);
}

describe('initialiseCells', () => {
  test('it creates a cell for each letter, merging crossing letters', () => {
    const cells = initialise(validData);
    const letters = validData.entries.reduce((n, e) => n + e.length, 0);
    // 1-across crosses 1-down and 2-down, 4-across crosses 1-, 2- and 3-down
    expect(cells).toHaveLength(letters - 5);

    expect(findCell(cells, 0, 0)).toEqual({
      clueIds: ['1-across', '1-down'],
      guess: undefined,
      num: 1,
      pos: { col: 0, row: 0 },
      selected: false,
      val: 'Y',
    });
    expect(findCell(cells, 3, 2)).toMatchObject({
      clueIds: ['4-across', '2-down'],
      num: undefined,
      val: 'D',
    });
  });

  test("it adds the guess grid's guesses", () => {
    const guessGrid = initialiseGuessGrid(
      validData.dimensions.cols,
      validData.dimensions.rows,
    );
    guessGrid.value[0][0] = 'X';

    const cells = initialise(validData, { guessGrid });

    expect(findCell(cells, 0, 0)?.guess).toBe('X');
    expect(findCell(cells, 1, 0)?.guess).toBeUndefined();
  });

  test.each([
    [1, 'solution length mismatch'],
    [2, 'out of bounds'],
    [3, 'solution character clash'],
    [4, 'overlapping across solutions'],
    [5, 'overlapping down solutions'],
    [6, 'clue id missing from group'],
    [7, 'group clue id not found'],
  ])('it throws for invalid data %i (%s)', async (n, message) => {
    const { default: data } = await import(`../testData/test.invalid.${n}.ts`);

    expect(() => initialise(data)).toThrow(`Crossword data error: ${message}`);
  });

  test('it allows missing solutions if asked', () => {
    expect(() => initialise(incompleteData)).toThrow();
    expect(() =>
      initialise(incompleteData, { allowMissingSolutions: true }),
    ).not.toThrow();
  });

  test('it throws if any letter is outside the grid', () => {
    const entry = validData.entries[0];

    for (const position of [
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      // the last letter is just past the right edge
      { x: validData.dimensions.cols - entry.length + 1, y: 0 },
      { x: 0, y: validData.dimensions.rows },
    ]) {
      expect(() =>
        initialiseCells({
          ...validData.dimensions,
          entries: [{ ...entry, position }],
        }),
      ).toThrow('Crossword data error: out of bounds');
    }

    // fits exactly
    expect(() =>
      initialiseCells({
        ...validData.dimensions,
        entries: [
          {
            ...entry,
            position: { x: validData.dimensions.cols - entry.length, y: 0 },
          },
        ],
      }),
    ).not.toThrow();
  });
});

describe('getCellsByKey', () => {
  test('it looks up cells by position', () => {
    const cells = initialise(validData);
    const cellsByKey = getCellsByKey(cells);

    expect(cellsByKey.size).toBe(cells.length);
    expect(cellsByKey.get(getCellKey({ col: 3, row: 2 }))).toBe(
      findCell(cells, 3, 2),
    );
    expect(cellsByKey.get(getCellKey({ col: 1, row: 1 }))).toBeUndefined();
  });
});

describe('mergeCell', () => {
  test('it replaces the cell at the same position', () => {
    const cells = initialise(validData);
    const newCell = { ...findCell(cells, 1, 0)!, guess: 'O' as const };
    const merged = mergeCell({ cells, newCell });

    expect(findCell(merged, 1, 0)).toBe(newCell);
    expect(merged.filter((cell, i) => cell !== cells[i])).toEqual([newCell]);
  });

  test('it only replaces the cell when the condition is met', () => {
    const cells = initialise(validData);
    const newCell = { ...findCell(cells, 1, 0)!, guess: 'O' as const };

    expect(mergeCell({ cells, newCell, when: () => false })).toEqual(cells);
  });
});

describe('blankNeighbours', () => {
  test("it checks the cells either side, across the clue's direction", () => {
    const cells = initialise(validData);
    // 1-down's second letter, between 1-down's first and third letters
    const cell = findCell(cells, 0, 1)!;

    expect(blankNeighbours(cells, cell, true)).toBe(true);

    const withGuess = mergeCell({
      cells,
      newCell: { ...findCell(cells, 0, 0)!, guess: 'Y' },
    });

    expect(blankNeighbours(withGuess, cell, true)).toBe(false);
    // the cells to the left and right aren't in the grid
    expect(blankNeighbours(withGuess, cell, false)).toBe(true);
  });
});
