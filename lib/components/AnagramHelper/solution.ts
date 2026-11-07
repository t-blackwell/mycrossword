export type SolutionBox = {
  letter: string;
  /** The letter isn't one of the anagram letters left to use */
  missing: boolean;
  /**
   * grid: already in the grid (read-only)
   * typed: entered by the user ('' if they cleared the box)
   * auto: filled from the anagram letters not yet used
   */
  source: 'auto' | 'grid' | 'typed';
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
 * Letters already in the grid come first. The remaining anagram letters then
 * fill the other boxes in wheel order. A letter typed into a box swaps with the
 * box that was showing that letter, so the rest stay where they are.
 */
export function getSolutionBoxes(
  /** The grid's letter for each box, if there is one */
  guesses: Array<string | undefined>,
  /** The user's letter for each box, if they've typed in it */
  edits: Array<string | undefined>,
  /** The anagram letters, in wheel order */
  letters: string,
): SolutionBox[] {
  const pool = letters.toUpperCase().split('');
  const boxes: SolutionBox[] = guesses.map((guess) => {
    if (guess === undefined || guess === '') {
      return { letter: '', missing: false, source: 'auto' };
    }

    const letter = guess.toUpperCase();

    return { letter, missing: !takeLetter(pool, letter), source: 'grid' };
  });

  const isAuto = (i: number) => boxes[i].source === 'auto';

  // fill the free boxes in wheel order, keeping any letters left over
  boxes.forEach((box, i) => {
    if (isAuto(i)) {
      box.letter = pool.shift() ?? '';
    }
  });
  const leftover = pool;

  // apply the user's letters, swapping with the box that had each one
  boxes.forEach((box, i) => {
    const edit = edits[i]?.toUpperCase();

    if (box.source !== 'auto' || edit === undefined) {
      return;
    }

    let freed = box.letter;
    box.source = 'typed';
    box.letter = edit;

    if (edit === freed) {
      freed = '';
    } else if (edit !== '') {
      const swap = boxes.findIndex(
        (other, j) => j !== i && isAuto(j) && other.letter === edit,
      );

      if (swap !== -1) {
        boxes[swap].letter = freed;
        freed = '';
      } else if (!takeLetter(leftover, edit)) {
        box.missing = true;
      }
    }

    // anything freed goes into an empty box, if there is one
    if (freed !== '') {
      const empty = boxes.findIndex(
        (other, j) => isAuto(j) && other.letter === '',
      );

      if (empty !== -1) {
        boxes[empty].letter = freed;
      } else {
        leftover.push(freed);
      }
    }
  });

  return boxes;
}

/** The anagram letters taken by the grid or typed by the user */
export function getUsedLetters(boxes: SolutionBox[]) {
  return boxes
    .filter((box) => box.source !== 'auto' && !box.missing)
    .map((box) => box.letter)
    .join('');
}
