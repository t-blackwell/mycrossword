import { DEFAULT_CELL_MATCHER } from './general';
import { getGuessGrid, initialiseGuessGrid, validateGuessGrid } from './guess';
import type { Cell, GuessGrid } from '~/types';

describe('initialiseGuessGrid', () => {
  test('it creates a column-first grid of the given character', () => {
    expect(initialiseGuessGrid(3, 2)).toEqual({
      value: [
        ['', ''],
        ['', ''],
        ['', ''],
      ],
    });
    expect(initialiseGuessGrid(1, 2, 'A')).toEqual({ value: [['A', 'A']] });
  });
});

describe('getGuessGrid', () => {
  test("it overlays the cells' guesses", () => {
    const cells = [
      { pos: { col: 0, row: 1 }, guess: 'A' },
      { pos: { col: 2, row: 0 }, guess: undefined },
    ] as Cell[];

    expect(getGuessGrid(3, 2, cells)).toEqual({
      value: [
        ['', 'A'],
        ['', ''],
        ['', ''],
      ],
    });
  });
});

describe('validateGuessGrid', () => {
  const validate = (guessGrid: unknown, cols = 3, rows = 2) =>
    validateGuessGrid(guessGrid as GuessGrid, cols, rows, DEFAULT_CELL_MATCHER);

  test('it accepts a grid of the right shape', () => {
    expect(validate(initialiseGuessGrid(3, 2))).toBe(true);
    expect(
      validate({
        value: [
          ['A', ''],
          ['', 'B'],
          ['C', 'D'],
        ],
      }),
    ).toBe(true);
  });

  test('it rejects invalid characters', () => {
    expect(
      validate({
        value: [
          ['a', ''],
          ['', ''],
          ['', ''],
        ],
      }),
    ).toBe(false);
    expect(
      validate({
        value: [
          ['AB', ''],
          ['', ''],
          ['', ''],
        ],
      }),
    ).toBe(false);
    expect(
      validate({
        value: [
          ['1', ''],
          ['', ''],
          ['', ''],
        ],
      }),
    ).toBe(false);
  });

  test('it rejects a grid with the wrong number of cells', () => {
    expect(validate({ value: [] })).toBe(false);
    expect(validate(initialiseGuessGrid(3, 3))).toBe(false);
  });

  test('it rejects a row-first (transposed) grid', () => {
    // the same number of cells, but 2 arrays of 3 rather than 3 arrays of 2
    expect(validate(initialiseGuessGrid(2, 3))).toBe(false);
  });

  test('it rejects columns of different lengths', () => {
    expect(validate({ value: [['', '', ''], [''], ['', '']] })).toBe(false);
  });

  test("it rejects (rather than throws for) data that isn't a guess grid", () => {
    expect(validate(undefined)).toBe(false);
    expect(validate(null)).toBe(false);
    expect(validate({})).toBe(false);
    expect(validate({ value: 'AB' })).toBe(false);
    expect(validate({ value: [null, null, null] })).toBe(false);
    expect(validate({ value: ['AB', 'CD', 'EF'] })).toBe(false);
    expect(
      validate({
        value: [
          [null, ''],
          ['', ''],
          ['', ''],
        ],
      }),
    ).toBe(false);
    expect(
      validate({
        value: [
          [1, ''],
          ['', ''],
          ['', ''],
        ],
      }),
    ).toBe(false);
  });
});
