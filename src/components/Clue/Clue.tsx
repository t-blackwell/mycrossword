import classNames from 'classnames';
import * as React from 'react';
import { CellFocus, CellPosition } from './../../interfaces';
import { select as cellsActionSelect } from './../../redux/cellsSlice';
import { select as cluesActionSelect } from './../../redux/cluesSlice';
import { useAppDispatch } from './../../redux/hooks';
import {
  decodeHtmlEntities,
  isInPerimeterRect,
  sanitizeHtml,
  stripHtml,
} from './../../utils/general';

interface ClueProps {
  answered: boolean;
  breakpoint: string;
  col: number;
  containerRef?: React.RefObject<HTMLDivElement>;
  id: string;
  isHighlighted: boolean;
  num: string;
  onCellFocus?: (cellFocus: CellFocus) => void;
  row: number;
  scrollTo?: boolean;
  text: string;
}

function Clue({
  answered,
  breakpoint,
  col,
  containerRef,
  id,
  isHighlighted,
  num,
  onCellFocus,
  row,
  scrollTo,
  text,
}: ClueProps): JSX.Element {
  const dispatch = useAppDispatch();
  const ref = React.useRef<HTMLDivElement>(null);

  // scroll to ensure the clue is visible
  React.useEffect(() => {
    if (
      scrollTo &&
      ref.current !== null &&
      containerRef !== undefined &&
      containerRef.current !== null
    ) {
      const rect = ref.current.getBoundingClientRect();
      const perimeterRect = containerRef.current.getBoundingClientRect();
      const inView = isInPerimeterRect(rect, perimeterRect);

      // prevent scroll if clue is already in view
      if (!inView) {
        ref.current.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [scrollTo]);

  const cellFocus = (pos: CellPosition, clueId: string) => {
    if (onCellFocus !== undefined) {
      onCellFocus({
        pos,
        clueId,
      });
    }
  };

  const updateSelectedClue = React.useCallback(() => {
    const pos = { col, row };
    dispatch(cluesActionSelect(id));
    dispatch(cellsActionSelect(pos));

    // TODO: don't call if on current clue's first cell
    cellFocus(pos, id);

    const gridElement = document.querySelectorAll<HTMLElement>('.Grid');
    if (gridElement.length === 1) {
      gridElement[0].focus({
        preventScroll: ['md', 'lg'].includes(breakpoint),
      });
    }
  }, [breakpoint]);

  return (
    <div
      className={classNames(
        'Clue',
        answered ? 'Clue--answered' : null,
        isHighlighted ? 'Clue--highlighted' : null,
      )}
      onClick={updateSelectedClue}
      onKeyPress={(event) => {
        if (event.key === 'Enter') {
          updateSelectedClue();
        }
      }}
      role="button"
      ref={ref}
      tabIndex={0}
    >
      <span className="Clue__num">{num}</span>
      <span
        className="Clue__text"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
        data-text={decodeHtmlEntities(stripHtml(text))}
      />
    </div>
  );
}

export default React.memo(Clue);
