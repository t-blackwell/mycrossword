import testData from '~/testData/test.valid.1';
import { initialiseCells } from './cell';
import { initialiseClues } from './clue';
import {
  describeCell,
  describeRemotePlayerCount,
  describeRemotePlayers,
  getClueLabel,
  getPlainClueText,
} from './a11y';
import type { Cell } from '~/types';

function setup() {
  const cells = initialiseCells({
    cols: testData.dimensions.cols,
    rows: testData.dimensions.rows,
    entries: testData.entries,
  });
  const clues = initialiseClues(testData.entries, cells);

  const getCell = (col: number, row: number) =>
    cells.find((cell) => cell.pos.col === col && cell.pos.row === row)!;
  const getClue = (id: string) => clues.find((clue) => clue.id === id)!;

  return { cells, clues, getCell, getClue };
}

describe('getClueLabel', () => {
  test('single clue', () => {
    const { clues, getClue } = setup();
    expect(getClueLabel(getClue('1-across'), clues)).toBe('1 across');
  });

  test('grouped clue', () => {
    const { clues, getClue } = setup();
    expect(getClueLabel(getClue('3-down'), clues)).toBe('2 down, 3 down');
  });
});

describe('getPlainClueText', () => {
  test("uses the group's first clue text", () => {
    const { clues, getClue } = setup();
    expect(getPlainClueText(getClue('3-down'), clues)).toBe(
      'Bits and bobs (4,3,4)',
    );
  });

  test('removes markup and decodes entities', () => {
    const { getClue } = setup();
    const clue = {
      ...getClue('1-across'),
      clue: '<em>Toy</em> on a string &amp; more (2-2)',
    };
    expect(getPlainClueText(clue, [clue])).toBe('Toy on a string & more (2-2)');
  });
});

describe('describeCell', () => {
  test('includes the clue', () => {
    const { cells, clues, getCell, getClue } = setup();

    expect(
      describeCell({
        cell: getCell(0, 0),
        cells,
        clue: getClue('1-across'),
        clues,
        includeClue: true,
      }),
    ).toBe('1 across: Toy on a string (2-2). Letter 1 of 4, blank.');
  });

  test('without the clue', () => {
    const { cells, clues, getCell, getClue } = setup();

    expect(
      describeCell({
        cell: getCell(2, 0),
        cells,
        clue: getClue('1-across'),
        clues,
        includeClue: false,
      }),
    ).toBe('Letter 3 of 4, blank.');
  });

  test('letter position spans grouped clues', () => {
    const { cells, clues, getCell, getClue } = setup();

    // first cell of 3 down, which follows the 7 letters of 2 down
    expect(
      describeCell({
        cell: getCell(6, 1),
        cells,
        clue: getClue('3-down'),
        clues,
        includeClue: true,
      }),
    ).toBe('2 down, 3 down: Bits and bobs (4,3,4). Letter 8 of 11, blank.');
  });

  test('guesses and checked states', () => {
    const { cells, clues, getCell, getClue } = setup();
    const clue = getClue('1-across');
    const say = (cell: Cell) =>
      describeCell({ cell, cells, clue, clues, includeClue: false });

    const cell = getCell(0, 0); // solution Y

    expect(say({ ...cell, guess: 'Y' })).toBe('Letter 1 of 4, Y.');
    expect(say({ ...cell, guess: 'Y', checked: true })).toBe(
      'Letter 1 of 4, Y, correct.',
    );
    expect(say({ ...cell, guess: 'X', checked: true })).toBe(
      'Letter 1 of 4, X, incorrect.',
    );
    expect(say({ ...cell, guess: '' })).toBe('Letter 1 of 4, blank.');
  });
});

describe('describeRemotePlayers', () => {
  const player = (clueId: string, col: number, row: number) => ({
    clueId,
    colour: '#000',
    playerId: clueId,
    pos: { col, row },
  });

  test('no players', () => {
    const { cells, clues } = setup();
    expect(describeRemotePlayers([], cells, clues)).toBe('');
  });

  test('one player', () => {
    const { cells, clues } = setup();
    expect(
      describeRemotePlayers([player('4-across', 2, 2)], cells, clues),
    ).toBe('Another player is at 4 across, letter 3 of 7.');
  });

  test('several players, including in a grouped clue', () => {
    const { cells, clues } = setup();
    expect(
      describeRemotePlayers(
        [player('1-down', 0, 0), player('3-down', 6, 2)],
        cells,
        clues,
      ),
    ).toBe(
      'Other players are at 1 down, letter 1 of 6; 2 down, 3 down, letter 9 of 11.',
    );
  });

  test('players not on a cell in their clue are left out', () => {
    const { cells, clues } = setup();
    expect(
      describeRemotePlayers(
        [
          player('1-across', 12, 12), // not a cell
          player('1-across', 0, 2), // not in the clue
          player('9-across', 0, 0), // not a clue
        ],
        cells,
        clues,
      ),
    ).toBe('');
  });
});

test('describeRemotePlayerCount', () => {
  expect(describeRemotePlayerCount(0)).toBe('No other players are solving.');
  expect(describeRemotePlayerCount(1)).toBe('1 other player is solving.');
  expect(describeRemotePlayerCount(3)).toBe('3 other players are solving.');
});
