import { decodeHtmlEntities, sanitize } from '~/utils/html';

function normalizeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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
          __html: sanitize(decodeHtmlEntities(clue), {
            allowedTags: allowedHtmlTags,
          }),
        }}
      />
    );
  }

  // use a Unicode-aware regex that includes accented characters
  // this matches any sequence of letters (including accented ones) as a word
  const cleanClue = sanitize(decodeHtmlEntities(clue));
  const words = cleanClue.split(/\b([\p{L}\p{M}]+)\b/u);

  return (
    <>
      {words.map((word, i) => {
        if (i % 2 === 1) {
          return (
            <span
              className={className}
              key={`${word}-${i}`}
              onClick={() => onClick(normalizeAccents(word))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onClick(normalizeAccents(word));
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
