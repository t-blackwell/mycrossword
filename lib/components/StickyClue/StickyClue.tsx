import ChevronLeftIcon from '~/icons/ChevronLeftIcon';
import ChevronRightIcon from '~/icons/ChevronRightIcon';
import { getBem } from '~/utils/bem';
import { decodeHtmlEntities, sanitize } from '~/utils/html';
import './StickyClue.css';

interface StickyClueProps {
  allowedTags: string[];
  num?: string;
  onMoveNext: () => void;
  onMovePrev: () => void;
  show: 'always' | 'auto';
  text?: string;
}

export default function StickyClue({
  allowedTags,
  num,
  onMoveNext,
  onMovePrev,
  show,
  text,
}: StickyClueProps) {
  const bem = getBem('StickyClue');

  return (
    <div className={bem('StickyClue', `StickyClue--${show}`)}>
      {text !== undefined && num !== undefined ? (
        <>
          <button
            aria-label="Previous clue"
            className={bem('StickyClue__button')}
            onClick={onMovePrev}
            type="button"
          >
            <ChevronLeftIcon />
          </button>
          <div className={bem('StickyClue__inner')}>
            <span className={bem('StickyClue__text')}>
              <span className={bem('StickyClue__num')}>{num}</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: sanitize(decodeHtmlEntities(text), { allowedTags }),
                }}
              />
            </span>
          </div>
          <button
            aria-label="Next clue"
            className={bem('StickyClue__button')}
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
