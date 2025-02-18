import * as React from 'react';
import { initialiseGuessGrid, validateGuessGrid } from '~/utils/guess';
import {
  CellChange,
  CellFocus,
  CellPosition,
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
import { CELL_SIZE } from '~/components/GridCell/GridCell';
import useLocalStorage from '~/hooks/useLocalStorage/useLocalStorage';
import { initialiseCells } from '~/utils/cell';
import {
  getGroupCells,
  getGroupSeparators,
  initialiseClues,
} from '~/utils/clue';
import { getBem } from '~/utils/bem';
import Controls from '~/components/Controls/Controls';
import './Crossword.css';

interface CrosswordProps {
  allowedHtmlTags: string[];
  allowMissingSolutions: boolean;
  cellMatcher: RegExp;
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  stickyClue: 'always' | 'never' | 'auto';
}

export default function Crossword({
  allowedHtmlTags,
  allowMissingSolutions,
  cellMatcher,
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  saveGrid,
  stickyClue,
}: CrosswordProps) {
  const bem = getBem('Crossword');
  const [guessGrid, setGuessGrid] = useLocalStorage<GuessGrid>(
    `crosswords.${id}`,
    initialiseGuessGrid(data.dimensions.cols, data.dimensions.rows),
  );

  const storeClues = useCluesStore((store) => store.clues);
  const storeCells = useCellsStore((store) => store.cells);
  const selectCells = useCellsStore((store) => store.select);
  const selectClue = useCluesStore((store) => store.select);
  const setCells = useCellsStore((store) => store.setCells);
  const setClues = useCluesStore((store) => store.setClues);

  const parsedData = React.useMemo(() => {
    try {
      const initialisedCells = initialiseCells({
        cols: data.dimensions.cols,
        rows: data.dimensions.rows,
        entries: data.entries,
        guessGrid: loadGrid ?? guessGrid,
        allowMissingSolutions,
      });

      const initialisedClues = initialiseClues(data.entries, initialisedCells);

      return {
        cells: initialisedCells,
        clues: initialisedClues,
        error: null,
      };
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : 'An unknown error occurred';
      return { cells: null, clues: null, error };
    }
  }, [data, loadGrid, allowMissingSolutions]);

  // coalesce store values with initial values
  const cells = React.useMemo(
    () =>
      storeCells.length === 0 && parsedData.cells !== null
        ? parsedData.cells
        : storeCells,
    [storeCells, parsedData.cells],
  );
  const clues = React.useMemo(
    () =>
      storeClues.length === 0 && parsedData.clues !== null
        ? parsedData.clues
        : storeClues,
    [storeClues, parsedData.clues],
  );

  const selectedClue = clues.find((clue) => clue.selected);
  const parentClue =
    selectedClue?.group.length === 1
      ? selectedClue
      : clues.find((clue) => clue.id === selectedClue?.group[0]);
  const [isAnagramHelperOpen, setIsAnagramHelperOpen] = React.useState(false);
  const gridHeight =
    data.dimensions.rows * CELL_SIZE + data.dimensions.rows + 1;
  const gridWidth = data.dimensions.cols * CELL_SIZE + data.dimensions.cols + 1;
  const inputRef = React.useRef<HTMLInputElement>(null);

  // sync store values with parsed data
  React.useEffect(() => {
    if (parsedData.cells !== null) {
      setCells(parsedData.cells);
    }
  }, [parsedData.cells]);

  React.useEffect(() => {
    if (parsedData.clues !== null) {
      setClues(parsedData.clues);
    }
  }, [parsedData.clues]);

  // validate overriding guess grid if defined
  if (
    loadGrid !== undefined &&
    !validateGuessGrid(
      loadGrid,
      data.dimensions.cols,
      data.dimensions.rows,
      cellMatcher,
    )
  ) {
    return (
      <div className={bem('Crossword')}>
        <GridError
          message="Error loading grid"
          style={{
            height: gridHeight,
            width: gridWidth,
            aspectRatio: `${data.dimensions.cols} / ${data.dimensions.rows}`,
          }}
        />
      </div>
    );
  }

  // something went wrong...
  if (parsedData.error !== null) {
    return (
      <div className={bem('Crossword')}>
        <GridError
          message={parsedData.error}
          style={{
            height: gridHeight,
            width: gridWidth,
            aspectRatio: `${data.dimensions.cols} / ${data.dimensions.rows}`,
          }}
        />
      </div>
    );
  }

  const cellFocus = (pos: CellPosition, clueId: string) => {
    if (onCellFocus !== undefined) {
      onCellFocus({
        pos,
        clueId,
      });
    }
  };

  const moveToNextClue = React.useCallback(
    (forwards: boolean) => {
      const index = clues.findIndex((clue) => clue.selected);
      const nextIndex = forwards
        ? index < clues.length - 1
          ? index + 1
          : 0
        : index > 0
          ? index - 1
          : clues.length - 1;

      const nextClue = clues[nextIndex];
      const nextCluePos = {
        col: nextClue.position.x,
        row: nextClue.position.y,
      };

      selectClue(nextClue.id);
      selectCells(nextCluePos);

      cellFocus(nextCluePos, nextClue.id);

      inputRef?.current?.focus({ preventScroll: true });
    },
    [clues, selectClue, selectCells, cellFocus],
  );

  return (
    <div className={bem('Crossword')}>
      <div className={bem('Crossword__gridAndControls')}>
        <div
          className={bem('Crossword__gridContainer')}
          style={{
            maxWidth:
              data.dimensions.cols * CELL_SIZE + data.dimensions.cols + 1,
          }}
        >
          {isAnagramHelperOpen && parentClue !== undefined ? (
            <AnagramHelper
              allowedHtmlTags={allowedHtmlTags}
              clue={parentClue}
              groupCells={getGroupCells(parentClue.group, cells)}
              groupSeparators={getGroupSeparators(parentClue.group, clues)}
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
                clues={clues}
                cols={data.dimensions.cols}
                guessGrid={guessGrid}
                inputRef={inputRef}
                onCellChange={onCellChange}
                onCellFocus={onCellFocus}
                rawClues={data.entries}
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
          onCellChange={onCellChange}
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
