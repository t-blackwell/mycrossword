import type { CellPosition } from '~/types';

/**
 * Positions (in SVG units) of a cell's rectangle, number and text
 */
export const getDimensions = (cellSize: number, cellPos: CellPosition) => {
  const xRect = 1 + (cellSize + 1) * cellPos.col;
  const yRect = 1 + (cellSize + 1) * cellPos.row;
  const xNum = xRect + 1;
  const yNum = yRect + Math.ceil(cellSize * 0.29);
  const xText = xRect + Math.ceil(cellSize * 0.5);
  const yText = yRect + Math.ceil(cellSize * 0.675);

  return { xRect, yRect, xNum, yNum, xText, yText };
};
