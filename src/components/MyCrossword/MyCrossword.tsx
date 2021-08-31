import classNames from 'classnames';
import { cellSize, Clues, Controls, Grid, StickyClue } from 'components';
import { useBreakpoint, useLocalStorage } from 'hooks';
import type { GuardianCrossword, GuessGrid } from 'interfaces';
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
import { initialiseClues } from 'utils/clue';
import { getGuessGrid } from 'utils/guess';
import './MyCrossword.scss';

interface CrosswordProps {
  data: GuardianCrossword;
  id: string;
  theme?: 'yellow' | 'pink' | 'blue' | 'green';
}

export default function MyCrossword({
  data,
  id,
  theme = 'yellow',
}: CrosswordProps): JSX.Element {
  const dispatch = useAppDispatch();
  const breakpoint = useBreakpoint();
  const [guessGrid, setGuessGrid] = useLocalStorage<GuessGrid>(
    id,
    getGuessGrid(data.dimensions.cols, data.dimensions.rows),
  );
  const cells = useAppSelector(getCells);
  const clues = useAppSelector(getClues);

  const selectedClue = clues.find((clue) => clue.selected);

  React.useEffect(() => {
    // initialise cells
    const initCells = initialiseCells(
      data.dimensions.cols,
      data.dimensions.rows,
      data.entries,
      guessGrid,
    );
    dispatch(cellsActionUpdateGrid(initCells));

    // initialise clues
    const initClues = initialiseClues(
      data.entries,
      initCells,
      window.location.hash,
    );
    dispatch(cluesActionUpdateGrid(initClues));
  }, [dispatch, data]);

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
          {breakpoint !== undefined && ['xs', 'sm'].includes(breakpoint) ? (
            <StickyClue
              num={
                selectedClue !== undefined
                  ? `${selectedClue.number} ${selectedClue.direction}`
                  : ''
              }
              text={selectedClue?.clue ?? ''}
            />
          ) : null}
          <Grid
            cells={cells}
            clues={clues}
            cols={data.dimensions.cols}
            guessGrid={guessGrid}
            isLoading={cells.length === 0}
            rawClues={data.entries}
            rows={data.dimensions.rows}
            setGuessGrid={setGuessGrid}
          />
        </div>
        <Controls
          breakpoint={breakpoint ?? ''}
          cells={cells}
          clues={clues}
          gridCols={data.dimensions.cols}
          gridRows={data.dimensions.rows}
          setGuessGrid={setGuessGrid}
          solutionsAvailable={data.solutionAvailable}
        />
      </div>
      <Clues selectedClueId={selectedClue?.id} entries={clues} />
    </div>
  );
}
