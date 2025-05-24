import * as React from 'react';
import GridCell, { getDimensions } from '~/components/GridCell/GridCell';
import GridInput from '~/components/GridInput/GridInput';
import { isValidChar } from '~/utils/general';
import useDebounce from '~/hooks/useDebounce/useDebounce';
import GridSeparators from '~/components/GridSeparators/GridSeparators';
import {
  Cell,
  CellChange,
  CellFocus,
  CellPosition,
  Char,
  Clue,
  GuardianClue,
  GuessGrid,
} from '~/types';
import { getGuessGrid } from '~/utils/guess';
import { useCellsStore } from '~/stores/useCellsStore';
import { mergeCell } from '~/utils/cell';
import { isCluePopulated } from '~/utils/clue';
import { useCluesStore } from '~/stores/useCluesStore';
import { getBem } from '~/utils/bem';
import './Grid.css';

const ARROWS_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
] as const;

type ArrowKey = (typeof ARROWS_KEYS)[number];

function isArrowKey(key: string): key is ArrowKey {
  return ARROWS_KEYS.includes(key as ArrowKey);
}

function cellPositionMatches(cellPosA: CellPosition, cellPosB?: CellPosition) {
  if (cellPosB === undefined) {
    return false;
  }

  return cellPosA.col === cellPosB.col && cellPosA.row === cellPosB.row;
}

interface GridProps {
  cellMatcher: RegExp;
  cells: Cell[];
  cellSize: number;
  clues: Clue[];
  cols: number;
  guessGrid: GuessGrid;
  inputRef?: React.RefObject<HTMLInputElement>;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  onComplete?: () => void;
  rawClues: GuardianClue[];
  rows: number;
  setGuessGrid: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
}

export default function Grid({
  cellMatcher,
  cells,
  cellSize,
  clues,
  cols,
  guessGrid,
  inputRef,
  onCellChange,
  onCellFocus,
  onComplete,
  rawClues,
  rows,
  setGuessGrid,
}: GridProps) {
  const bem = getBem('Grid');
  const selectedCell = cells.find((cell) => cell.selected);
  const selectedClue = clues.find((clue) => clue.selected);
  const width = cols * cellSize + cols + 1;
  const height = rows * cellSize + rows + 1;
  const [guesses, setGuesses] = React.useState<GuessGrid>(guessGrid);
  const debouncedGuesses: GuessGrid = useDebounce<GuessGrid>(guesses, 1000);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [viewBoxScale, setViewBoxScale] = React.useState<number>(1);

  const selectCells = useCellsStore((state) => state.select);
  const setCells = useCellsStore((state) => state.setCells);
  const selectClue = useCluesStore((state) => state.select);
  const answerClue = useCluesStore((state) => state.answerSome);
  const checkComplete = useCellsStore((state) => state.checkComplete);

  const updateViewBoxScale = React.useCallback(() => {
    if (svgRef.current !== null) {
      const svgWidth = svgRef.current.clientWidth;
      const svgHeight = svgRef.current.clientHeight;
      const scaleX = svgWidth / width;
      const scaleY = svgHeight / height;
      const minScale = Math.min(scaleX, scaleY);

      setViewBoxScale(minScale);
    }
  }, [svgRef.current]);

  React.useEffect(() => {
    window.addEventListener('resize', updateViewBoxScale);
    updateViewBoxScale();

    return function cleanup() {
      window.removeEventListener('resize', updateViewBoxScale);
    };
  }, [updateViewBoxScale]);

  React.useEffect(() => {
    // only update local storage after debounce delay
    setGuessGrid(debouncedGuesses);
  }, [debouncedGuesses]);

  const cellChange = (cell: Cell, newGuess: Char | undefined) => {
    if (onCellChange !== undefined && cell.guess !== newGuess) {
      onCellChange({
        pos: cell.pos,
        guess: newGuess,
        previousGuess: cell.guess,
      });
    }
  };

  const cellFocus = (pos: CellPosition, clueId: string) => {
    if (onCellFocus !== undefined) {
      onCellFocus({
        pos,
        clueId,
      });
    }
  };

  const updateGuesses = (updatedCells: Cell[]) => {
    setGuesses(getGuessGrid(cols, rows, updatedCells));
  };

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
          const prevCluePos = {
            col:
              prevClue.position.x +
              (prevClue.direction === 'across' ? prevClue.length - 1 : 0),
            row:
              prevClue.position.y +
              (prevClue.direction === 'down' ? prevClue.length - 1 : 0),
          };

          selectClue(prevClueId);
          selectCells(prevCluePos);

          cellFocus(prevCluePos, prevClueId);
        }
      }
    } else {
      // move to the previous cell in the clue
      const cellPos: CellPosition =
        selectedClue.direction === 'across'
          ? { col: selectedCell.pos.col - 1, row: selectedCell.pos.row }
          : { col: selectedCell.pos.col, row: selectedCell.pos.row - 1 };
      selectCells(cellPos);

      cellFocus(cellPos, selectedClue.id);
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
          const nextCluePos = {
            col: nextClue.position.x,
            row: nextClue.position.y,
          };

          selectClue(nextClueId);
          selectCells(nextCluePos);

          cellFocus(nextCluePos, nextClueId);
        }
      }
    } else {
      // move onto the next cell in the clue
      const cellPos: CellPosition =
        selectedClue.direction === 'across'
          ? { col: selectedCell.pos.col + 1, row: selectedCell.pos.row }
          : { col: selectedCell.pos.col, row: selectedCell.pos.row + 1 };
      selectCells(cellPos);

      cellFocus(cellPos, selectedClue.id);
    }
  };

  /**
   * Find the next cell on the current row/column (wrap on grid overflow)
   * @param {number} colDelta - Horizontal delta (-1, 0, 1)
   * @param {number} rowDelta - Vertical delta (-1, 0, 1)
   */
  const findNextCell = (colDelta: number, rowDelta: number) => {
    const nextPos = (i: number, amount: number, max: number) => {
      const j = i + amount;

      if (j === -1) {
        return max - 1;
      }
      if (j === max) {
        return 0;
      }

      return j;
    };

    let { col, row } = selectedCell?.pos!;

    // loop won't be infinite as it will always wrap and find the selected cell on the same row/col
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (colDelta === 1 || colDelta === -1) {
        col = nextPos(col, colDelta, cols);
      } else if (rowDelta === 1 || rowDelta === -1) {
        row = nextPos(row, rowDelta, rows);
      }

      const tempCell = cells.find(
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        (cell) => cell.pos.col === col && cell.pos.row === row,
      );

      if (tempCell !== undefined) {
        return tempCell;
      }
    }
  };

  const moveDirection = (direction: ArrowKey) => {
    if (selectedClue === undefined || selectedCell === undefined) {
      return;
    }

    // Get the current cell from cells array to check its clueIds
    const currentCell = cells.find(
      (cell) =>
        cell.pos.col === selectedCell.pos.col &&
        cell.pos.row === selectedCell.pos.row,
    );

    if (!currentCell) {
      return;
    }

    // If the cell has clues in both directions (crossing letters)
    if (currentCell.clueIds.length === 2) {
      const isVerticalArrow =
        direction === 'ArrowUp' || direction === 'ArrowDown';
      const isHorizontalArrow =
        direction === 'ArrowLeft' || direction === 'ArrowRight';

      // Check if we need to switch direction
      if (
        (isVerticalArrow && selectedClue.direction === 'across') ||
        (isHorizontalArrow && selectedClue.direction === 'down')
      ) {
        // Find the other clue ID for this cell (the one that's not currently selected)
        const otherClueId = currentCell.clueIds.find(
          (id) => id !== selectedClue.id,
        );

        if (otherClueId !== undefined) {
          // Switch to the other direction without moving the cell
          selectClue(otherClueId);
          cellFocus(selectedCell.pos, otherClueId);
          return;
        }
      }
    }

    // If we didn't switch directions or the cell only has one clue,
    // perform the original move logic
    let nextCell: Cell | undefined;

    switch (direction) {
      case 'ArrowUp':
        nextCell = findNextCell(0, -1);
        break;
      case 'ArrowDown':
        nextCell = findNextCell(0, 1);
        break;
      case 'ArrowLeft':
        nextCell = findNextCell(-1, 0);
        break;
      case 'ArrowRight':
        nextCell = findNextCell(1, 0);
        break;
      default:
        nextCell = undefined;
    }

    if (nextCell !== undefined) {
      selectCells(nextCell.pos);

      // update the selected clue
      if (!nextCell.clueIds.includes(selectedClue.id)) {
        // try to continue in the same direction
        const nextClueId =
          nextCell.clueIds.find((clueId) =>
            clueId.endsWith(selectedClue.direction),
          ) ?? nextCell.clueIds[0];

        selectClue(nextClueId);

        cellFocus(nextCell.pos, nextClueId);
      } else {
        cellFocus(nextCell.pos, selectedClue.id);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (selectedClue === undefined || selectedCell === undefined) {
      return;
    }

    // whitelist keys
    if (
      ![
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Backspace',
        'Delete',
        'Tab',
      ].includes(event.key)
    ) {
      return;
    }

    // prevent keys scrolling page
    event.preventDefault();

    // prevent arrow keys propagating to window
    event.stopPropagation();

    if (isArrowKey(event.key)) {
      // move to the next cell
      moveDirection(event.key);
    } else if (['Backspace', 'Delete'].includes(event.key)) {
      cellChange(selectedCell, undefined);

      // clear the cell's value
      const updatedCell: Cell = {
        ...selectedCell,
        guess: undefined,
      };

      const updatedCells = mergeCell(updatedCell, cells);
      setCells(updatedCells);

      // mark clue(s) as unanswered (ones in group and crossing)
      selectedCell.clueIds.forEach((clueId) => {
        const clue = clues.find((c) => c.id === clueId);

        if (clue) {
          const populated = isCluePopulated(clue, updatedCells);
          answerClue(clue.group, populated);
        }
      });

      if (event.key === 'Backspace') {
        movePrev();
      }

      updateGuesses(updatedCells);
    } else if (event.key === 'Tab') {
      // cycle through the clues
      const index = clues.findIndex((clue) => clue.selected);
      let nextIndex = 0;

      // forwards or backwards
      if (event.shiftKey) {
        nextIndex = index > 0 ? index - 1 : clues.length - 1;
      } else {
        nextIndex = index < clues.length - 1 ? index + 1 : 0;
      }
      const nextClue = clues[nextIndex];
      const nextCluePos = {
        col: nextClue.position.x,
        row: nextClue.position.y,
      };

      selectClue(nextClue.id);
      selectCells(nextCluePos);

      cellFocus(nextCluePos, nextClue.id);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedClue === undefined || selectedCell === undefined) {
      return;
    }

    const key = event.target.value.toUpperCase();

    if (isValidChar(key, cellMatcher)) {
      cellChange(selectedCell, key as Char);

      const updatedCell: Cell = {
        ...selectedCell,
        guess: key as Char,
      };

      const updatedCells = mergeCell(updatedCell, cells);

      // overwrite the cell's value
      setCells(updatedCells);

      // if all clue's cells are populated, mark clue as answered
      selectedCell.clueIds.forEach((clueId) => {
        const clue = clues.find((c) => c.id === clueId)!;
        const populated = isCluePopulated(clue, updatedCells);

        if (populated) {
          answerClue(clue.group, true);
        }
      });

      moveNext();

      // if all grid's cells are populated, mark crossword as complete
      if (onComplete !== undefined) {
        if (checkComplete() === true) {
          onComplete();
        }
      }

      updateGuesses(updatedCells);
    } else {
      // prevent keys scrolling page
      event.preventDefault();
    }
  };

  const dimensions =
    selectedCell !== undefined
      ? getDimensions(cellSize, selectedCell.pos)
      : undefined;

  return (
    <div
      className={bem('Grid')}
      data-testid="grid"
      style={{
        minWidth: width,
        minHeight: height,
        width,
        height,
        aspectRatio: `${cols} / ${rows}`,
      }}
    >
      <svg
        preserveAspectRatio="xMinYMin"
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
      >
        <rect
          className={bem('Grid__background')}
          onMouseDown={(event) => {
            event.preventDefault();

            const inputElement =
              document.querySelector<HTMLInputElement>('.GridInput');
            if (inputElement !== null) {
              inputElement.blur();
            }
          }}
          width={width}
          height={height}
          x="0"
          y="0"
        />
        {cells.map(({ clueIds, guess, num, pos }) => {
          const isSelected = cellPositionMatches(pos, selectedCell?.pos);
          const isHighlighted = clueIds.some((clueId) =>
            selectedClue?.group.includes(clueId),
          );

          const selectedClueIndex =
            selectedClue !== undefined ? clueIds.indexOf(selectedClue.id) : -1;

          return (
            <GridCell
              cellSize={cellSize}
              clueIds={clueIds}
              guess={guess}
              inputRef={inputRef}
              isHighlighted={isHighlighted}
              isSelected={isSelected}
              key={`${pos.col},${pos.row}`}
              num={num}
              onCellFocus={onCellFocus}
              pos={pos}
              selectedClueIndex={selectedClueIndex}
            />
          );
        })}
        <GridSeparators cellSize={cellSize} clues={rawClues} />
      </svg>
      <div
        className={bem('Grid__inputContainer')}
        style={{
          width:
            selectedCell !== undefined ? cellSize * viewBoxScale : undefined,
          height:
            selectedCell !== undefined ? cellSize * viewBoxScale : undefined,
          top:
            dimensions?.yRect !== undefined
              ? dimensions.yRect * viewBoxScale
              : undefined,
          left:
            dimensions?.xRect !== undefined
              ? dimensions.xRect * viewBoxScale
              : undefined,
        }}
      >
        <GridInput
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          visible={selectedCell !== undefined}
        />
      </div>
    </div>
  );
}
