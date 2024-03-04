import {
  Cell,
  CellPosition,
  Char,
  GuardianClue,
  GuessGrid,
} from '../interfaces';

export function mergeCell(newCell: Cell, cells: Cell[]) {
  return cells.map((cell) => {
    if (cell.pos.col === newCell.pos.col && cell.pos.row === newCell.pos.row) {
      return newCell;
    }
    return cell;
  });
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

/**
 * Transpose clue entries to cell array.
 * @param cols
 * @param rows
 * @param entries
 * @returns
 */
export function initialiseCells(
  cols: number,
  rows: number,
  entries: GuardianClue[],
  guessGrid?: GuessGrid,
) {
  const cells: Cell[] = [];
  const entryIds = entries.map((entry) => entry.id);

  entries.forEach((entry) => {
    for (let i = 0; i < entry.length; i += 1) {
      const across = entry.direction === 'across';
      const col = across ? entry.position.x + i : entry.position.x;
      const row = across ? entry.position.y : entry.position.y + i;

      // grid validation
      if (col < 0 || col >= cols || row < 0 || row >= rows) {
        throw new Error('Crossword data error: out of bounds');
      } else if (
        entry.solution !== undefined &&
        entry.length !== entry.solution.length
      ) {
        throw new Error('Crossword data error: solution length mismatch');
      } else if (!entry.group.includes(entry.id)) {
        throw new Error('Crossword data error: clue id missing from group');
      } else if (!entry.group.every((clueId) => entryIds.includes(clueId))) {
        throw new Error('Crossword data error: group clue id not found');
      }

      // check if the cell already exists
      const currentCell = cells.find(
        ({ pos }) => pos.col === col && pos.row === row,
      );

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
      } else {
        // merge cell
        if (currentCell.val !== entry.solution?.[i]) {
          throw new Error('Crossword data error: solution character clash');
        } else if (
          across &&
          currentCell.clueIds.some((clueId) => clueId.endsWith('across'))
        ) {
          throw new Error('Crossword data error: overlapping across solutions');
        } else if (
          !across &&
          currentCell.clueIds.some((clueId) => clueId.endsWith('down'))
        ) {
          throw new Error('Crossword data error: overlapping down solutions');
        } else {
          currentCell.num = i === 0 ? entry.number : currentCell.num;
          currentCell.clueIds = [...currentCell.clueIds, entry.id];
        }
      }
    }
  });

  return cells;
}
