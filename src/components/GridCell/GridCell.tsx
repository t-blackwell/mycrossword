import classNames from 'classnames';
import * as React from 'react';
import { CellFocus, CellPosition, Char } from './../../interfaces';
import { select as cellsActionSelect } from './../../redux/cellsSlice';
import { select as cluesActionSelect } from './../../redux/cluesSlice';
import { useAppDispatch } from './../../redux/hooks';

export const cellSize = 31;

export const getDimensions = (cellPos: CellPosition) => {
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
  inputRef?: React.RefObject<HTMLInputElement>;
  isHighlighted: boolean;
  isSelected: boolean;
  num?: number;
  onCellFocus?: (cellFocus: CellFocus) => void;
  pos: CellPosition;
  selectedClueIndex: number;
}

function GridCell({
  clueIds,
  guess,
  inputRef,
  isHighlighted,
  isSelected,
  num,
  onCellFocus,
  pos,
  selectedClueIndex,
}: GridCellProps) {
  if (clueIds.length !== 1 && clueIds.length !== 2) {
    throw new Error(
      'Crossword data error: cell does not have 1 or 2 directions',
    );
  }

  const dispatch = useAppDispatch();

  const { xRect, yRect, xNum, yNum, xText, yText } = getDimensions(pos);

  const cellFocus = (cellPos: CellPosition, clueId: string) => {
    if (onCellFocus !== undefined) {
      onCellFocus({
        pos: cellPos,
        clueId,
      });
    }
  };

  const updateSelectedCell = () => {
    let index = selectedClueIndex === -1 ? 0 : selectedClueIndex;

    // highlight the other direction if clicking the selected cell more than once
    if (clueIds.length === 2 && isSelected) {
      index = selectedClueIndex === 0 ? 1 : 0;
    }

    const clueId = clueIds[index];
    dispatch(cluesActionSelect(clueId));

    if (!isSelected) {
      dispatch(cellsActionSelect(pos));
    }

    // cell focus has switched
    if (!isSelected || clueIds.length === 2) {
      cellFocus(pos, clueId);
    }

    inputRef?.current?.focus({ preventScroll: true });
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
    </g>
  );
}

export default React.memo(GridCell);
