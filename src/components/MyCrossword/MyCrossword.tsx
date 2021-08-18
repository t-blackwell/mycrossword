import { cellSize, Clues, Controls, Grid } from 'components';
import type { Cell, Char, GuardianClue, GuardianCrossword } from 'interfaces';
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
import './MyCrossword.scss';

/**
 * Transpose clue entries to cell array.
 * @param cols
 * @param rows
 * @param entries
 * @returns
 */
const transposeData = (cols: number, rows: number, entries: GuardianClue[]) => {
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
        // add cell
        const newCell: Cell = {
          clueIds: [entry.id],
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
}

export default function MyCrossword({ data }: CrosswordProps): JSX.Element {
  const dispatch = useAppDispatch();
  const cells = useAppSelector(getCells);
  const clues = useAppSelector(getClues);
  const gridWidth = data.dimensions.cols * cellSize + data.dimensions.cols + 1;
  const gridHeight = data.dimensions.rows * cellSize + data.dimensions.rows + 1;
  const selectedClue = clues.find((clue) => clue.selected);

  React.useEffect(() => {
    // initialise cells
    dispatch(
      cellsActionUpdateGrid(
        transposeData(data.dimensions.cols, data.dimensions.rows, data.entries),
      ),
    );

    // initialise clues
    dispatch(
      cluesActionUpdateGrid(
        data.entries.map((entry) => ({
          ...entry,
          answered: false,
          selected: `#${entry.id}` === window.location.hash,
        })),
      ),
    );
  }, [dispatch, data]);

  return (
    <>
      <div className="MyCrossword">
        <div className="MyCrossword__container">
          <Grid
            cells={cells}
            clues={clues}
            height={gridHeight}
            isLoading={cells.length === 0}
            rawClues={data.entries}
            width={gridWidth}
          />
          <Controls selectedClueGroup={selectedClue?.group} />
        </div>
        <Clues selectedClueId={selectedClue?.id} entries={clues} />
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
