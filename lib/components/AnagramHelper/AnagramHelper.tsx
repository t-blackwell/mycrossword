import * as React from 'react';
import ClueDisplay from './ClueDisplay';
import SolutionDisplay from './SolutionDisplay';
import LetterTiles from './LetterTiles';
import { shuffleChanged, typedOrder } from './layout';
import { getSolutionBoxes, getUsedLetters } from './solution';
import { Cell, Char, Clue, SeparatorLocations } from '~/types';
import Button from '~/components/Button/Button';
import { getBem } from '~/utils/bem';
import CloseIcon from '~/icons/CloseIcon';
import './AnagramHelper.css';

interface AnagramHelperProps {
  allowedHtmlTags: string[];
  clue: Clue;
  groupCells: Cell[];
  groupSeparators: SeparatorLocations;
  /** Set (or clear) a cell's letter in the grid; returns false if rejected */
  onCellGuess?: (cell: Cell, guess: Char | undefined) => boolean;
  onClose: () => void;
  style?: React.CSSProperties;
}

export default function AnagramHelper({
  allowedHtmlTags,
  clue,
  groupCells,
  groupSeparators,
  onCellGuess,
  onClose,
  style,
}: AnagramHelperProps) {
  const bem = getBem('AnagramHelper');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [letters, setLetters] = React.useState('');
  const [shuffling, setShuffling] = React.useState(false);
  // indices into tileLetters, in wheel order
  const [order, setOrder] = React.useState<number[]>([]);
  const tileLetters = letters.toUpperCase().replace(/\s/g, '');
  const arrangedLetters = order.map((i) => tileLetters[i]).join('');
  const enableButtons = tileLetters !== '' || shuffling;
  const solutionLength = groupCells.length;
  const solutionBoxes = getSolutionBoxes(
    groupCells.map((cell) => cell.guess),
    shuffling ? arrangedLetters : '',
  );

  React.useEffect(() => {
    if (!shuffling) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [shuffling]);

  const reset = () => {
    setLetters('');
    setOrder([]);
    setShuffling(false);
  };

  const shuffle = () => {
    if (tileLetters !== '') {
      setOrder(
        shuffleChanged(shuffling ? order : typedOrder(tileLetters.length)),
      );
      setShuffling(true);
      buttonRef.current?.focus({ preventScroll: true });
    }
  };

  const appendWord = (word: string) => {
    setLetters((prev) => (prev + word).substring(0, solutionLength));
    inputRef.current?.focus({ preventScroll: true });
  };

  React.useEffect(() => {
    reset();
  }, [clue.id]);

  return (
    <div
      className={bem(
        'AnagramHelper',
        shuffling ? 'AnagramHelper--shuffling' : null,
      )}
      style={style}
    >
      <Button
        ariaLabel="Close"
        className={bem('AnagramHelper__closeButton')}
        onClick={onClose}
        variant="outlined"
      >
        <CloseIcon className={bem('AnagramHelper__closeButtonIcon')} />
      </Button>
      <div className={bem('AnagramHelper__top')}>
        {shuffling ? (
          <LetterTiles
            letters={tileLetters}
            order={order}
            usedLetters={getUsedLetters(solutionBoxes)}
          />
        ) : (
          <>
            <input
              autoComplete="off"
              className={bem('AnagramHelper__input')}
              maxLength={solutionLength}
              onChange={(event) => setLetters(event.target.value)}
              onKeyDown={(event) => {
                if (['Enter', 'NumpadEnter'].includes(event.code)) {
                  event.preventDefault();
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
              placeholder="Enter letters..."
              ref={inputRef}
              spellCheck="false"
              value={letters}
            />
            <span
              className={bem(
                'AnagramHelper__counter',
                letters === '' ? 'AnagramHelper__counter--hidden' : null,
              )}
            >
              {letters.length}/{solutionLength}
            </span>
          </>
        )}
      </div>

      <div className={bem('AnagramHelper__bottom')}>
        <div className={bem('AnagramHelper__buttons')}>
          <Button disabled={!enableButtons} onClick={reset} variant="outlined">
            Reset
          </Button>
          <Button
            disabled={!enableButtons}
            onClick={shuffle}
            onKeyDown={(event) => {
              if (event.code === 'Escape') {
                reset();
              }
            }}
            ref={buttonRef}
          >
            Shuffle
          </Button>
        </div>
        <p className={bem('AnagramHelper__clue')}>
          <span
            className={bem('AnagramHelper__clueNum')}
          >{`${clue.number} ${clue.direction}`}</span>
          <ClueDisplay
            allowedHtmlTags={allowedHtmlTags}
            className={bem('AnagramHelper__clickableWord')}
            clue={clue.clue}
            onClick={(word) => appendWord(word)}
            splitWords={!shuffling}
          />
        </p>
        <SolutionDisplay
          boxes={solutionBoxes}
          cells={groupCells}
          onEdit={
            onCellGuess !== undefined
              ? (index, letter) =>
                  onCellGuess(
                    groupCells[index],
                    letter !== '' ? (letter as Char) : undefined,
                  )
              : undefined
          }
          separators={groupSeparators}
          shuffling={shuffling}
        />
      </div>
    </div>
  );
}
