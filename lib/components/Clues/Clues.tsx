import * as React from 'react';
import Clue from '~/components/Clue/Clue';
import { CellFocus, Clue as ClueType } from '~/types';
import useBreakpoint from '~/hooks/useBreakpoint/useBreakpoint';
import './Clues.css';

interface CluesProps {
  allowedHtmlTags: string[];
  entries: ClueType[];
  gridHeight: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onCellFocus?: (cellFocus: CellFocus) => void;
  selectedClueId?: string;
}

export default function Clues({
  allowedHtmlTags,
  entries,
  gridHeight,
  inputRef,
  onCellFocus,
  selectedClueId,
}: CluesProps) {
  const breakpoint = useBreakpoint();
  const cluesContainerRef = React.useRef<HTMLDivElement>(null);
  const acrossContainerRef = React.useRef<HTMLDivElement>(null);
  const downContainerRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const acrossHeaderId = `${id}-across`;
  const downHeaderId = `${id}-down`;

  const across = entries
    .filter((entry) => entry.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const down = entries
    .filter((entry) => entry.direction === 'down')
    .sort((a, b) => a.number - b.number);

  const isHighlighted = (thisEntry: ClueType) => {
    if (selectedClueId === undefined) {
      return false;
    }
    const selectedClue = entries.find((entry) => entry.id === selectedClueId);
    return selectedClue?.group.includes(thisEntry.id) ?? false;
  };

  // only scroll to clue when container height is fixed
  const scrollTo = (entry: ClueType) =>
    breakpoint !== undefined &&
    ['md', 'lg', 'xl', 'xxl'].includes(breakpoint) &&
    selectedClueId !== undefined &&
    entry.group.includes(selectedClueId) &&
    entry.id === entry.group[0];

  return (
    <div
      className="Clues"
      ref={cluesContainerRef}
      style={{ maxHeight: gridHeight }}
    >
      <div className="Clues__list Clues__list--across" ref={acrossContainerRef}>
        <h3 className="Clues__listHeader" id={acrossHeaderId}>
          Across
        </h3>
        <ul aria-labelledby={acrossHeaderId} className="Clues__listBody">
          {across.map((entry) => (
            <li key={entry.id}>
              <Clue
                allowedHtmlTags={allowedHtmlTags}
                answered={entry.answered}
                col={entry.position.x}
                containerRef={
                  breakpoint === 'md' ? cluesContainerRef : acrossContainerRef
                }
                direction={entry.direction}
                id={entry.id}
                inputRef={inputRef}
                isHighlighted={isHighlighted(entry)}
                num={entry.humanNumber}
                onCellFocus={onCellFocus}
                row={entry.position.y}
                scrollTo={scrollTo(entry)}
                text={entry.clue}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="Clues__list Clues__list--down" ref={downContainerRef}>
        <h3 className="Clues__listHeader" id={downHeaderId}>
          Down
        </h3>
        <ul aria-labelledby={downHeaderId} className="Clues__listBody">
          {down.map((entry) => (
            <li key={entry.id}>
              <Clue
                allowedHtmlTags={allowedHtmlTags}
                answered={entry.answered}
                col={entry.position.x}
                containerRef={
                  breakpoint === 'md' ? cluesContainerRef : downContainerRef
                }
                direction={entry.direction}
                id={entry.id}
                inputRef={inputRef}
                isHighlighted={isHighlighted(entry)}
                num={entry.humanNumber}
                onCellFocus={onCellFocus}
                row={entry.position.y}
                scrollTo={scrollTo(entry)}
                text={entry.clue}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
