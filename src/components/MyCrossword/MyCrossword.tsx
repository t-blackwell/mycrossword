import classNames from 'classnames';
import { Clues, Controls, Grid } from 'components';
import { useBreakpoint, useLocalStorage } from 'hooks';
import type {
  Cell,
  Char,
  GuardianClue,
  GuardianCrossword,
  GuessGrid,
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
import { isCluePopulated } from 'utils/clue';
import { getGuessGrid } from 'utils/guess';
import './MyCrossword.scss';

/**
 * Transpose clue entries to cell array.
 * @param cols
 * @param rows
 * @param entries
 * @returns
 */
const transposeData = (
  cols: number,
  rows: number,
  entries: GuardianClue[],
  guessGrid: GuessGrid,
) => {
  const cells: Cell[] = [];

  entries.forEach((entry) => {
    for (let i = 0; i < entry.length; i += 1) {
      const across = entry.direction === 'across';
      const col = across ? entry.position.x + i : entry.position.x;
      const row = across ? entry.position.y : entry.position.y + i;

      // grid validation
      if (col < 0 || col >= cols || row < 0 || row >= rows) {
        throw new Error('Crossword data error: out of bounds');
      } else if (
        entry.solution !== undefined &&
        entry.length !== entry.solution.length
      ) {
        throw new Error('Crossword data error: solution length mismatch');
      }

      // check if the cell already exists
      const currentCell = cells.find(
        ({ pos }) => pos.col === col && pos.row === row,
      );

      if (currentCell === undefined) {
        const guess = guessGrid.value[col][row];

        // add cell
        const newCell: Cell = {
          clueIds: [entry.id],
          guess: guess !== '' ? guess : undefined,
          num: i === 0 ? entry.number : undefined,
          pos: { col, row },
          selected: false,
          val: entry.solution?.[i] as Char,
        };

        if (across) {
          newCell.groupAcross = entry.group;
        } else {
          newCell.groupDown = entry.group;
        }

        cells.push(newCell);
      } else {
        // merge cell
        if (currentCell.val !== entry.solution?.[i]) {
          throw new Error('Crossword data error: solution character clash');
        }

        currentCell.clueIds = [...currentCell.clueIds, entry.id];
        currentCell.num = i === 0 ? entry.number : currentCell.num;

        // add group
        if (across) {
          if (currentCell.groupAcross !== undefined) {
            throw new Error(
              'Crossword data error: overlapping across solutions',
            );
          }
          currentCell.groupAcross = entry.group;
        } else {
          if (currentCell.groupDown !== undefined) {
            throw new Error('Crossword data error: overlapping down solutions');
          }
          currentCell.groupDown = entry.group;
        }
      }
    }
  });

  return cells;
};

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
    const initCells = transposeData(
      data.dimensions.cols,
      data.dimensions.rows,
      data.entries,
      guessGrid,
    );

    dispatch(cellsActionUpdateGrid(initCells));

    // initialise clues
    dispatch(
      cluesActionUpdateGrid(
        data.entries.map((entry) => ({
          ...entry,
          answered: isCluePopulated(
            { ...entry, selected: false, answered: false }, // TODO: use Partial<Clue>?
            initCells,
          ),
          selected: `#${entry.id}` === window.location.hash,
        })),
      ),
    );
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
        <Controls
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
