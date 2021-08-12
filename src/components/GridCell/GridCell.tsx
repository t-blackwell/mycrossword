import classNames from 'classnames';
import { CellPosition, Char } from 'interfaces';
import * as React from 'react';
import { getCells, select as cellsActionSelect } from 'redux/cellsSlice';
import { getClues, select as cluesActionSelect } from 'redux/cluesSlice';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import './GridCell.css';

export const cellSize = 31;

const getDimensions = (cellPos: CellPosition) => {
  const xRect = 1 + (cellSize + 1) * cellPos.col;
  const yRect = 1 + (cellSize + 1) * cellPos.row;
  const xNum = xRect + 1;
  const yNum = yRect + 9;
  const xText = xRect + cellSize * 0.5;
  const yText = yRect + cellSize * 0.675;

  return { xRect, yRect, xNum, yNum, xText, yText };
};

const appearsInGroup = (clueId: string | undefined, group: string[]) =>
  clueId !== undefined && group.includes(clueId);

const cellPositionMatches = (
  cellPosA: CellPosition,
  cellPosB?: CellPosition,
) => {
  if (cellPosB === undefined) {
    return false;
  }
  return cellPosA.col === cellPosB.col && cellPosA.row === cellPosB.row;
};

interface GridCellProps {
  clueIds: string[];
  groupAcross?: string[];
  groupDown?: string[];
  guess?: Char;
  num?: number;
  pos: CellPosition;
}

export default function GridCell({
  clueIds,
  groupAcross,
  groupDown,
  guess,
  num,
  pos,
}: GridCellProps): JSX.Element {
  const dispatch = useAppDispatch();
  const cells = useAppSelector(getCells);
  const clues = useAppSelector(getClues);
  const selectedCell = cells.find((cell) => cell.selected);
  const selectedClue = clues.find((clue) => clue.selected);

  const isSelected = cellPositionMatches(pos, selectedCell?.pos);
  const isHighlighted = appearsInGroup(selectedClue?.id, [
    ...(groupAcross !== undefined ? groupAcross : []),
    ...(groupDown !== undefined ? groupDown : []),
  ]);

  const { xRect, yRect, xNum, yNum, xText, yText } = getDimensions(pos);

  const updateSelectedCell = () => {
    if (!isHighlighted || clueIds.length === 1) {
      // highlight the first direction if unselected or only one
      dispatch(cluesActionSelect(clueIds[0]));
    } else if (clueIds.length === 2 && isSelected) {
      // highlight the other direction if clicking the cell more than once
      const selectedClueIndex =
        selectedClue !== undefined ? clueIds.indexOf(selectedClue.id) : -1;
      const otherIndex = selectedClueIndex === 0 ? 1 : 0;
      dispatch(cluesActionSelect(clueIds[otherIndex]));
    }

    if (!isSelected) {
      const cellPos = { col: pos.col, row: pos.row };
      dispatch(cellsActionSelect(cellPos));
    }
  };

  return (
    <g
      className={classNames(
        'GridCell',
        isHighlighted ? 'GridCell--highlighted' : null,
        isSelected ? 'GridCell--selected' : null,
      )}
      onClick={updateSelectedCell}
    >
      <rect
        className="GridCell__rect"
        x={xRect}
        y={yRect}
        width={cellSize}
        height={cellSize}
      />
      {num ? (
        <text className="GridCell__num" x={xNum} y={yNum}>
          {num}
        </text>
      ) : null}
      <text className="GridCell__text" textAnchor="middle" x={xText} y={yText}>
        {guess}
      </text>
      {isSelected ? (
        <text
          className="GridCell__fakeCursor"
          textAnchor="middle"
          x={xText}
          y={yText}
        >
          |
        </text>
      ) : null}
    </g>
  );
}
