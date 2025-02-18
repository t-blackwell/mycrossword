import { getBem } from '~/utils/bem';
import { CellChange, CellFocus, GuardianCrossword, GuessGrid } from '~/types';
import { DEFAULT_CELL_MATCHER, DEFAULT_HTML_TAGS } from '~/utils/general';
import classNames from 'classnames';
import Crossword from '~/components/Crossword/Crossword';
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
  onComplete,
  saveGrid,
  stickyClue = 'auto',
  theme = 'blue',
}: MyCrosswordProps) {
  const bem = getBem('MyCrossword');

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
        data={data}
        id={id}
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
