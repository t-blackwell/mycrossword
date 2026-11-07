import { getSolutionBoxes, getUsedLetters } from './solution';

const letters = (boxes: ReturnType<typeof getSolutionBoxes>) =>
  boxes.map((box) => box.letter || '_').join('');

test('it fills the boxes in wheel order', () => {
  const boxes = getSolutionBoxes([undefined, undefined, undefined], 'abc');

  expect(letters(boxes)).toBe('ABC');
  expect(boxes.every((box) => box.source === 'auto')).toBe(true);
  expect(getUsedLetters(boxes)).toBe('');
});

test('a grid letter swaps with the box that had it', () => {
  const boxes = getSolutionBoxes(
    ['D', undefined, undefined, undefined],
    'ABCD',
  );

  expect(letters(boxes)).toBe('DBCA');
  expect(boxes[0]).toEqual({ letter: 'D', missing: false, source: 'grid' });
  expect(getUsedLetters(boxes)).toBe('D');
});

test('grid letters keep their place, and later ones swap around them', () => {
  const boxes = getSolutionBoxes([undefined, 'A', 'B', undefined], 'ABCD');

  // A swaps into box 2 (B goes to box 1), then B swaps into box 3 (C to box 1)
  expect(letters(boxes)).toBe('CABD');
  expect(boxes.map((box) => box.source)).toEqual([
    'auto',
    'grid',
    'grid',
    'auto',
  ]);
  expect(getUsedLetters(boxes)).toBe('AB');
});

test('a grid letter already in its box just stays', () => {
  const boxes = getSolutionBoxes(['A', undefined], 'AB');

  expect(letters(boxes)).toBe('AB');
});

test('a grid letter that is not available is missing', () => {
  const boxes = getSolutionBoxes(['X', undefined, undefined], 'AB');

  expect(boxes[0]).toEqual({ letter: 'X', missing: true, source: 'grid' });
  // the A it replaced moves to the empty box
  expect(letters(boxes)).toBe('XBA');
  expect(getUsedLetters(boxes)).toBe('');
});

test('a grid letter can come from the letters left over', () => {
  const boxes = getSolutionBoxes(['C'], 'ABC');

  expect(boxes[0]).toEqual({ letter: 'C', missing: false, source: 'grid' });
});

test('without anagram letters, only grid letters show', () => {
  const boxes = getSolutionBoxes([undefined, 'B', ''], '');

  expect(letters(boxes)).toBe('_B_');
});
