import * as React from 'react';
import { CellFocus, CellPosition, Char } from '~/types';
import { useCluesStore } from '~/stores/useCluesStore';
import { useCellsStore } from '~/stores/useCellsStore';
import { getBem } from '~/utils/bem';
import './GridCell.css';

export const CELL_SIZE = 31;

export const getDimensions = (cellPos: CellPosition) => {
  const xRect = 1 + (CELL_SIZE + 1) * cellPos.col;
  const yRect = 1 + (CELL_SIZE + 1) * cellPos.row;
  const xNum = xRect + 1;
  const yNum = yRect + 9;
  const xText = xRect + CELL_SIZE * 0.5;
  const yText = yRect + CELL_SIZE * 0.675;

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

  const bem = getBem('GridCell');
  const selectClue = useCluesStore((state) => state.select);
  const selectCells = useCellsStore((state) => state.select);
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
    selectClue(clueId);

    if (!isSelected) {
      selectCells(pos);
    }

    // cell focus has switched
    if (!isSelected || clueIds.length === 2) {
      cellFocus(pos, clueId);
    }

    inputRef?.current?.focus({ preventScroll: true });
  };

  return (
    <g
      className={bem(
        'GridCell',
        isHighlighted ? 'GridCell--highlighted' : null,
        isSelected ? 'GridCell--selected' : null,
      )}
      onClick={updateSelectedCell}
    >
      <rect
        className={bem('GridCell__rect')}
        x={xRect}
        y={yRect}
        width={CELL_SIZE}
        height={CELL_SIZE}
      />
      {num ? (
        <text className={bem('GridCell__num')} x={xNum} y={yNum}>
          {num}
        </text>
      ) : null}
      <text
        className={bem('GridCell__text')}
        textAnchor="middle"
        x={xText}
        y={yText}
      >
        {guess}
      </text>
    </g>
  );
}

export default React.memo(GridCell);
