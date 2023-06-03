import classNames from 'classnames';
import * as React from 'react';
import {
  AnagramHelper,
  cellSize,
  Clues,
  Controls,
  Grid,
  GridError,
  StickyClue,
} from '../../components';
import { useBreakpoint, useLocalStorage } from './../../hooks';
import type {
  GuardianCrossword,
  GuessGrid,
  CellChange,
  CellFocus,
  CellPosition,
} from './../../interfaces';
import {
  getCells,
  updateGrid as cellsActionUpdateGrid,
} from './../../redux/cellsSlice';
import { select as cellsActionSelect } from './../../redux/cellsSlice';
import {
  getClues,
  updateGrid as cluesActionUpdateGrid,
} from './../../redux/cluesSlice';
import { select as cluesActionSelect } from './../../redux/cluesSlice';
import { useAppDispatch, useAppSelector } from './../../redux/hooks';
import { initialiseCells } from './../../utils/cell';
import {
  getGroupCells,
  getGroupSeparators,
  initialiseClues,
} from './../../utils/clue';
import { initialiseGuessGrid, validateGuessGrid } from './../../utils/guess';

interface CrosswordProps {
  allowedHtmlTags: string[];
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
  cellMatcher,
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  saveGrid,
  stickyClue,
}: CrosswordProps) {
  const dispatch = useAppDispatch();
  const breakpoint = useBreakpoint();
  const [guessGrid, setGuessGrid] = useLocalStorage<GuessGrid>(
    `crosswords.${id}`,
    initialiseGuessGrid(data.dimensions.cols, data.dimensions.rows),
  );
  const cells = useAppSelector(getCells);
  const clues = useAppSelector(getClues);
  const selectedClue = clues.find((clue) => clue.selected);
  const parentClue =
    selectedClue?.group.length === 1
      ? selectedClue
      : clues.find((clue) => clue.id === selectedClue?.group[0]);
  const [gridErrorMessage, setGridErrorMessage] = React.useState<string>();
  const [isAnagramHelperOpen, setIsAnagramHelperOpen] = React.useState(false);
  const gridHeight = data.dimensions.rows * cellSize + data.dimensions.rows + 1;
  const gridWidth = data.dimensions.cols * cellSize + data.dimensions.cols + 1;
  const inputRef = React.useRef<HTMLInputElement>(null);

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
      <div className={classNames('MyCrossword', `MyCrossword--${breakpoint}`)}>
        <GridError message="Error loading grid" />
      </div>
    );
  }

  React.useEffect(() => {
    try {
      // initialise cells
      const initCells = initialiseCells(
        data.dimensions.cols,
        data.dimensions.rows,
        data.entries,
        loadGrid ?? guessGrid,
      );
      dispatch(cellsActionUpdateGrid(initCells));

      // initialise clues
      const initClues = initialiseClues(
        data.entries,
        initCells,
        window.location.hash.replace('#', ''),
      );
      dispatch(cluesActionUpdateGrid(initClues));

      setGridErrorMessage(undefined);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGridErrorMessage(error.message);
      } else {
        throw error;
      }
    }
  }, [dispatch, data]);

  // something went wrong...
  if (gridErrorMessage !== undefined) {
    return (
      <div className={classNames('MyCrossword', `MyCrossword--${breakpoint}`)}>
        <GridError message={gridErrorMessage} />
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

  const moveToNextClue = (forwards: boolean) => {
    // cycle through the clues
    const index = clues.findIndex((clue) => clue.selected);
    let nextIndex = 0;

    // direction
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

    dispatch(cluesActionSelect(nextClue.id));
    dispatch(cellsActionSelect(nextCluePos));

    cellFocus(nextCluePos, nextClue.id);

    inputRef?.current?.focus({ preventScroll: true });
  };

  return (
    <div className="Crossword">
      <div className="Crossword__gridAndControls">
        <div
          className="Crossword__gridContainer"
          style={{
            maxWidth:
              data.dimensions.cols * cellSize + data.dimensions.cols + 1,
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
              {stickyClue === 'always' ||
              (stickyClue === 'auto' &&
                breakpoint !== undefined &&
                ['xs', 'sm'].includes(breakpoint)) ? (
                <StickyClue
                  allowedHtmlTags={allowedHtmlTags}
                  num={
                    parentClue?.group.length === 1
                      ? `${parentClue.number}${parentClue.direction.charAt(0)}`
                      : parentClue?.humanNumber
                  }
                  onMoveNext={() => moveToNextClue(true)}
                  onMovePrev={() => moveToNextClue(false)}
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
                isLoading={cells.length === 0}
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
          breakpoint={breakpoint ?? ''}
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
        breakpoint={breakpoint ?? ''}
        entries={clues}
        inputRef={inputRef}
        onCellFocus={onCellFocus}
        selectedClueId={selectedClue?.id}
        style={{
          maxHeight:
            breakpoint !== undefined &&
            ['md', 'lg', 'xl', 'xxl'].includes(breakpoint)
              ? gridHeight
              : undefined,
        }}
      />
    </div>
  );
}
