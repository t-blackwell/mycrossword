import * as React from 'react';
import { sanitizeHtml } from './../../utils/general';

interface ChevronIconProps {
  className?: string;
}

function ChevronLeftIcon({ className }: ChevronIconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      className={className}
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: ChevronIconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      className={className}
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
}

interface StickyClueProps {
  num?: string;
  onMoveNext: () => void;
  onMovePrev: () => void;
  text?: string;
}

export default function StickyClue({
  num,
  onMoveNext,
  onMovePrev,
  text,
}: StickyClueProps): JSX.Element {
  return (
    <div className="StickyClue">
      {text !== undefined && num !== undefined ? (
        <>
          <button
            aria-label="Previous clue"
            className="StickyClue__button"
            onClick={onMovePrev}
            type="button"
          >
            <ChevronLeftIcon />
          </button>
          <div className="StickyClue__inner">
            <span className="StickyClue__text">
              <span className="StickyClue__num">{num}</span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
            </span>
          </div>
          <button
            aria-label="Next clue"
            className="StickyClue__button"
            onClick={onMoveNext}
            type="button"
          >
            <ChevronRightIcon />
          </button>
        </>
      ) : null}
    </div>
  );
}
