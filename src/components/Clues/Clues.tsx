import * as React from 'react';
import { Clue } from '../../components';
import { CellFocus, Clue as ClueInterface } from './../../interfaces';

interface CluesProps {
  entries: ClueInterface[];
  onCellFocus?: (cellFocus: CellFocus) => void;
  selectedClueId?: string;
  style?: React.CSSProperties;
}

export default function Clues({
  entries,
  onCellFocus,
  selectedClueId,
  style,
}: CluesProps): JSX.Element {
  const across = entries
    .filter((entry) => entry.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const down = entries
    .filter((entry) => entry.direction === 'down')
    .sort((a, b) => a.number - b.number);

  return (
    <div className="Clues" style={style}>
      <div className="Clues__list Clues__list--across">
        <h3 className="Clues__listHeader">Across</h3>
        <div className="Clues__listBody">
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
      </div>
      <div className="Clues__list Clues__list--down">
        <h3 className="Clues__listHeader">Down</h3>
        <div className="Clues__listBody">
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
    </div>
  );
}
