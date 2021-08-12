import classNames from 'classnames';
import * as React from 'react';
import './Clue.css';

interface ClueProps {
  answered: boolean;
  num: string;
  onClick: () => void;
  isHighlighted: boolean;
  text: string;
}

export default function Clues({
  answered,
  num,
  onClick,
  isHighlighted,
  text,
}: ClueProps): JSX.Element {
  return (
    <div
      className={classNames(
        'Clue',
        answered ? 'Clue--answered' : null,
        isHighlighted ? 'Clue--highlighted' : null,
      )}
      onClick={onClick}
      onKeyPress={(event) => {
        if (event.key === 'Enter') {
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className="Clue__num">{num}</span>
      <span className="Clue__text">{text}</span>
    </div>
  );
}
