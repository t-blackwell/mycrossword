import * as React from 'react';

export interface IntroProps {
  node: React.ReactNode;
  timeout?: number; // ms
  onContinue: () => void;
}

export default function Intro({ node, timeout, onContinue }: IntroProps) {
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

  function CircleCounter({ count, ready }: { count: number; ready: boolean }) {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2px solid #1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 15,
          color: '#1976d2',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        {ready ? '›' : count}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 32 }}>{node}</div>
      <button
        type="button"
        onClick={() => canContinue && onContinue()}
        disabled={!canContinue}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'none',
          border: 'none',
          cursor: canContinue ? 'pointer' : 'default',
          padding: 0,
          fontSize: 16,
          color: 'inherit',
          opacity: canContinue ? 1 : 0.6,
        }}
        aria-label={
          canContinue ? 'Continue to crossword' : `Skip in ${countdown}`
        }
      >
        <span>{canContinue ? 'Continue to crossword' : 'Skip in'}</span>
        <CircleCounter count={countdown} ready={canContinue} />
      </button>
    </div>
  );
}
