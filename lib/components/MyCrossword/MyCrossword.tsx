import { getBem } from '~/utils/bem';
import {
  CellChange,
  CellFocus,
  GuardianCrossword,
  GuessGrid,
  MultiplayerConnection,
} from '~/types';
import { DEFAULT_CELL_MATCHER, DEFAULT_HTML_TAGS } from '~/utils/general';
import classNames from 'classnames';
import Crossword from '~/components/Crossword/Crossword';
import CrosswordStoresProvider from '~/stores/CrosswordStoresProvider';
import * as React from 'react';
import Intro, { IntroProps } from '~/components/Intro/Intro';
import { injectStyles } from '~/utils/styles';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect/useIsomorphicLayoutEffect';
import './MyCrossword.css';

export type Theme =
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
  multiplayer?: MultiplayerConnection;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  onComplete?: () => void;
  saveGrid?: (value: GuessGrid) => void;
  stickyClue?: 'always' | 'never' | 'auto';
  theme?: Theme;
  urlHash?: boolean;
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
  multiplayer,
  onCellChange,
  onCellFocus,
  onComplete,
  saveGrid,
  stickyClue = 'auto',
  theme = 'blue',
  urlHash = false,
  intro,
}: MyCrosswordProps) {
  const bem = getBem('MyCrossword');

  // add the stylesheet before the crossword is painted
  React.useInsertionEffect(() => {
    injectStyles();
  }, []);

  // the document can be without a <head> during the insertion effect (e.g.
  // when React re-renders the whole document after a hydration error), so
  // try again once the DOM has been updated, which is still before paint
  useIsomorphicLayoutEffect(() => {
    injectStyles();
  }, []);

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
        // each crossword has its own stores, so crosswords on the same page
        // don't share state (and a new id starts from fresh stores)
        <CrosswordStoresProvider key={id}>
          <Crossword
            allowedHtmlTags={allowedHtmlTags}
            allowMissingSolutions={allowMissingSolutions}
            cellMatcher={cellMatcher}
            cellSize={cellSize}
            data={data}
            id={id}
            loadGrid={loadGrid}
            multiplayer={multiplayer}
            onCellChange={onCellChange}
            onCellFocus={onCellFocus}
            onComplete={onComplete}
            saveGrid={saveGrid}
            stickyClue={stickyClue}
            urlHash={urlHash}
          />
        </CrosswordStoresProvider>
      )}
    </div>
  );
}
