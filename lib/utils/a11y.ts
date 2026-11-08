import type { Cell, Clue } from '~/types';
import { getGroupCells } from '~/utils/clue';
import { decodeHtmlEntities, sanitize } from '~/utils/html';

/**
 * Get a short label for a clue e.g. "1 across", or for grouped clues
 * "4 across, 23 across".
 */
export function getClueLabel(clue: Clue, clues: Clue[]) {
  return clue.group
    .map((clueId) => clues.find((c) => c.id === clueId) ?? clue)
    .map((c) => `${c.number} ${c.direction}`)
    .join(', ');
}

/**
 * Get the text of a clue (or the first clue in its group, which holds the
 * text for the whole group) without any HTML markup.
 */
export function getPlainClueText(clue: Clue, clues: Clue[]) {
  const parentClue = clues.find((c) => c.id === clue.group[0]) ?? clue;

  return sanitize(decodeHtmlEntities(parentClue.clue));
}

/**
 * Describe the state of a cell for screen reader users, e.g. "blank", "A" or
 * "A, incorrect".
 */
function getCellState(cell: Cell) {
  if (cell.guess === undefined || cell.guess === '') {
    return 'blank';
  }

  if (cell.checked) {
    return `${cell.guess}, ${cell.guess === cell.val ? 'correct' : 'incorrect'}`;
  }

  return cell.guess;
}

interface DescribeCellOptions {
  cell: Cell;
  cells: Cell[];
  clue: Clue;
  clues: Clue[];
  /** Include the clue's label and text e.g. when the clue has changed */
  includeClue: boolean;
}

/**
 * Describe the selected cell for screen reader users, e.g.
 * "1 across: Toy on a string (2-2). Letter 1 of 4, blank."
 */
export function describeCell({
  cell,
  cells,
  clue,
  clues,
  includeClue,
}: DescribeCellOptions) {
  const groupCells = getGroupCells(clue.group, cells);
  const index = groupCells.findIndex(
    (c) => c.pos.col === cell.pos.col && c.pos.row === cell.pos.row,
  );
  const letter =
    index !== -1
      ? `Letter ${index + 1} of ${groupCells.length}, ${getCellState(cell)}.`
      : `${getCellState(cell)}.`;

  if (!includeClue) {
    return letter;
  }

  return `${getClueLabel(clue, clues)}: ${getPlainClueText(clue, clues)}. ${letter}`;
}

/**
 * Class name to hide content visually while keeping it available to screen
 * readers (see MyCrossword.css).
 */
export const VISUALLY_HIDDEN_CLASS = 'MyCrossword__visuallyHidden';
