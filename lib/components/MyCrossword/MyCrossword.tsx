import { getBem } from '~/utils/bem';
import { CellChange, CellFocus, GuardianCrossword, GuessGrid } from '~/types';
import { DEFAULT_CELL_MATCHER, DEFAULT_HTML_TAGS } from '~/utils/general';
import classNames from 'classnames';
import Crossword from '~/components/Crossword/Crossword';
import * as React from 'react';
import Intro, { IntroProps } from '~/components/Intro/Intro';
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
  intro?: Omit<IntroProps, 'onContinue'>;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  onComplete?: () => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  stickyClue?: 'always' | 'never' | 'auto';
  theme?: Theme;
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
  const [showIntro, setShowIntro] = React.useState(intro !== undefined);

  const handleIntroContinue = () => {
    setShowIntro(false);
  };

  return (
    <div
      className={classNames(
        bem(
          'MyCrossword',
          `MyCrossword--${theme}Theme`,
          showIntro && intro !== undefined ? 'MyCrossword--showIntro' : null,
        ),
        className,
      )}
    >
      {showIntro && intro !== undefined ? (
        <Intro
          node={intro.node}
          countdown={intro.countdown}
          continueLabel={intro.continueLabel}
          onContinue={handleIntroContinue}
        />
      ) : (
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
      )}
    </div>
  );
}
