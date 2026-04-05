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
        <span>{canContinue ? '>' : countdown}</span>
      </div>
    </button>
  );
}
