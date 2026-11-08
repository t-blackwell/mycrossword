import * as React from 'react';
import { getBem } from '~/utils/bem';
import SkipOrContinue from './CountdownOrContinue';
import './Intro.css';

export interface IntroProps {
  continueLabel?: string;
  countdown?: {
    seconds: number;
    label?: string;
  };
  node: React.ReactNode;
  onContinue: () => void;
}

export default function Intro({
  continueLabel,
  countdown,
  node,
  onContinue,
}: IntroProps) {
  const bem = getBem('Intro');

  const [countdownValue, setCountdownValue] = React.useState(
    countdown !== undefined ? countdown.seconds : 0,
  );
  const [countdownFor, setCountdownFor] = React.useState({ countdown, node });
  const canContinue = countdown === undefined || countdownValue <= 0;

  // restart the countdown when the intro changes (while rendering, so the
  // previous countdown's value is never shown)
  if (countdownFor.countdown !== countdown || countdownFor.node !== node) {
    setCountdownFor({ countdown, node });
    setCountdownValue(countdown !== undefined ? countdown.seconds : 0);
  }

  React.useEffect(() => {
    if (countdown === undefined) {
      return;
    }

    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, countdown.seconds * 1000 - elapsed);

      setCountdownValue(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [countdown, node]);

  return (
    <div className={bem('Intro')}>
      <div className={bem('Intro__content')}>{node}</div>
      <SkipOrContinue
        canContinue={canContinue}
        countdown={countdownValue}
        onContinue={onContinue}
        continueLabel={continueLabel}
        countdownLabel={countdown?.label}
      />
    </div>
  );
}
