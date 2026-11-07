import { getSolutionBoxes, getUsedLetters } from './solution';

const letters = (boxes: ReturnType<typeof getSolutionBoxes>) =>
  boxes.map((box) => box.letter || '_').join('');

test('it fills the boxes in wheel order', () => {
  const boxes = getSolutionBoxes([undefined, undefined, undefined], [], 'abc');

  expect(letters(boxes)).toBe('ABC');
  expect(boxes.every((box) => box.source === 'auto')).toBe(true);
  expect(getUsedLetters(boxes)).toBe('');
});

test('grid letters come first and are taken from the anagram letters', () => {
  const boxes = getSolutionBoxes(['B', undefined, 'Z'], [], 'ABC');

  expect(letters(boxes)).toBe('BAZ');
  expect(boxes.map((box) => box.source)).toEqual(['grid', 'auto', 'grid']);
  // Z isn't one of the letters; C has nowhere to go
  expect(boxes.map((box) => box.missing)).toEqual([false, false, true]);
  expect(getUsedLetters(boxes)).toBe('B');
});

test('a typed letter swaps with the box that had it', () => {
  const boxes = getSolutionBoxes(
    [undefined, undefined, undefined, undefined],
    ['D'],
    'ABCD',
  );

  expect(letters(boxes)).toBe('DBCA');
  expect(boxes[0]).toEqual({ letter: 'D', missing: false, source: 'typed' });
  expect(getUsedLetters(boxes)).toBe('D');
});

test('typed letters keep their place, and later ones swap around them', () => {
  const boxes = getSolutionBoxes(
    [undefined, undefined, undefined, undefined],
    [undefined, 'A', 'B'],
    'ABCD',
  );

  // A swaps into box 2 (B goes to box 1), then B swaps into box 3 (C to box 1)
  expect(letters(boxes)).toBe('CABD');
  expect(getUsedLetters(boxes)).toBe('AB');
});

test('typing the letter that was already there just keeps it', () => {
  const boxes = getSolutionBoxes([undefined, undefined], ['A'], 'AB');

  expect(letters(boxes)).toBe('AB');
});

test('a cleared box stays empty and its letter moves to a free box', () => {
  const boxes = getSolutionBoxes(
    [undefined, undefined, undefined],
    ['', undefined, undefined],
    'AB',
  );

  expect(letters(boxes)).toBe('_BA');
  expect(boxes[0].source).toBe('typed');
});

test('a typed letter that is not available is missing', () => {
  const boxes = getSolutionBoxes([undefined, undefined], ['X'], 'AB');

  expect(boxes[0]).toEqual({ letter: 'X', missing: true, source: 'typed' });
  // A has nowhere to go, so B stays put
  expect(letters(boxes)).toBe('XB');
  expect(getUsedLetters(boxes)).toBe('');
});

test('a typed letter can come from the letters left over', () => {
  const boxes = getSolutionBoxes([undefined], ['C'], 'ABC');

  expect(boxes[0]).toEqual({ letter: 'C', missing: false, source: 'typed' });
});
