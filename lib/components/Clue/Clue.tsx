import * as React from 'react';
import { getBem } from '~/utils/bem';
import type { CellFocus, CellPosition } from '~/types';
import { useCellsStore } from '~/stores/useCellsStore';
import { useCluesStore } from '~/stores/useCluesStore';
import { isInPerimeterRect } from '~/utils/general';
import { decodeHtmlEntities, sanitize } from '~/utils/html';
import './Clue.css';

interface ClueProps {
  allowedHtmlTags: string[];
  answered: boolean;
  col: number;
  containerRef?: React.RefObject<HTMLDivElement>;
  id: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  isHighlighted: boolean;
  num: string;
  onCellFocus?: (cellFocus: CellFocus) => void;
  row: number;
  scrollTo?: boolean;
  text: string;
}

function Clue({
  allowedHtmlTags,
  answered,
  col,
  containerRef,
  id,
  inputRef,
  isHighlighted,
  num,
  onCellFocus,
  row,
  scrollTo,
  text,
}: ClueProps) {
  const bem = getBem('Clue');

  const ref = React.useRef<HTMLDivElement>(null);
  const selectCells = useCellsStore((state) => state.select);
  const selectClue = useCluesStore((state) => state.select);

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
    selectClue(id);
    selectCells(pos);

    // TODO: don't call if on current clue's first cell
    cellFocus(pos, id);

    inputRef?.current?.focus({ preventScroll: true });
  }, [inputRef]);

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

  return (
    <div
      className={bem(
        'Clue',
        answered ? 'Clue--answered' : null,
        isHighlighted ? 'Clue--highlighted' : null,
      )}
      onClick={updateSelectedClue}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          updateSelectedClue();
        }
      }}
      role="button"
      ref={ref}
      tabIndex={0}
    >
      <span className={bem('Clue__num')}>{num}</span>
      <span
        className={bem('Clue__text')}
        dangerouslySetInnerHTML={{
          __html: sanitize(decodeHtmlEntities(text), {
            allowedTags: allowedHtmlTags,
          }),
        }}
        data-text={sanitize(decodeHtmlEntities(text))}
      />
    </div>
  );
}

export default React.memo(Clue);
