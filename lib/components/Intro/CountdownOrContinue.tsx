import { getBem } from '~/utils/bem';
import './CountdownOrContinue.css';

const bem = getBem('CountdownOrContinue');

interface CountdownOrContinueProps {
  canContinue: boolean;
  continueLabel?: string;
  countdown: number;
  countdownLabel?: string;
  onContinue: () => void;
}

export default function CountdownOrContinue({
  canContinue,
  continueLabel = 'Continue to crossword',
  countdown,
  countdownLabel = 'Skip in',
  onContinue,
}: CountdownOrContinueProps) {
  return (
    <button
      className={bem(
        'CountdownOrContinue',
        canContinue
          ? 'CountdownOrContinue--ready'
          : 'CountdownOrContinue--waiting',
      )}
      type="button"
      onClick={() => canContinue && onContinue()}
      disabled={!canContinue}
      aria-label={
        canContinue ? continueLabel : `${countdownLabel} ${countdown}`
      }
    >
      <span className={bem('CountdownOrContinue__label')}>
        {canContinue ? continueLabel : countdownLabel}
      </span>
      <div
        className={bem(
          'CountdownOrContinue__counter',
          canContinue ? 'CountdownOrContinue__counter--ready' : undefined,
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
