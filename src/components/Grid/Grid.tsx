import classNames from 'classnames';
import { GridCell } from 'components';
import Spinner from 'components/Spinner/Spinner';
import type { Cell, CellPosition, Char, Clue } from 'interfaces';
import * as React from 'react';
import {
  select as cellsActionSelect,
  updateOne as cellsActionUpdateOne,
} from 'redux/cellsSlice';
import { select as cluesActionSelect } from 'redux/cluesSlice';
import { useAppDispatch } from 'redux/hooks';
import { isValidChar } from 'utils/general';
import './Grid.css';

interface GridProps {
  cells: Cell[];
  clues: Clue[];
  height: number;
  isLoading?: boolean;
  width: number;
}

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

export default function Grid({
  cells,
  clues,
  height,
  isLoading = false,
  width,
}: GridProps): JSX.Element {
  const dispatch = useAppDispatch();
  const selectedCell = cells.find((cell) => cell.selected);
  const selectedClue = clues.find((clue) => clue.selected);

  const movePrev = () => {
    if (selectedClue === undefined || selectedCell === undefined) {
      return;
    }

    const atTheStart =
      (selectedClue.direction === 'across' &&
        selectedCell.pos.col === selectedClue.position.x) ||
      (selectedClue.direction === 'down' &&
        selectedCell.pos.row === selectedClue.position.y);

    if (atTheStart) {
      // if we're at the start of the clue, try to move to the previous
      // one in the group if it exists
      const groupIndex = selectedClue.group.indexOf(selectedClue.id);
      if (groupIndex > 0) {
        const prevClueId = selectedClue.group[groupIndex - 1];
        const prevClue = clues.find((clue) => clue.id === prevClueId);

        if (prevClue !== undefined) {
          dispatch(cluesActionSelect(prevClueId));

          dispatch(
            cellsActionSelect({
              col:
                prevClue.position.x +
                (prevClue.direction === 'across' ? prevClue.length - 1 : 0),
              row:
                prevClue.position.y +
                (prevClue.direction === 'down' ? prevClue.length - 1 : 0),
            }),
          );
        }
      }
    } else {
      // move to the previous cell in the clue
      const cellPos: CellPosition =
        selectedClue.direction === 'across'
          ? { col: selectedCell.pos.col - 1, row: selectedCell.pos.row }
          : { col: selectedCell.pos.col, row: selectedCell.pos.row - 1 };
      dispatch(cellsActionSelect(cellPos));
    }
  };

  const moveNext = () => {
    if (selectedClue === undefined || selectedCell === undefined) {
      return;
    }

    const atTheEnd =
      (selectedClue.direction === 'across' &&
        selectedCell.pos.col ===
          selectedClue.position.x + selectedClue.length - 1) ||
      (selectedClue.direction === 'down' &&
        selectedCell.pos.row ===
          selectedClue.position.y + selectedClue.length - 1);

    if (atTheEnd) {
      // if we're at the end of the clue, try to move onto the next
      // one in the group if it exists
      const groupIndex = selectedClue.group.indexOf(selectedClue.id);
      if (selectedClue.group.length - 1 > groupIndex) {
        const nextClueId = selectedClue.group[groupIndex + 1];
        const nextClue = clues.find((clue) => clue.id === nextClueId);

        if (nextClue !== undefined) {
          dispatch(cluesActionSelect(nextClueId));

          dispatch(
            cellsActionSelect({
              col: nextClue.position.x,
              row: nextClue.position.y,
            }),
          );
        }
      }
    } else {
      // move onto the next cell in the clue
      const cellPos: CellPosition =
        selectedClue.direction === 'across'
          ? { col: selectedCell.pos.col + 1, row: selectedCell.pos.row }
          : { col: selectedCell.pos.col, row: selectedCell.pos.row + 1 };
      dispatch(cellsActionSelect(cellPos));
    }
  };

  const moveDirection = (direction: string) => {
    if (selectedClue === undefined || selectedCell === undefined) {
      return;
    }

    let cellPos: CellPosition | undefined;

    switch (direction) {
      case 'Up':
        cellPos = { col: selectedCell.pos.col, row: selectedCell.pos.row - 1 };
        break;
      case 'Down':
        cellPos = { col: selectedCell.pos.col, row: selectedCell.pos.row + 1 };
        break;
      case 'Left':
        cellPos = { col: selectedCell.pos.col - 1, row: selectedCell.pos.row };
        break;
      case 'Right':
        cellPos = { col: selectedCell.pos.col + 1, row: selectedCell.pos.row };
        break;
      default:
        cellPos = undefined;
    }

    if (cellPos !== undefined) {
      const nextCell = cells.find(
        (cell) =>
          cell.pos.col === cellPos?.col && cell.pos.row === cellPos?.row,
      );

      if (nextCell !== undefined) {
        dispatch(cellsActionSelect(cellPos));

        // update the selected clue
        if (
          nextCell?.clueIds.length === 1 &&
          nextCell.clueIds[0] !== selectedClue?.id
        ) {
          dispatch(cluesActionSelect(nextCell.clueIds[0]));
        }
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (selectedCell === undefined) {
      return;
    }
    const key = event.key.toUpperCase();

    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)
    ) {
      // move to the next cell
      moveDirection(event.code.replace('Arrow', ''));
    } else if (['Backspace', 'Delete'].includes(event.code)) {
      // clear the cell's value
      dispatch(
        cellsActionUpdateOne({
          ...selectedCell,
          guess: undefined,
        }),
      );
      if (event.code === 'Backspace') {
        movePrev();
      }
    } else if (isValidChar(key)) {
      // overwrite the cell's value
      dispatch(
        cellsActionUpdateOne({
          ...selectedCell,
          guess: key as Char,
        }),
      );

      moveNext();
    }
  };

  return (
    <div
      className={classNames('Grid', isLoading ? 'Grid--loading' : null)}
      onKeyDown={(event) => {
        // prevent keys scrolling page
        event.preventDefault();
        handleKeyPress(event);
      }}
      role="textbox"
      style={{ minWidth: width, minHeight: height, width, height }}
      tabIndex={0}
    >
      {isLoading ? (
        <Spinner size="standard" />
      ) : (
        <svg preserveAspectRatio="xMinYMin" viewBox={`0 0 ${width} ${height}`}>
          <rect
            className="Grid__background"
            onClick={() => {
              // remove focus from grid (TODO: change to use React.forwardRef?)
              document.querySelectorAll<HTMLElement>('.Grid')[0].blur();
            }}
            width={width}
            height={height}
            x="0"
            y="0"
          />
          {cells.map(({ clueIds, groupAcross, groupDown, guess, num, pos }) => {
            const isSelected = cellPositionMatches(pos, selectedCell?.pos);
            const isHighlighted = appearsInGroup(selectedClue?.id, [
              ...(groupAcross !== undefined ? groupAcross : []),
              ...(groupDown !== undefined ? groupDown : []),
            ]);
            const selectedClueIndex =
              selectedClue !== undefined
                ? clueIds.indexOf(selectedClue.id)
                : -1;

            return (
              <GridCell
                clueIds={clueIds}
                guess={guess}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                key={`${pos.col},${pos.row}`}
                num={num}
                pos={pos}
                selectedClueIndex={selectedClueIndex}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
