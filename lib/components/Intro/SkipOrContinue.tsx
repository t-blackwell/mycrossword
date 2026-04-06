import { getBem } from '~/utils/bem';
import './SkipOrContinue.css';

const bem = getBem('SkipOrContinue');

interface SkipOrContinueProps {
  canContinue: boolean;
  countdown: number;
  onContinue: () => void;
}

export default function SkipOrContinue({
  canContinue,
  countdown,
  onContinue,
}: SkipOrContinueProps) {
  return (
    <button
      className={bem(
        'SkipOrContinue',
        canContinue ? 'SkipOrContinue--ready' : 'SkipOrContinue--waiting',
      )}
      type="button"
      onClick={() => canContinue && onContinue()}
      disabled={!canContinue}
      aria-label={
        canContinue ? 'Continue to crossword' : `Skip in ${countdown}`
      }
    >
      <span className={bem('SkipOrContinue__label')}>
        {canContinue ? 'Continue to crossword' : 'Skip in'}
      </span>
      <div
        className={bem(
          'SkipOrContinue__counter',
          canContinue ? 'SkipOrContinue__counter--ready' : undefined,
        )}
      >
        {canContinue ? (
          // chevron right icon '>'
          <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="16"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span>{countdown}</span>
        )}
      </div>
    </button>
  );
}
