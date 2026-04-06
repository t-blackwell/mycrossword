import { getBem } from '~/utils/bem';
import { CellChange, CellFocus, GuardianCrossword, GuessGrid } from '~/types';
import { DEFAULT_CELL_MATCHER, DEFAULT_HTML_TAGS } from '~/utils/general';
import classNames from 'classnames';
import Crossword from '~/components/Crossword/Crossword';
import React, { useState } from 'react';
import Intro from '~/components/Intro/Intro';
import './MyCrossword.css';

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

  const handleIntroContinue = () => {
    setShowIntro(false);
  };

  if (showIntro && intro) {
    return (
      <div
        className={classNames(
          bem(
            'MyCrossword',
            `MyCrossword--${theme}Theme`,
            'MyCrossword--showIntro',
          ),
          className,
        )}
      >
        <Intro
          node={intro.node}
          timeout={intro.timeout}
          onContinue={handleIntroContinue}
        />
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
