import classNames from 'classnames';
import { CellFocus, CellPosition } from './../../interfaces';
import * as React from 'react';
import { select as cellsActionSelect } from './../../redux/cellsSlice';
import { select as cluesActionSelect } from './../../redux/cluesSlice';
import { useAppDispatch } from './../../redux/hooks';
import { decodeHtmlEntities, sanitizeHtml, stripHtml } from './../../utils/general';
import './Clue.scss';

interface ClueProps {
  answered: boolean;
  col: number;
  id: string;
  isHighlighted: boolean;
  num: string;
  onCellFocus?: (cellFocus: CellFocus) => void;
  row: number;
  text: string;
}

function Clue({
  answered,
  col,
  id,
  isHighlighted,
  num,
  onCellFocus,
  row,
  text,
}: ClueProps): JSX.Element {
  const dispatch = useAppDispatch();

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
      gridElement[0].focus();
    }
  }, []);

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
