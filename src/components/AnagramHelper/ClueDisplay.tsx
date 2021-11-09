/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import {
  decodeHtmlEntities,
  sanitizeHtml,
  stripHtml,
} from './../../utils/general';

interface ClueDisplayProps {
  className?: string;
  clue: string;
  onClick: (word: string) => void;
  splitWords?: boolean;
}

export default function ClueDisplay({
  className,
  clue,
  onClick,
  splitWords = false,
}: ClueDisplayProps): JSX.Element {
  if (!splitWords) {
    return (
      <span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(clue) }}
      />
    );
  }

  // regex split on word boundaries
  const cleanClue = stripHtml(clue);
  const words = decodeHtmlEntities(cleanClue).split(/\b(\w+)\b/);

  return (
    <>
      {words.map((word, i) => {
        if (i % 2 === 1) {
          return (
            <span
              className={className}
              key={`${word}-${i}`}
              onClick={() => onClick(word)}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  onClick(word);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {word}
            </span>
          );
        }

        return <span key={`${word}-${i}`}>{word}</span>;
      })}
    </>
  );
}
