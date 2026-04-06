import * as React from 'react';
import { getBem } from '~/utils/bem';
import SkipOrContinue from './CountdownOrContinue';
import './Intro.css';

// TODO: update readme

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

  const [canContinue, setCanContinue] = React.useState(countdown === undefined);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => {
    if (countdown === undefined) {
      setCanContinue(true);
      return;
    }

    setCountdownValue(countdown.seconds);
    setCanContinue(false);
    handleClearTimer();

    const start = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, countdown.seconds * 1000 - elapsed);

      setCountdownValue(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        setCanContinue(true);
        handleClearTimer();
      }
    }, 250);
    return () => {
      handleClearTimer();
    };
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
