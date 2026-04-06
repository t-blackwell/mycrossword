import * as React from 'react';
import { getBem } from '~/utils/bem';
import SkipOrContinue from './SkipOrContinue';
import './Intro.css';

// TODO: add continue and skip text props (default "Continue to crossword" and "Skip in") and i18n support
// TODO: update readme

export interface IntroProps {
  node: React.ReactNode;
  timeout?: number; // ms
  onContinue: () => void;
}

export default function Intro({ node, timeout, onContinue }: IntroProps) {
  const bem = getBem('Intro');

  const [countdown, setCountdown] = React.useState(
    timeout !== undefined ? Math.ceil(timeout / 1000) : 0,
  );
  const [canContinue, setCanContinue] = React.useState(timeout === undefined);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => {
    if (timeout === undefined) {
      setCanContinue(true);
      return;
    }

    setCountdown(Math.ceil(timeout / 1000));
    setCanContinue(false);
    handleClearTimer();

    const start = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, timeout - elapsed);

      setCountdown(Math.ceil(left / 1000));

      if (left <= 0) {
        setCanContinue(true);
        handleClearTimer();
      }
    }, 250);
    return () => {
      handleClearTimer();
    };
  }, [timeout, node]);

  return (
    <div className={bem('Intro')}>
      <div className={bem('Intro__content')}>{node}</div>
      <SkipOrContinue
        canContinue={canContinue}
        countdown={countdown}
        onContinue={onContinue}
      />
    </div>
  );
}
