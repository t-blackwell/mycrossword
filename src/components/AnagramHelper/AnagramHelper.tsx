import classNames from 'classnames';
import { Button } from 'components';
import { Cell, Clue, SeparatorLocations } from 'interfaces';
import * as React from 'react';
import './AnagramHelper.scss';
import ClueDisplay from './ClueDisplay';
import SolutionDisplay from './SolutionDisplay';
import WordWheel from './WordWheel';

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
  groupCells: Cell[];
  groupSeparators: SeparatorLocations;
  height: number;
  onClose: () => void;
  solutionLength: number;
  width: number;
}

export default function AnagramHelper({
  clue,
  groupCells,
  groupSeparators,
  height,
  onClose,
  solutionLength,
  width,
}: AnagramHelperProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [letters, setLetters] = React.useState('');
  const [shuffling, setShuffling] = React.useState(false);
  const enableButtons = letters !== '' || shuffling;

  const reset = () => {
    setLetters('');
    setShuffling(false);
    inputRef.current?.focus();
  };

  const shuffle = () => {
    if (letters !== '') {
      const shuffledLetters = letters
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');
      setLetters(shuffledLetters);
      setShuffling(true);
      buttonRef.current?.focus();
    }
  };

  const appendWord = (word: string) => {
    const newLetters = letters + word;
    setLetters(newLetters.substr(0, solutionLength));
    inputRef.current?.focus();
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
          <WordWheel
            letters={letters}
            populatedLetters={groupCells.map((cell) => cell.guess).join('')}
          />
        ) : (
          <>
            <input
              className="AnagramHelper__input"
              maxLength={solutionLength}
              onChange={(event) => setLetters(event.target.value)}
              onKeyDown={(event) => {
                if (['Enter', 'NumpadEnter'].includes(event.code)) {
                  shuffle();
                } else if (event.code === 'Escape') {
                  // on esc, clear or close
                  if (letters === '') {
                    onClose();
                  } else {
                    reset();
                  }
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
          <Button disabled={!enableButtons} onClick={shuffle} ref={buttonRef}>
            Shuffle
          </Button>
        </div>
        <p className="AnagramHelper__clue">
          <span className="AnagramHelper__clueNum">{`${clue?.number} ${clue?.direction}`}</span>
          <ClueDisplay
            className="AnagramHelper__clickableWord"
            clue={clue?.clue}
            onClick={(word) => appendWord(word)}
            splitWords={!shuffling}
          />
        </p>
        <SolutionDisplay
          cells={groupCells}
          letters={letters}
          separators={groupSeparators}
          shuffling={shuffling}
        />
      </div>
    </div>
  );
}
