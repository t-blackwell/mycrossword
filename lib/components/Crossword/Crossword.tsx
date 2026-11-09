import * as React from 'react';
import { getGuessGrid, validateGuessGrid } from '~/utils/guess';
import {
  Cell,
  CellChange,
  CellFocus,
  CellPosition,
  Char,
  Clue,
  GuardianCrossword,
  GuessGrid,
  MultiplayerConnection,
} from '~/types';
import {
  useCellsStore,
  useCluesStore,
  useCrosswordStores,
} from '~/stores/stores';
import GridError from '~/components/GridError/GridError';
import StickyClue from '~/components/StickyClue/StickyClue';
import Grid from '~/components/Grid/Grid';
import Clues from '~/components/Clues/Clues';
import AnagramHelper from '~/components/AnagramHelper/AnagramHelper';
import { useEventCallback } from '~/hooks/useEventCallback/useEventCallback';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect/useIsomorphicLayoutEffect';
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
import { useMultiplayer } from '~/hooks/useMultiplayer/useMultiplayer';
import './Crossword.css';

interface CrosswordProps {
  allowedHtmlTags: string[];
  allowMissingSolutions: boolean;
  cellMatcher: RegExp;
  cellSize: number;
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  multiplayer?: MultiplayerConnection;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  onComplete?: () => void;
  saveGrid?: (value: GuessGrid) => void;
  stickyClue: 'always' | 'never' | 'auto';
  urlHash?: boolean;
}

/** The cells and clues set up from a crossword's data. */
type Puzzle = {
  cells: Cell[];
  clues: Clue[];
  data: GuardianCrossword;
  error: string | null;
  id: string;
};

function setUpPuzzle(
  id: string,
  data: GuardianCrossword,
  allowMissingSolutions: boolean,
  guessGrid?: GuessGrid,
): Puzzle {
  try {
    const cells = initialiseCells({
      cols: data.dimensions.cols,
      rows: data.dimensions.rows,
      entries: data.entries,
      guessGrid,
      allowMissingSolutions,
    });

    return {
      cells,
      clues: initialiseClues(data.entries, cells),
      data,
      error: null,
      id,
    };
  } catch (err: unknown) {
    return {
      cells: [],
      clues: [],
      data,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
      id,
    };
  }
}

/**
 * Reads the progress saved in localStorage (only available in the browser).
 */
function readSavedGuessGrid(key: string): GuessGrid | undefined {
  try {
    const value = window.localStorage.getItem(key);
    const guessGrid = value ? (JSON.parse(value) as GuessGrid) : undefined;

    return Array.isArray(guessGrid?.value) ? guessGrid : undefined;
  } catch {
    return undefined;
  }
}

export default function Crossword({
  allowedHtmlTags,
  allowMissingSolutions,
  cellMatcher,
  cellSize,
  data,
  id,
  loadGrid,
  multiplayer,
  onCellChange,
  onCellFocus,
  onComplete,
  saveGrid,
  stickyClue,
  urlHash = false,
}: CrosswordProps) {
  const bem = getBem('Crossword');
  const guessGridKey = `crosswords.${id}`;
  // progress is saved in localStorage unless the consumer saves it; it's
  // read back by restoreSavedProgress
  const setGuessGrid = React.useCallback(
    (guessGrid: GuessGrid) => {
      try {
        window.localStorage.setItem(guessGridKey, JSON.stringify(guessGrid));
      } catch (error) {
        console.warn(`Error saving localStorage key “${guessGridKey}”:`, error);
      }
    },
    [guessGridKey],
  );
  const [locationHash] = useLocationHash();
  const [isAnagramHelperOpen, setIsAnagramHelperOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const crosswordRef = React.useRef<HTMLDivElement>(null);

  // Access store methods
  const stores = useCrosswordStores();
  const storeCells = useCellsStore((store) => store.cells);
  const storeClues = useCluesStore((store) => store.clues);
  const setCells = useCellsStore((store) => store.setCells);
  const selectCells = useCellsStore((store) => store.select);
  const selectClue = useCluesStore((store) => store.select);
  const answerSomeClues = useCluesStore((store) => store.answerSome);
  const checkComplete = useCellsStore((store) => store.checkComplete);

  // solving with others (opt-in)
  const { remotePlayers, sendCellChange } = useMultiplayer({
    cellMatcher,
    cols: data.dimensions.cols,
    connection: multiplayer,
    onComplete,
    rows: data.dimensions.rows,
    saveGuessGrid: saveGrid ?? setGuessGrid,
  });

  // called with each change the player makes to the grid. It's undefined
  // when nothing needs to know, so the changes needn't be worked out.
  const handleCellChange =
    onCellChange !== undefined || sendCellChange !== undefined
      ? (cellChange: CellChange) => {
          onCellChange?.(cellChange);
          sendCellChange?.(cellChange);
        }
      : undefined;

  // The cells and clues are set up while rendering (rather than in an effect)
  // so that server rendered HTML includes the whole puzzle. They're set up
  // again if the crossword changes.
  const [puzzle, setPuzzle] = React.useState(() =>
    setUpPuzzle(id, data, allowMissingSolutions, loadGrid),
  );

  if (puzzle.id !== id || puzzle.data !== data) {
    setPuzzle(setUpPuzzle(id, data, allowMissingSolutions, loadGrid));
  }

  // The puzzle the stores were last set to. Until they're set (on the server
  // and when hydrating) the puzzle is rendered directly.
  const [storedPuzzle, setStoredPuzzle] = React.useState<Puzzle | null>(null);
  const isStored = storedPuzzle === puzzle;
  const cells = isStored ? storeCells : puzzle.cells;
  const clues = isStored ? storeClues : puzzle.clues;

  useIsomorphicLayoutEffect(() => {
    stores.cells.setState({ cells: puzzle.cells, complete: false });
    stores.clues.setState({ clues: puzzle.clues });

    // so onComplete isn't called for a grid that's already complete
    stores.cells.getState().checkComplete();
    setStoredPuzzle(puzzle);
  }, [puzzle, stores]);

  // Progress saved in localStorage is restored after the first render, as
  // it's only available in the browser: using it in the first render would
  // make the HTML differ from the server's and break hydration.
  const restoreSavedProgress = useEventCallback(() => {
    if (loadGrid !== undefined) {
      return;
    }

    const savedGuessGrid = readSavedGuessGrid(guessGridKey);

    if (
      savedGuessGrid !== undefined &&
      validateGuessGrid(
        savedGuessGrid,
        data.dimensions.cols,
        data.dimensions.rows,
        cellMatcher,
      ) &&
      savedGuessGrid.value.some((col) => col.some((guess) => guess !== ''))
    ) {
      setPuzzle(setUpPuzzle(id, data, allowMissingSolutions, savedGuessGrid));
    }
  });

  useIsomorphicLayoutEffect(() => {
    restoreSavedProgress();
  }, [restoreSavedProgress, guessGridKey, data]);

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
  React.useEffect(() => {
    if (!urlHash) {
      return;
    }

    // Read the selection from the live store rather than this render's
    // clues: when the data changes this render can still hold the previous
    // crossword's clues, which the reset effect above has just cleared
    const selectedClueId = stores.clues
      .getState()
      .clues.find((clue) => clue.selected)?.id;

    if (
      selectedClueId === undefined ||
      window.location.hash === `#${selectedClueId}`
    ) {
      return;
    }

    window.history.replaceState(window.history.state, '', `#${selectedClueId}`);
    // run on every clues change (not only when the selected id changes) so
    // reselecting a clue restores its hash if something else changed it
  }, [urlHash, storeClues, stores]);

  const cellFocus = React.useCallback(
    (pos: CellPosition, clueId: string) => {
      if (onCellFocus !== undefined) {
        onCellFocus({ pos, clueId });
      }
    },
    [onCellFocus],
  );

  const moveToNextClue = React.useCallback(
    (forwards: boolean) => {
      const index = clues.findIndex((clue) => clue.selected);

      let nextIndex;
      if (forwards) {
        nextIndex = index < clues.length - 1 ? index + 1 : 0;
      } else {
        nextIndex = index > 0 ? index - 1 : clues.length - 1;
      }

      const nextClue = clues[nextIndex];
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
    [clues, selectClue, selectCells, cellFocus],
  );

  // on leaving the grid, move focus to the selected clue in the clue list so
  // keyboard users can continue from there (pressing Enter returns to the grid)
  const focusSelectedClue = () => {
    const selectedClueId = stores.clues
      .getState()
      .clues.find((clue) => clue.selected)?.id;
    const clueButton =
      selectedClueId !== undefined
        ? crosswordRef.current?.querySelector<HTMLButtonElement>(
            `[data-clue-id="${selectedClueId}"]`,
          )
        : null;

    if (clueButton !== null && clueButton !== undefined) {
      clueButton.focus();
    } else {
      inputRef.current?.blur();
    }
  };

  // set (or clear) a cell's letter from outside the grid, e.g. the anagram
  // helper, keeping the clues, saved grid and callbacks up to date. Returns
  // whether the letter was accepted.
  const setCellGuess = (cell: Cell, guess: Char | undefined) => {
    if (guess !== undefined && !isValidChar(guess, cellMatcher)) {
      return false;
    }

    const cells = stores.cells.getState().cells;
    const currentCell = cells.find(
      (c) => c.pos.col === cell.pos.col && c.pos.row === cell.pos.row,
    );

    if (currentCell === undefined) {
      return false;
    }

    if ((currentCell.guess || undefined) === guess) {
      return true;
    }

    if (handleCellChange !== undefined) {
      handleCellChange({
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
      const clue = clues.find((c) => c.id === clueId);

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
  if (puzzle.error !== null) {
    return renderGridError(puzzle.error, data.dimensions);
  }

  // Find selected clue
  const selectedClue = clues.find((clue) => clue.selected);

  // Find parent clue
  let parentClue = undefined;
  if (selectedClue !== undefined) {
    if (selectedClue.group.length === 1) {
      parentClue = selectedClue;
    } else {
      parentClue = clues.find((clue) => clue.id === selectedClue.group[0]);
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
    <div className={bem('Crossword')} ref={crosswordRef}>
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
              groupCells={getGroupCells(parentClue.group, cells)}
              groupSeparators={getGroupSeparators(parentClue.group, clues)}
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
                cells={cells}
                cellSize={cellSize}
                clues={clues}
                cols={data.dimensions.cols}
                inputRef={inputRef}
                onCellChange={handleCellChange}
                onCellFocus={onCellFocus}
                onComplete={onComplete}
                onEscape={focusSelectedClue}
                rawClues={data.entries}
                remotePlayers={remotePlayers}
                rows={data.dimensions.rows}
                setGuessGrid={saveGrid ?? setGuessGrid}
              />
            </>
          )}
        </div>
        <Controls
          cells={cells}
          clues={clues}
          gridCols={data.dimensions.cols}
          gridRows={data.dimensions.rows}
          onAnagramHelperClick={() => setIsAnagramHelperOpen((val) => !val)}
          onCellChange={handleCellChange}
          onComplete={onComplete}
          setGuessGrid={saveGrid ?? setGuessGrid}
          solutionsAvailable={data.solutionAvailable}
        />
      </div>
      <Clues
        allowedHtmlTags={allowedHtmlTags}
        entries={clues}
        gridHeight={gridHeight}
        inputRef={inputRef}
        onCellFocus={onCellFocus}
        selectedClueId={selectedClue?.id}
      />
    </div>
  );
}
