import * as React from 'react';
import { Clue } from '../../components';
import { CellFocus, Clue as ClueInterface } from './../../interfaces';

interface CluesProps {
  allowedHtmlTags: string[];
  breakpoint: string;
  entries: ClueInterface[];
  inputRef?: React.RefObject<HTMLInputElement>;
  onCellFocus?: (cellFocus: CellFocus) => void;
  selectedClueId?: string;
  style?: React.CSSProperties;
}

export default function Clues({
  allowedHtmlTags,
  breakpoint,
  entries,
  inputRef,
  onCellFocus,
  selectedClueId,
  style,
}: CluesProps) {
  const cluesContainerRef = React.useRef<HTMLDivElement>(null);
  const acrossContainerRef = React.useRef<HTMLDivElement>(null);
  const downContainerRef = React.useRef<HTMLDivElement>(null);

  const across = entries
    .filter((entry) => entry.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const down = entries
    .filter((entry) => entry.direction === 'down')
    .sort((a, b) => a.number - b.number);

  const isHighlighted = (thisEntry: ClueInterface): boolean => {
    return (
      selectedClueId !== undefined &&
      !!entries
        .find((entry) => entry.id === selectedClueId)
        ?.group.includes(thisEntry.id)
    );
  };

  // only scroll to clue when container height is fixed
  const scrollTo = (entry: ClueInterface) =>
    ['md', 'lg', 'xl', 'xxl'].includes(breakpoint) &&
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
              allowedHtmlTags={allowedHtmlTags}
              answered={entry.answered}
              breakpoint={breakpoint}
              col={entry.position.x}
              containerRef={
                breakpoint === 'md' ? cluesContainerRef : acrossContainerRef
              }
              id={entry.id}
              inputRef={inputRef}
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
              allowedHtmlTags={allowedHtmlTags}
              answered={entry.answered}
              breakpoint={breakpoint}
              col={entry.position.x}
              containerRef={
                breakpoint === 'md' ? cluesContainerRef : downContainerRef
              }
              id={entry.id}
              inputRef={inputRef}
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
