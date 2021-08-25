import { Cell, CellPosition } from 'interfaces';

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
