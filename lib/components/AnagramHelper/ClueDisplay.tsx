import { decodeHtmlEntities, sanitize } from '~/utils/html';

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
          __html: sanitize(clue, { allowedTags: allowedHtmlTags }),
        }}
      />
    );
  }

  // regex split on word boundaries
  const cleanClue = sanitize(clue);
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
              onKeyDown={(event) => {
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
