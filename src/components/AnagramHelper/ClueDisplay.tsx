import * as React from 'react';
import {
  decodeHtmlEntities,
  sanitizeHtml,
  stripHtml,
} from './../../utils/general';

interface ClueDisplayProps {
  allowedHtmlTags: string[];
  className?: string;
  clue: string;
  onClick: (word: string) => void;
  splitWords?: boolean;
}

export default function ClueDisplay({
  allowedHtmlTags,
  className,
  clue,
  onClick,
  splitWords = false,
}: ClueDisplayProps) {
  if (!splitWords) {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(clue, allowedHtmlTags),
        }}
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
