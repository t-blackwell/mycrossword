import classNames from 'classnames';
import {
  AnagramHelper,
  cellSize,
  Clues,
  Controls,
  Grid,
  GridError,
  StickyClue,
} from 'components';
import { useBreakpoint, useLocalStorage } from 'hooks';
import type {
  GuardianCrossword,
  GuessGrid,
  CellChange,
  CellFocus,
} from 'interfaces';
import * as React from 'react';
import {
  getCells,
  updateGrid as cellsActionUpdateGrid,
} from 'redux/cellsSlice';
import {
  getClues,
  updateGrid as cluesActionUpdateGrid,
} from 'redux/cluesSlice';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { initialiseCells } from 'utils/cell';
import { getGroupCells, getGroupSeparators, initialiseClues } from 'utils/clue';
import { initialiseGuessGrid, validateGuessGrid } from 'utils/guess';
import './MyCrossword.scss';

interface MyCrosswordProps {
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  theme?: 'yellow' | 'pink' | 'blue' | 'green';
}

export default function MyCrossword({
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  saveGrid,
  theme = 'yellow',
}: MyCrosswordProps): JSX.Element {
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

  // validate overriding guess grid if defined
  if (
    loadGrid !== undefined &&
    !validateGuessGrid(loadGrid, data.dimensions.cols, data.dimensions.rows)
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

  return (
    <div
      className={classNames(
        'MyCrossword',
        `MyCrossword--${breakpoint}`,
        `MyCrossword--${theme}Theme`,
      )}
    >
      <div className="MyCrossword__container">
        <div
          className="MyCrossword__gridContainer"
          style={{
            maxWidth:
              data.dimensions.cols * cellSize + data.dimensions.cols + 1,
          }}
        >
          {isAnagramHelperOpen && parentClue !== undefined ? (
            <AnagramHelper
              clue={parentClue}
              groupCells={getGroupCells(parentClue.group, cells)}
              groupSeparators={getGroupSeparators(parentClue.group, clues)}
              height={
                data.dimensions.rows * cellSize + data.dimensions.rows + 1
              }
              onClose={() => setIsAnagramHelperOpen(false)}
              width={data.dimensions.cols * cellSize + data.dimensions.cols + 1}
            />
          ) : (
            <>
              {breakpoint !== undefined && ['xs', 'sm'].includes(breakpoint) ? (
                <StickyClue
                  num={
                    parentClue !== undefined
                      ? `${parentClue.number} ${parentClue.direction}`
                      : ''
                  }
                  text={parentClue?.clue ?? ''}
                />
              ) : null}
              <Grid
                cells={cells}
                clues={clues}
                cols={data.dimensions.cols}
                guessGrid={guessGrid}
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
        entries={clues}
        onCellFocus={onCellFocus}
        selectedClueId={selectedClue?.id}
      />
    </div>
  );
}
