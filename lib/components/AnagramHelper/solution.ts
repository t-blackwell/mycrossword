export type SolutionBox = {
  letter: string;
  /** The letter isn't one of the anagram letters left to use */
  missing: boolean;
  /**
   * grid: the letter in the grid
   * auto: filled from the anagram letters not yet in the grid
   */
  source: 'auto' | 'grid';
};

function takeLetter(letters: string[], letter: string) {
  const index = letters.indexOf(letter);

  if (index === -1) {
    return false;
  }

  letters.splice(index, 1);

  return true;
}

/**
 * Work out what to show in each solution box.
 *
 * The anagram letters fill the boxes in wheel order. Each letter in the grid
 * then takes its box, swapping with the box that had that letter, so entering
 * a letter leaves the rest where they were.
 */
export function getSolutionBoxes(
  /** The grid's letter for each box, if there is one */
  guesses: Array<string | undefined>,
  /** The anagram letters, in wheel order */
  letters: string,
): SolutionBox[] {
  const leftover = letters.toUpperCase().split('');
  const boxes: SolutionBox[] = guesses.map(() => ({
    letter: leftover.shift() ?? '',
    missing: false,
    source: 'auto',
  }));

  const findAuto = (letter: string) =>
    boxes.findIndex((box) => box.source === 'auto' && box.letter === letter);

  boxes.forEach((box, i) => {
    const guess = guesses[i]?.toUpperCase();

    if (guess === undefined || guess === '') {
      return;
    }

    let freed = box.letter;
    box.letter = guess;
    box.source = 'grid';

    if (guess === freed) {
      freed = '';
    } else {
      const swap = findAuto(guess);

      if (swap !== -1) {
        boxes[swap].letter = freed;
        freed = '';
      } else if (!takeLetter(leftover, guess)) {
        box.missing = true;
      }
    }

    // anything freed goes into an empty box, if there is one
    if (freed !== '') {
      const empty = findAuto('');

      if (empty !== -1) {
        boxes[empty].letter = freed;
      } else {
        leftover.push(freed);
      }
    }
  });

  return boxes;
}

/** The anagram letters already in the grid */
export function getUsedLetters(boxes: SolutionBox[]) {
  return boxes
    .filter((box) => box.source === 'grid' && !box.missing)
    .map((box) => box.letter)
    .join('');
}
