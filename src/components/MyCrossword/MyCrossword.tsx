import classNames from 'classnames';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Crossword } from '../../components';
import { DEFAULT_CELL_MATCHER, DEFAULT_HTML_TAGS } from '../../utils/general';
import { useBreakpoint } from './../../hooks';
import type {
  GuardianCrossword,
  GuessGrid,
  CellChange,
  CellFocus,
} from './../../interfaces';
import { store } from './../../redux/store';

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
  className?: string;
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  stickyClue?: 'always' | 'never' | 'auto';
  theme?: Theme;
}

export default function MyCrossword({
  allowedHtmlTags = DEFAULT_HTML_TAGS,
  allowMissingSolutions = false,
  cellMatcher = DEFAULT_CELL_MATCHER,
  className,
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  saveGrid,
  stickyClue = 'auto',
  theme = 'blue',
}: MyCrosswordProps) {
  const breakpoint = useBreakpoint();

  return (
    <div
      className={classNames(
        'MyCrossword',
        `MyCrossword--${breakpoint}`,
        `MyCrossword--${theme}Theme`,
        className,
      )}
    >
      <Provider store={store}>
        <Crossword
          allowedHtmlTags={allowedHtmlTags}
          allowMissingSolutions={allowMissingSolutions}
          cellMatcher={cellMatcher}
          data={data}
          id={id}
          loadGrid={loadGrid}
          onCellChange={onCellChange}
          onCellFocus={onCellFocus}
          saveGrid={saveGrid}
          stickyClue={stickyClue}
        />
      </Provider>
    </div>
  );
}
