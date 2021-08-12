import { Clue } from 'components';
import { CellPosition, Clue as ClueInterface } from 'interfaces';
import * as React from 'react';
import { select as cellsActionSelect } from 'redux/cellsSlice';
import { getClues, select as cluesActionSelect } from 'redux/cluesSlice';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import './Clues.css';

interface CluesProps {
  entries: ClueInterface[];
}

export default function Clues({ entries }: CluesProps): JSX.Element {
  const dispatch = useAppDispatch();
  const clues = useAppSelector(getClues);
  const selectedClue = clues.find((clue) => clue.selected);
  const across = entries
    .filter((entry) => entry.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const down = entries
    .filter((entry) => entry.direction === 'down')
    .sort((a, b) => a.number - b.number);

  const updateSelectedClue = (clueId: string, cellPos: CellPosition) => {
    if (selectedClue?.id !== clueId) {
      dispatch(cluesActionSelect(clueId));
      dispatch(cellsActionSelect(cellPos));
    }

    // move focus back to grid (TODO: change to use React.forwardRef?)
    document.querySelectorAll<HTMLElement>('.Grid')[0].focus();
  };

  return (
    <div className="Clues">
      <div className="Clues__list Clues__list--across">
        <h3 className="Clues__listHeader">Across</h3>
        {across.map((entry) => (
          <Clue
            answered={false}
            key={entry.id}
            num={entry.humanNumber}
            onClick={() =>
              updateSelectedClue(entry.id, {
                col: entry.position.x,
                row: entry.position.y,
              })
            }
            isHighlighted={
              selectedClue !== undefined &&
              entry.group.includes(selectedClue.id)
            }
            text={entry.clue}
          />
        ))}
      </div>
      <div className="Clues__list Clues__list--down">
        <h3 className="Clues__listHeader">Down</h3>
        {down.map((entry) => (
          <Clue
            answered={false}
            key={entry.id}
            num={entry.humanNumber}
            onClick={() =>
              updateSelectedClue(entry.id, {
                col: entry.position.x,
                row: entry.position.y,
              })
            }
            isHighlighted={
              selectedClue !== undefined &&
              entry.group.includes(selectedClue.id)
            }
            text={entry.clue}
          />
        ))}
      </div>
    </div>
  );
}
