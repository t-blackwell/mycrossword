import classNames from 'classnames';
import { CellPosition, Char } from 'interfaces';
import * as React from 'react';
import { select as cellsActionSelect } from 'redux/cellsSlice';
import { select as cluesActionSelect } from 'redux/cluesSlice';
import { useAppDispatch } from 'redux/hooks';
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

interface GridCellProps {
  clueIds: string[];
  guess?: Char;
  isHighlighted: boolean;
  isSelected: boolean;
  num?: number;
  pos: CellPosition;
  selectedClueIndex: number;
}

function GridCell({
  clueIds,
  guess,
  isHighlighted,
  isSelected,
  num,
  pos,
  selectedClueIndex,
}: GridCellProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { xRect, yRect, xNum, yNum, xText, yText } = getDimensions(pos);

  const updateSelectedCell = () => {
    if (!isHighlighted || clueIds.length === 1) {
      // highlight the first direction if unselected or only one
      dispatch(cluesActionSelect(clueIds[0]));
    } else if (clueIds.length === 2 && isSelected) {
      // highlight the other direction if clicking the cell more than once
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

export default React.memo(GridCell);
