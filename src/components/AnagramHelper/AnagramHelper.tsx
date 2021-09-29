import classNames from 'classnames';
import { Button, cellSize } from 'components';
import { Clue } from 'interfaces';
import * as React from 'react';
import './AnagramHelper.scss';

interface CloseIconProps {
  className?: string;
}

function CloseIcon({ className }: CloseIconProps): JSX.Element {
  return (
    <svg className={className}>
      <g>
        <path d="M21 9.8l-.8-.8-5.2 4.8-5.2-4.8-.8.8 4.8 5.2-4.8 5.2.8.8 5.2-4.8 5.2 4.8.8-.8-4.8-5.2 4.8-5.2" />
      </g>
    </svg>
  );
}

interface AnagramHelperProps {
  clue?: Clue;
  cols: number;
  onClose: () => void;
  rows: number;
  solutionLength: number;
}

export default function AnagramHelper({
  clue,
  cols,
  onClose,
  rows,
  solutionLength,
}: AnagramHelperProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [letters, setLetters] = React.useState('');
  const [shuffling, setShuffling] = React.useState(false);
  const width = cols * cellSize + cols + 1;
  const height = rows * cellSize + rows + 1;
  const enableButtons = letters !== '' || shuffling;

  const reset = () => {
    setLetters('');
    setShuffling(false);
    inputRef.current?.focus();
  };

  const shuffle = () => {
    if (letters !== '') {
      setShuffling(true);
    }
  };

  React.useEffect(() => {
    reset();
  }, [clue?.id]);

  return (
    <div
      className="AnagramHelper"
      style={{ maxWidth: width, maxHeight: height, width, height }}
    >
      <Button
        ariaLabel="Close"
        className="AnagramHelper__closeButton"
        onClick={onClose}
        variant="outlined"
      >
        <CloseIcon className="AnagramHelper__closeButtonIcon" />
      </Button>
      <div className="AnagramHelper__top">
        {shuffling ? (
          <span>{letters}</span>
        ) : (
          <>
            <input
              className="AnagramHelper__input"
              maxLength={solutionLength}
              onChange={(event) => setLetters(event.target.value)}
              onKeyPress={(event) => {
                if (['Enter', 'NumpadEnter'].includes(event.code)) {
                  shuffle();
                }
              }}
              placeholder="Enter letters"
              ref={inputRef}
              spellCheck="false"
              value={letters}
            />
            <span
              className={classNames(
                'AnagramHelper__counter',
                letters === '' ? 'AnagramHelper__counter--hidden' : null,
              )}
            >
              {letters.length}/{solutionLength}
            </span>
          </>
        )}
      </div>

      <div className="AnagramHelper__bottom">
        <div className="AnagramHelper__buttons">
          <Button disabled={!enableButtons} onClick={reset}>
            Start again
          </Button>
          <Button disabled={!enableButtons} onClick={shuffle}>
            Shuffle
          </Button>
        </div>
        <p className="AnagramHelper__clue">
          <span className="AnagramHelper__clueNum">{`${clue?.number} ${clue?.direction}`}</span>
          {clue?.clue}
        </p>
        {/* <em>squares go here</em> */}
      </div>
    </div>
  );
}
