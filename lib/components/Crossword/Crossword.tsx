import * as React from 'react';
import {
  getGuessGrid,
  initialiseGuessGrid,
  validateGuessGrid,
} from '~/utils/guess';
import {
  Cell,
  CellChange,
  CellFocus,
  CellPosition,
  Char,
  GuardianCrossword,
  GuessGrid,
} from '~/types';
import { useCluesStore } from '~/stores/useCluesStore';
import { useCellsStore } from '~/stores/useCellsStore';
import GridError from '~/components/GridError/GridError';
import StickyClue from '~/components/StickyClue/StickyClue';
import Grid from '~/components/Grid/Grid';
import Clues from '~/components/Clues/Clues';
import AnagramHelper from '~/components/AnagramHelper/AnagramHelper';
import useLocalStorage from '~/hooks/useLocalStorage/useLocalStorage';
import { initialiseCells, mergeCell } from '~/utils/cell';
import {
  getGroupCells,
  getGroupSeparators,
  initialiseClues,
  isCluePopulated,
} from '~/utils/clue';
import { isValidChar } from '~/utils/general';
import { getBem } from '~/utils/bem';
import Controls from '~/components/Controls/Controls';
import useLocationHash from '~/hooks/useLocationHash/useLocationHash';
import './Crossword.css';

interface CrosswordProps {
  allowedHtmlTags: string[];
  allowMissingSolutions: boolean;
  cellMatcher: RegExp;
  cellSize: number;
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  onComplete?: () => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  stickyClue: 'always' | 'never' | 'auto';
  urlHash?: boolean;
}

export default function Crossword({
  allowedHtmlTags,
  allowMissingSolutions,
  cellMatcher,
  cellSize,
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  onComplete,
  saveGrid,
  stickyClue,
  urlHash = false,
}: CrosswordProps) {
  const bem = getBem('Crossword');
  const [guessGrid, setGuessGrid] = useLocalStorage<GuessGrid>(
    `crosswords.${id}`,
    initialiseGuessGrid(data.dimensions.cols, data.dimensions.rows),
  );
  const [locationHash] = useLocationHash();
  const [isAnagramHelperOpen, setIsAnagramHelperOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Access store methods
  const storeCells = useCellsStore((store) => store.cells);
  const storeClues = useCluesStore((store) => store.clues);
  const setCells = useCellsStore((store) => store.setCells);
  const setClues = useCluesStore((store) => store.setClues);
  const selectCells = useCellsStore((store) => store.select);
  const selectClue = useCluesStore((store) => store.select);
  const answerSomeClues = useCluesStore((store) => store.answerSome);
  const checkComplete = useCellsStore((store) => store.checkComplete);
  const resetComplete = useCellsStore((store) => store.resetComplete);

  // Clear cells and clues when id/data changes
  React.useEffect(() => {
    setCells([]);
    setClues([]);
    resetComplete();
  }, [id, data, setCells, setClues]);

  // Initialize cells and clues once
  React.useEffect(() => {
    // Only initialize if no data exists in stores
    if (storeCells.length === 0 || storeClues.length === 0) {
      try {
        const initialisedCells = initialiseCells({
          cols: data.dimensions.cols,
          rows: data.dimensions.rows,
          entries: data.entries,
          guessGrid: loadGrid ?? guessGrid,
          allowMissingSolutions,
        });

        const initialisedClues = initialiseClues(
          data.entries,
          initialisedCells,
        );

        setCells(initialisedCells);
        setClues(initialisedClues);

        // Check for completion after initialization
        setTimeout(checkComplete, 0);
        setError(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      }
    }
  }, [
    data,
    loadGrid,
    guessGrid,
    allowMissingSolutions,
    storeCells.length,
    storeClues.length,
  ]);

  // Select the clue named in the URL hash e.g. #1-across (opt-in)
  React.useEffect(() => {
    if (
      urlHash &&
      locationHash !== undefined &&
      locationHash !== '' &&
      storeClues.length > 0
    ) {
      const clueId = locationHash.replace('#', '');
      const clueExists = storeClues.some((clue) => clue.id === clueId);

      if (clueExists && !storeClues.some((clue) => clue.selected)) {
        selectClue(clueId);
      }
    }
  }, [urlHash, locationHash, storeClues, selectClue]);

  // Write the selected clue to the URL hash (opt-in). The existing
  // history.state is kept, as routers (e.g. React Router/Remix) store their
  // own navigation and scroll restoration data there.
  const selectedClueId = storeClues.find((clue) => clue.selected)?.id;
  React.useEffect(() => {
    if (
      !urlHash ||
      selectedClueId === undefined ||
      window.location.hash === `#${selectedClueId}`
    ) {
      return;
    }

    window.history.replaceState(window.history.state, '', `#${selectedClueId}`);
  }, [urlHash, selectedClueId]);

  const cellFocus = (pos: CellPosition, clueId: string) => {
    if (onCellFocus !== undefined) {
      onCellFocus({ pos, clueId });
    }
  };

  const moveToNextClue = React.useCallback(
    (forwards: boolean) => {
      const index = storeClues.findIndex((clue) => clue.selected);

      let nextIndex;
      if (forwards) {
        nextIndex = index < storeClues.length - 1 ? index + 1 : 0;
      } else {
        nextIndex = index > 0 ? index - 1 : storeClues.length - 1;
      }

      const nextClue = storeClues[nextIndex];
      const nextCluePos = {
        col: nextClue.position.x,
        row: nextClue.position.y,
      };

      selectClue(nextClue.id);
      selectCells(nextCluePos);

      cellFocus(nextCluePos, nextClue.id);

      if (inputRef.current !== null) {
        inputRef.current.focus({ preventScroll: true });
      }
    },
    [storeClues, selectClue, selectCells, cellFocus],
  );

  // set (or clear) a cell's letter from outside the grid, e.g. the anagram
  // helper, keeping the clues, saved grid and callbacks up to date. Returns
  // whether the letter was accepted.
  const setCellGuess = (cell: Cell, guess: Char | undefined) => {
    if (guess !== undefined && !isValidChar(guess, cellMatcher)) {
      return false;
    }

    const cells = useCellsStore.getState().cells;
    const currentCell = cells.find(
      (c) => c.pos.col === cell.pos.col && c.pos.row === cell.pos.row,
    );

    if (currentCell === undefined) {
      return false;
    }

    if ((currentCell.guess || undefined) === guess) {
      return true;
    }

    if (onCellChange !== undefined) {
      onCellChange({
        pos: currentCell.pos,
        guess,
        previousGuess: currentCell.guess,
      });
    }

    const updatedCells = mergeCell({
      cells,
      newCell: { ...currentCell, guess },
    });

    setCells(updatedCells);

    // mark the cell's clues as answered (or not)
    currentCell.clueIds.forEach((clueId) => {
      const clue = storeClues.find((c) => c.id === clueId);

      if (clue !== undefined) {
        answerSomeClues(clue.group, isCluePopulated(clue, updatedCells));
      }
    });

    (saveGrid ?? setGuessGrid)(
      getGuessGrid(data.dimensions.cols, data.dimensions.rows, updatedCells),
    );

    if (guess !== undefined && onComplete !== undefined) {
      if (checkComplete() === true) {
        onComplete();
      }
    }

    return true;
  };

  // Validate overriding guess grid if defined
  if (
    loadGrid !== undefined &&
    !validateGuessGrid(
      loadGrid,
      data.dimensions.cols,
      data.dimensions.rows,
      cellMatcher,
    )
  ) {
    return renderGridError('Error loading grid', data.dimensions);
  }

  // Handle initialization errors
  if (error !== null) {
    return renderGridError(error, data.dimensions);
  }

  // Find selected clue
  const selectedClue = storeClues.find((clue) => clue.selected);

  // Find parent clue
  let parentClue = undefined;
  if (selectedClue !== undefined) {
    if (selectedClue.group.length === 1) {
      parentClue = selectedClue;
    } else {
      parentClue = storeClues.find((clue) => clue.id === selectedClue.group[0]);
    }
  }

  const gridHeight = data.dimensions.rows * cellSize + data.dimensions.rows + 1;
  const gridWidth = data.dimensions.cols * cellSize + data.dimensions.cols + 1;

  // Helper function for rendering grid errors
  function renderGridError(
    message: string,
    dimensions: { cols: number; rows: number },
  ) {
    const gridHeight = dimensions.rows * cellSize + dimensions.rows + 1;
    const gridWidth = dimensions.cols * cellSize + dimensions.cols + 1;

    return (
      <div className={bem('Crossword')}>
        <GridError
          message={message}
          style={{
            height: gridHeight,
            width: gridWidth,
            aspectRatio: `${dimensions.cols} / ${dimensions.rows}`,
          }}
        />
      </div>
    );
  }

  return (
    <div className={bem('Crossword')}>
      <div className={bem('Crossword__gridAndControls')}>
        <div
          className={bem('Crossword__gridContainer')}
          style={{
            maxWidth: gridWidth,
          }}
        >
          {isAnagramHelperOpen && parentClue !== undefined ? (
            <AnagramHelper
              allowedHtmlTags={allowedHtmlTags}
              clue={parentClue}
              groupCells={getGroupCells(parentClue.group, storeCells)}
              groupSeparators={getGroupSeparators(parentClue.group, storeClues)}
              onCellGuess={setCellGuess}
              onClose={() => setIsAnagramHelperOpen(false)}
              style={{
                height: gridHeight,
                maxHeight: gridHeight,
                width: gridWidth,
                maxWidth: gridWidth,
              }}
            />
          ) : (
            <>
              {stickyClue !== 'never' ? (
                <StickyClue
                  allowedTags={allowedHtmlTags}
                  num={
                    parentClue?.group.length === 1
                      ? `${parentClue.number}${parentClue.direction.charAt(0)}`
                      : parentClue?.humanNumber
                  }
                  onMoveNext={() => moveToNextClue(true)}
                  onMovePrev={() => moveToNextClue(false)}
                  show={stickyClue}
                  text={parentClue?.clue}
                />
              ) : null}
              <Grid
                cellMatcher={cellMatcher}
                cells={storeCells}
                cellSize={cellSize}
                clues={storeClues}
                cols={data.dimensions.cols}
                guessGrid={
                  // with custom persistence the local guess grid isn't kept
                  // up to date, so start from the current cells; otherwise
                  // remounting (e.g. after the anagram helper) would save a
                  // stale grid over them
                  saveGrid !== undefined
                    ? storeCells.length > 0
                      ? getGuessGrid(
                          data.dimensions.cols,
                          data.dimensions.rows,
                          storeCells,
                        )
                      : (loadGrid ?? guessGrid)
                    : guessGrid
                }
                inputRef={inputRef}
                onCellChange={onCellChange}
                onCellFocus={onCellFocus}
                onComplete={onComplete}
                rawClues={data.entries}
                rows={data.dimensions.rows}
                setGuessGrid={saveGrid ?? setGuessGrid}
              />
            </>
          )}
        </div>
        <Controls
          cells={storeCells}
          clues={storeClues}
          gridCols={data.dimensions.cols}
          gridRows={data.dimensions.rows}
          onAnagramHelperClick={() => setIsAnagramHelperOpen((val) => !val)}
          onCellChange={onCellChange}
          onComplete={onComplete}
          setGuessGrid={saveGrid ?? setGuessGrid}
          solutionsAvailable={data.solutionAvailable}
        />
      </div>
      <Clues
        allowedHtmlTags={allowedHtmlTags}
        entries={storeClues}
        gridHeight={gridHeight}
        inputRef={inputRef}
        onCellFocus={onCellFocus}
        selectedClueId={selectedClue?.id}
      />
    </div>
  );
}
