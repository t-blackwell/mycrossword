import classNames from 'classnames';
import * as React from 'react';
import { select as cellsActionSelect } from 'redux/cellsSlice';
import { select as cluesActionSelect } from 'redux/cluesSlice';
import { useAppDispatch } from 'redux/hooks';
import { decodeHtmlEntities, sanitizeHtml, stripHtml } from 'utils/general';
import './Clue.scss';

interface ClueProps {
  answered: boolean;
  col: number;
  id: string;
  isHighlighted: boolean;
  num: string;
  row: number;
  text: string;
}

function Clue({
  answered,
  id,
  isHighlighted,
  num,
  col,
  row,
  text,
}: ClueProps): JSX.Element {
  const dispatch = useAppDispatch();

  const updateSelectedClue = React.useCallback(() => {
    dispatch(cluesActionSelect(id));
    dispatch(cellsActionSelect({ col, row }));

    // move focus back to grid (TODO: change to use React.forwardRef?)
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
