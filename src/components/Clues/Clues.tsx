import { Clue } from '../../components';
import { CellFocus, Clue as ClueInterface } from './../../interfaces';
import * as React from 'react';

interface CluesProps {
  entries: ClueInterface[];
  onCellFocus?: (cellFocus: CellFocus) => void;
  selectedClueId?: string;
}

export default function Clues({
  entries,
  onCellFocus,
  selectedClueId,
}: CluesProps): JSX.Element {
  const across = entries
    .filter((entry) => entry.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const down = entries
    .filter((entry) => entry.direction === 'down')
    .sort((a, b) => a.number - b.number);

  return (
    <div className="Clues">
      <div className="Clues__list Clues__list--across">
        <h3 className="Clues__listHeader">Across</h3>
        {across.map((entry) => (
          <Clue
            answered={entry.answered}
            col={entry.position.x}
            id={entry.id}
            isHighlighted={
              selectedClueId !== undefined &&
              entry.group.includes(selectedClueId)
            }
            key={entry.id}
            num={entry.humanNumber}
            onCellFocus={onCellFocus}
            row={entry.position.y}
            text={entry.clue}
          />
        ))}
      </div>
      <div className="Clues__list Clues__list--down">
        <h3 className="Clues__listHeader">Down</h3>
        {down.map((entry) => (
          <Clue
            answered={entry.answered}
            col={entry.position.x}
            id={entry.id}
            isHighlighted={
              selectedClueId !== undefined &&
              entry.group.includes(selectedClueId)
            }
            key={entry.id}
            num={entry.humanNumber}
            onCellFocus={onCellFocus}
            row={entry.position.y}
            text={entry.clue}
          />
        ))}
      </div>
    </div>
  );
}
