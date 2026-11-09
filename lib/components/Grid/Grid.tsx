import * as React from 'react';
import GridCell from '~/components/GridCell/GridCell';
import { getDimensions } from '~/components/GridCell/dimensions';
import GridInput from '~/components/GridInput/GridInput';
import { isValidChar } from '~/utils/general';
import useDebounce from '~/hooks/useDebounce/useDebounce';
import { useEventCallback } from '~/hooks/useEventCallback/useEventCallback';
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
  RemotePlayer,
} from '~/types';
import { getGuessGrid } from '~/utils/guess';
import {
  useCellsStore,
  useCluesStore,
  useCrosswordStores,
} from '~/stores/stores';
import { getCellKey, getCellsByKey, mergeCell } from '~/utils/cell';
import { isCluePopulated } from '~/utils/clue';
import { getBem } from '~/utils/bem';
import { describeCell, VISUALLY_HIDDEN_CLASS } from '~/utils/a11y';
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
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  onComplete?: () => void;
  /** Called when the user presses Escape to leave the grid */
  onEscape?: () => void;
  rawClues: GuardianClue[];
  /** Other players solving the crossword, whose selected cells are shown */
  remotePlayers?: RemotePlayer[];
  rows: number;
  setGuessGrid: (value: GuessGrid) => void;
}

export default function Grid({
  cellMatcher,
  cells,
  cellSize,
  clues,
  cols,
  inputRef,
  onCellChange,
  onCellFocus,
  onComplete,
  onEscape,
  rawClues,
  remotePlayers = [],
  rows,
  setGuessGrid,
}: GridProps) {
  const bem = getBem('Grid');
  const selectedCell = cells.find((cell) => cell.selected);
  const cellsByKey = React.useMemo(() => getCellsByKey(cells), [cells]);
  const selectedClue = clues.find((clue) => clue.selected);
  const width = cols * cellSize + cols + 1;
  const height = rows * cellSize + rows + 1;
  // the latest guesses to save (null until there's a change to save)
  const [guesses, setGuesses] = React.useState<GuessGrid | null>(null);
  const debouncedGuesses = useDebounce<GuessGrid | null>(guesses, 1000);
  const unsavedGuessesRef = React.useRef<GuessGrid | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [viewBoxScale, setViewBoxScale] = React.useState<number>(1);
  const localInputRef = React.useRef<HTMLInputElement>(null);
  const gridInputRef = inputRef ?? localInputRef;
  const instructionsId = React.useId();

  // screen reader announcement of the selected cell, made via a live region
  // as focus stays on the same input while the selection moves
  const [announcement, setAnnouncement] = React.useState('');
  const lastAnnouncedRef = React.useRef<string | undefined>(undefined);
  const lastAnnouncedGroupRef = React.useRef<string | undefined>(undefined);

  const stores = useCrosswordStores();
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
  }, [width, height]);

  // rescale when the grid's size changes, which isn't only when the window
  // is resized (e.g. the page layout or the grid's container changes)
  React.useEffect(() => {
    updateViewBoxScale();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateViewBoxScale);

      return () => window.removeEventListener('resize', updateViewBoxScale);
    }

    const svg = svgRef.current;

    if (svg === null) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => updateViewBoxScale());
    resizeObserver.observe(svg);

    return () => resizeObserver.disconnect();
  }, [updateViewBoxScale]);

  // a stable reference to the latest setGuessGrid, as it may be a consumer's
  // saveGrid that changes on every render: saving whenever it changed would
  // write the debounced (possibly stale) guesses over newer ones
  const saveGuessGrid = useEventCallback(setGuessGrid);

  // the latest guesses, which may have changed since they were debounced
  // (e.g. the grid was cleared, or another player made a change)
  const saveLatestGuesses = useEventCallback(() => {
    saveGuessGrid(getGuessGrid(cols, rows, stores.cells.getState().cells));
  });

  React.useEffect(() => {
    // only save after the debounce delay. Nothing is saved when mounting, as
    // that could overwrite progress that's yet to be restored
    if (debouncedGuesses !== null) {
      saveLatestGuesses();

      if (unsavedGuessesRef.current === debouncedGuesses) {
        unsavedGuessesRef.current = null;
      }
    }
  }, [debouncedGuesses, saveLatestGuesses]);

  // save any changes still waiting for the debounce delay when unmounting,
  // e.g. when the anagram helper is opened
  React.useEffect(
    () => () => {
      if (unsavedGuessesRef.current !== null) {
        saveLatestGuesses();
        unsavedGuessesRef.current = null;
      }
    },
    [saveLatestGuesses],
  );

  /**
   * Announce the selected cell (and its clue if the clue has changed) if it
   * differs from the last announcement.
   */
  const announceSelection = React.useCallback(
    (currentCells: Cell[], currentClues: Clue[]) => {
      const cell = currentCells.find((c) => c.selected);
      const clue = currentClues.find((c) => c.selected);

      if (cell === undefined || clue === undefined) {
        return;
      }

      const key = [
        clue.id,
        cell.pos.col,
        cell.pos.row,
        cell.guess ?? '',
        cell.checked === true,
      ].join('|');

      if (key === lastAnnouncedRef.current) {
        return;
      }

      const group = clue.group[0] ?? clue.id;

      setAnnouncement(
        describeCell({
          cell,
          cells: currentCells,
          clue,
          clues: currentClues,
          includeClue: group !== lastAnnouncedGroupRef.current,
        }),
      );

      lastAnnouncedRef.current = key;
      lastAnnouncedGroupRef.current = group;
    },
    [],
  );

  // announce changes to the selected cell while the grid has focus
  React.useEffect(() => {
    if (
      gridInputRef.current !== null &&
      document.activeElement === gridInputRef.current
    ) {
      announceSelection(cells, clues);
    }
  }, [cells, clues, gridInputRef, announceSelection]);

  const handleFocus = () => {
    // read from the stores as they may have been updated (e.g. by clicking a
    // cell or clue) since this component last rendered
    const currentCells = stores.cells.getState().cells;
    const currentClues = stores.clues.getState().clues;

    // select the first clue when focusing the grid using the keyboard
    if (
      currentClues.length > 0 &&
      !currentCells.some((cell) => cell.selected)
    ) {
      const firstClue =
        currentClues.find((clue) => clue.selected) ?? currentClues[0];
      const firstCluePos = {
        col: firstClue.position.x,
        row: firstClue.position.y,
      };

      selectClue(firstClue.id);
      selectCells(firstCluePos);
      cellFocus(firstCluePos, firstClue.id);
    }

    // always announce the clue and cell when the grid gains focus
    lastAnnouncedRef.current = undefined;
    lastAnnouncedGroupRef.current = undefined;
    announceSelection(
      stores.cells.getState().cells,
      stores.clues.getState().clues,
    );
  };

  const handleBlur = () => {
    // clear the announcement so it's repeated when the grid regains focus
    setAnnouncement('');
    lastAnnouncedRef.current = undefined;
    lastAnnouncedGroupRef.current = undefined;
  };

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
    const updatedGuesses = getGuessGrid(cols, rows, updatedCells);
    unsavedGuessesRef.current = updatedGuesses;
    setGuesses(updatedGuesses);
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
   * @param {CellPosition} from - Position to start from
   * @param {number} colDelta - Horizontal delta (-1, 0, 1)
   * @param {number} rowDelta - Vertical delta (-1, 0, 1)
   */
  const findNextCell = (
    from: CellPosition,
    colDelta: number,
    rowDelta: number,
  ) => {
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

    let { col, row } = from;

    // loop won't be infinite as it will always wrap and find the selected cell on the same row/col
    while (true) {
      if (colDelta === 1 || colDelta === -1) {
        col = nextPos(col, colDelta, cols);
      } else if (rowDelta === 1 || rowDelta === -1) {
        row = nextPos(row, rowDelta, rows);
      }

      const tempCell = cellsByKey.get(getCellKey({ col, row }));

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
    const currentCell = cellsByKey.get(getCellKey(selectedCell.pos));

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
        nextCell = findNextCell(selectedCell.pos, 0, -1);
        break;
      case 'ArrowDown':
        nextCell = findNextCell(selectedCell.pos, 0, 1);
        break;
      case 'ArrowLeft':
        nextCell = findNextCell(selectedCell.pos, -1, 0);
        break;
      case 'ArrowRight':
        nextCell = findNextCell(selectedCell.pos, 1, 0);
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
    // leave the grid (Tab is used to move between clues)
    if (event.key === 'Escape') {
      event.preventDefault();

      if (onEscape !== undefined) {
        onEscape();
      } else {
        event.currentTarget.blur();
      }

      return;
    }

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

      const updatedCells = mergeCell({ newCell: updatedCell, cells });
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
      let nextIndex: number;

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

      const updatedCells = mergeCell({ newCell: updatedCell, cells });

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
      style={{
        minWidth: width,
        minHeight: height,
        width,
        height,
        aspectRatio: `${cols} / ${rows}`,
      }}
    >
      {/* the grid is presented to assistive technologies via the input */}
      <svg
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMinYMin"
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
      >
        <rect
          className={bem('Grid__background')}
          onMouseDown={(event) => {
            event.preventDefault();
            gridInputRef.current?.blur();
          }}
          width={width}
          height={height}
          x="0"
          y="0"
        />
        {cells.map((cell) => {
          const { clueIds, guess, num, pos, checked, val } = cell;
          const isSelected = cellPositionMatches(pos, selectedCell?.pos);
          const isHighlighted = clueIds.some((clueId) =>
            selectedClue?.group.includes(clueId),
          );

          const selectedClueIndex =
            selectedClue !== undefined ? clueIds.indexOf(selectedClue.id) : -1;

          return (
            <GridCell
              cellSize={cellSize}
              checked={checked}
              clueIds={clueIds}
              guess={guess}
              highlighted={isHighlighted}
              inputRef={gridInputRef}
              key={`${pos.col},${pos.row}`}
              num={num}
              onCellFocus={onCellFocus}
              pos={pos}
              selected={isSelected}
              selectedClueIndex={selectedClueIndex}
              val={val}
            />
          );
        })}
        <GridSeparators cellSize={cellSize} clues={rawClues} />
        {remotePlayers.map(({ colour, playerId, pos }) => {
          // only shown on the grid's cells
          if (!cellsByKey.has(getCellKey(pos))) {
            return null;
          }

          const { xRect, yRect } = getDimensions(cellSize, pos);

          return (
            <rect
              className={bem('Grid__remoteSelection')}
              data-player-id={playerId}
              height={cellSize - 2}
              key={playerId}
              style={{ stroke: colour }}
              width={cellSize - 2}
              x={xRect + 1}
              y={yRect + 1}
            />
          );
        })}
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
          ariaDescribedBy={instructionsId}
          ariaLabel="Crossword grid"
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          ref={gridInputRef}
          visible={selectedCell !== undefined}
        />
      </div>
      <p className={VISUALLY_HIDDEN_CLASS} id={instructionsId}>
        Type to enter letters. Use the arrow keys to move between cells, Tab and
        Shift+Tab to move between clues, and Escape to leave the grid.
      </p>
      <div
        aria-atomic="true"
        aria-live="polite"
        className={VISUALLY_HIDDEN_CLASS}
      >
        {announcement}
      </div>
    </div>
  );
}
