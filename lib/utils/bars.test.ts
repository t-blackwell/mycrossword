import blockedData from '~/testData/test.valid.1';
import { Direction, GuardianClue } from '~/types';
import { getBars } from './bars';

function entry(
  id: string,
  direction: Direction,
  x: number,
  y: number,
  length: number,
): GuardianClue {
  return {
    id,
    number: 1,
    humanNumber: '1',
    clue: `Clue (${length})`,
    direction,
    length,
    group: [id],
    position: { x, y },
    separatorLocations: {},
  };
}

test('a blocked grid has no bars', () => {
  expect(getBars(blockedData.entries)).toEqual([]);
});

test('bars go between neighbouring cells not in the same entry', () => {
  // A A d
  // A A A
  // with a down entry in the first and last columns
  const entries = [
    entry('a1', 'across', 0, 0, 2),
    entry('a2', 'across', 0, 1, 3),
    entry('d0', 'down', 0, 0, 2),
    entry('d2', 'down', 2, 0, 2),
  ];

  expect(getBars(entries)).toEqual([
    // between the end of a1 and the top of d2
    { col: 2, row: 0, direction: 'across' },
    // between the middle cells, which aren't in a down entry
    { col: 1, row: 1, direction: 'down' },
  ]);
});

test('bars go between neighbouring entries in the same row or column', () => {
  const entries = [
    entry('a1', 'across', 0, 0, 2),
    entry('a2', 'across', 2, 0, 3),
    entry('d1', 'down', 4, 0, 2),
    entry('d2', 'down', 4, 2, 2),
  ];

  expect(getBars(entries)).toEqual([
    { col: 2, row: 0, direction: 'across' },
    { col: 4, row: 2, direction: 'down' },
  ]);
});

test('there are no bars next to cells outside the grid', () => {
  expect(getBars([entry('a1', 'across', 0, 0, 3)])).toEqual([]);
});
