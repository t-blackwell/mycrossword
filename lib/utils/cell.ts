import { Cell, CellPosition, Char, GuardianClue, GuessGrid } from '~/types';

export function mergeCell({
  cells,
  newCell,
  when,
}: {
  cells: Cell[];
  newCell: Cell;
  when?: (cell: Cell) => boolean;
}) {
  return cells.map((cell) => {
    if (
      cell.pos.col === newCell.pos.col &&
      cell.pos.row === newCell.pos.row &&
      (when === undefined || when(cell))
    ) {
      return newCell;
    }

    return cell;
  });
}

/** A key for a cell's position, for looking cells up by position. */
export function getCellKey(pos: CellPosition) {
  return `${pos.col},${pos.row}`;
}

/** Maps cells by their position (see `getCellKey`) for fast lookups. */
export function getCellsByKey(cells: Cell[]) {
  return new Map(cells.map((cell) => [getCellKey(cell.pos), cell]));
}

/**
 * Checks an entry's data that doesn't depend on the other entries' cells.
 * Throws an error if it's invalid.
 */
function validateEntry(
  entry: GuardianClue,
  cols: number,
  rows: number,
  entryIds: Set<string>,
  allowMissingSolutions: boolean,
) {
  if (entry.length < 1) {
    return;
  }

  // an entry's cells are in a line, so its first and last cells are enough
  // to check they're all within the grid
  const across = entry.direction === 'across';
  const { x, y } = entry.position;
  const lastCol = across ? x + entry.length - 1 : x;
  const lastRow = across ? y : y + entry.length - 1;

  if (x < 0 || y < 0 || lastCol >= cols || lastRow >= rows) {
    throw new Error('Crossword data error: out of bounds');
  }

  if (
    !allowMissingSolutions &&
    entry.solution !== undefined &&
    entry.length !== entry.solution.length
  ) {
    throw new Error('Crossword data error: solution length mismatch');
  }

  if (!entry.group.includes(entry.id)) {
    throw new Error('Crossword data error: clue id missing from group');
  }

  if (!entry.group.every((clueId) => entryIds.has(clueId))) {
    throw new Error('Crossword data error: group clue id not found');
  }
}

/**
 * Transpose clue entries to cell array.
 * @param cols
 * @param rows
 * @param entries
 * @returns
 */
export function initialiseCells({
  cols,
  rows,
  entries,
  guessGrid,
  allowMissingSolutions = false,
}: {
  cols: number;
  rows: number;
  entries: GuardianClue[];
  guessGrid?: GuessGrid;
  allowMissingSolutions?: boolean;
}) {
  const cells: Cell[] = [];
  const cellsByKey = new Map<string, Cell>();
  const entryIds = new Set(entries.map((entry) => entry.id));

  entries.forEach((entry) => {
    validateEntry(entry, cols, rows, entryIds, allowMissingSolutions);

    const across = entry.direction === 'across';

    for (let i = 0; i < entry.length; i += 1) {
      const col = across ? entry.position.x + i : entry.position.x;
      const row = across ? entry.position.y : entry.position.y + i;
      const key = getCellKey({ col, row });

      // check if the cell already exists
      const currentCell = cellsByKey.get(key);

      if (currentCell === undefined) {
        const guess = guessGrid?.value[col][row];

        // add cell
        const newCell: Cell = {
          clueIds: [entry.id],
          guess: guess !== '' ? guess : undefined,
          num: i === 0 ? entry.number : undefined,
          pos: { col, row },
          selected: false,
          val: entry.solution?.[i] as Char,
        };

        cells.push(newCell);
        cellsByKey.set(key, newCell);
      } else {
        if (
          across &&
          currentCell.clueIds.some((clueId) => clueId.endsWith('across'))
        ) {
          throw new Error('Crossword data error: overlapping across solutions');
        }

        if (
          !across &&
          currentCell.clueIds.some((clueId) => clueId.endsWith('down'))
        ) {
          throw new Error('Crossword data error: overlapping down solutions');
        }

        const newChar = entry.solution?.[i];

        if (!allowMissingSolutions && currentCell.val !== newChar) {
          throw new Error('Crossword data error: solution character clash');
        }

        // merge cell
        currentCell.num = i === 0 ? entry.number : currentCell.num;
        currentCell.clueIds = [...currentCell.clueIds, entry.id];

        // overwrite with new value
        if (allowMissingSolutions && newChar !== undefined) {
          currentCell.val = newChar as Char;
        }
      }
    }
  });

  return cells;
}

function findByPos(cells: Cell[], cellPos: CellPosition) {
  return cells.find(
    (cell) => cell.pos.col === cellPos.col && cell.pos.row === cellPos.row,
  );
}

export function blankNeighbours(
  cells: Cell[],
  currentCell: Cell,
  across: boolean,
) {
  const cellOne = findByPos(cells, {
    col: currentCell.pos.col - (across ? 0 : 1),
    row: currentCell.pos.row - (across ? 1 : 0),
  });

  const cellTwo = findByPos(cells, {
    col: currentCell.pos.col + (across ? 0 : 1),
    row: currentCell.pos.row + (across ? 1 : 0),
  });

  return cellOne?.guess === undefined && cellTwo?.guess === undefined;
}
