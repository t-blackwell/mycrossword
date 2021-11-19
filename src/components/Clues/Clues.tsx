import * as React from 'react';
import { Clue } from '../../components';
import { CellFocus, Clue as ClueInterface } from './../../interfaces';

interface CluesProps {
  breakpoint: string;
  entries: ClueInterface[];
  onCellFocus?: (cellFocus: CellFocus) => void;
  selectedClueId?: string;
  style?: React.CSSProperties;
}

export default function Clues({
  breakpoint,
  entries,
  onCellFocus,
  selectedClueId,
  style,
}: CluesProps): JSX.Element {
  const cluesContainerRef = React.useRef<HTMLDivElement>(null);
  const acrossContainerRef = React.useRef<HTMLDivElement>(null);
  const downContainerRef = React.useRef<HTMLDivElement>(null);

  const across = entries
    .filter((entry) => entry.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const down = entries
    .filter((entry) => entry.direction === 'down')
    .sort((a, b) => a.number - b.number);

  const isHighlighted = (entry: ClueInterface) =>
    selectedClueId !== undefined && entry.group.includes(selectedClueId);

  // only scroll to clue when container height is fixed (md & lg breakpoints)
  const scrollTo = (entry: ClueInterface) =>
    ['md', 'lg'].includes(breakpoint) &&
    selectedClueId !== undefined &&
    entry.group.includes(selectedClueId) &&
    entry.id === entry.group[0];

  return (
    <div className="Clues" ref={cluesContainerRef} style={style}>
      <div className="Clues__list Clues__list--across" ref={acrossContainerRef}>
        <h3 className="Clues__listHeader">Across</h3>
        <div className="Clues__listBody">
          {across.map((entry) => (
            <Clue
              answered={entry.answered}
              col={entry.position.x}
              containerRef={
                breakpoint === 'md' ? cluesContainerRef : acrossContainerRef
              }
              id={entry.id}
              isHighlighted={isHighlighted(entry)}
              key={entry.id}
              num={entry.humanNumber}
              onCellFocus={onCellFocus}
              row={entry.position.y}
              scrollTo={scrollTo(entry)}
              text={entry.clue}
            />
          ))}
        </div>
      </div>
      <div className="Clues__list Clues__list--down" ref={downContainerRef}>
        <h3 className="Clues__listHeader">Down</h3>
        <div className="Clues__listBody">
          {down.map((entry) => (
            <Clue
              answered={entry.answered}
              col={entry.position.x}
              containerRef={
                breakpoint === 'md' ? cluesContainerRef : downContainerRef
              }
              id={entry.id}
              isHighlighted={isHighlighted(entry)}
              key={entry.id}
              num={entry.humanNumber}
              onCellFocus={onCellFocus}
              row={entry.position.y}
              scrollTo={scrollTo(entry)}
              text={entry.clue}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
