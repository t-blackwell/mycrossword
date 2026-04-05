import { getBem } from '~/utils/bem';
import { CellChange, CellFocus, GuardianCrossword, GuessGrid } from '~/types';
import { DEFAULT_CELL_MATCHER, DEFAULT_HTML_TAGS } from '~/utils/general';
import classNames from 'classnames';
import Crossword from '~/components/Crossword/Crossword';
import React, { useEffect, useRef, useState } from 'react';
import './MyCrossword.css';

type Timeout = ReturnType<typeof setInterval>;

type Theme =
  | 'red'
  | 'pink'
  | 'purple'
  | 'deepPurple'
  | 'indigo'
  | 'blue'
  | 'lightBlue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'deepOrange'
  | 'blueGrey';

export interface MyCrosswordProps {
  allowedHtmlTags?: string[];
  allowMissingSolutions?: boolean;
  cellMatcher?: RegExp;
  cellSize?: number;
  className?: string;
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  onComplete?: () => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  stickyClue?: 'always' | 'never' | 'auto';
  theme?: Theme;
  /**
   * Optional intro screen, e.g. for welcome or advert. If timeout is set, shows countdown before continue.
   */
  intro?: {
    node: React.ReactNode;
    timeout?: number; // ms
  };
}

export default function MyCrossword({
  allowedHtmlTags = DEFAULT_HTML_TAGS,
  allowMissingSolutions = false,
  cellSize = 31,
  cellMatcher = DEFAULT_CELL_MATCHER,
  className,
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  onComplete,
  saveGrid,
  stickyClue = 'auto',
  theme = 'blue',
  intro,
}: MyCrosswordProps) {
  const bem = getBem('MyCrossword');

  // Intro state
  const [showIntro, setShowIntro] = useState(intro !== undefined);
  const [countdown, setCountdown] = useState(
    intro?.timeout !== undefined ? Math.ceil(intro.timeout / 1000) : 0,
  );
  const [canContinue, setCanContinue] = useState(intro?.timeout === undefined);
  const timerRef = useRef<Timeout | null>(null);

  const handleClearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (intro === undefined || intro.timeout === undefined) {
      setCanContinue(true);
      return;
    }

    setCountdown(Math.ceil(intro.timeout / 1000));
    setShowIntro(true);
    setCanContinue(false);

    handleClearTimer();
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, intro.timeout! - elapsed);

      setCountdown(Math.ceil(left / 1000));

      if (left <= 0) {
        setCanContinue(true);
        handleClearTimer();
      }
    }, 250);

    return () => {
      handleClearTimer();
    };
  }, [intro?.timeout, intro?.node, id]);

  const handleSkip = () => {
    if (!canContinue) return;
    setShowIntro(false);
    handleClearTimer();
  };

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

  if (showIntro && intro) {
    return (
      <div
        className={classNames(
          bem('MyCrossword', `MyCrossword--${theme}Theme`),
          className,
          'MyCrossword-intro',
        )}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 32 }}>{intro.node}</div>
        <button
          type="button"
          onClick={handleSkip}
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

  return (
    <div
      className={classNames(
        bem('MyCrossword', `MyCrossword--${theme}Theme`),
        className,
      )}
    >
      <Crossword
        allowedHtmlTags={allowedHtmlTags}
        allowMissingSolutions={allowMissingSolutions}
        cellMatcher={cellMatcher}
        cellSize={cellSize}
        data={data}
        id={id}
        key={id}
        loadGrid={loadGrid}
        onCellChange={onCellChange}
        onCellFocus={onCellFocus}
        onComplete={onComplete}
        saveGrid={saveGrid}
        stickyClue={stickyClue}
      />
    </div>
  );
}
