import * as React from 'react';
import { Cell, SeparatorLocations } from '~/types';
import { getBem } from '~/utils/bem';
import { SolutionBox, getSolutionBoxes } from './solution';
import './SolutionDisplay.css';

function getSeparatorClass(
  separators: SeparatorLocations,
  letterIndex: number,
) {
  if (separators[','].includes(letterIndex)) {
    return 'SolutionDisplay__cell--hasSpace';
  }

  if (separators['-'].includes(letterIndex)) {
    return 'SolutionDisplay__cell--hasHyphen';
  }

  return undefined;
}

/** The last letter in `value` that wasn't already there */
function getTypedLetter(value: string, previous: string) {
  const letters = value.toUpperCase().replace(/[^\p{L}\p{N}]/gu, '');
  const typed = previous !== '' ? letters.replace(previous, '') : letters;

  return (typed !== '' ? typed : letters).slice(-1);
}

interface SolutionDisplayProps {
  /** Boxes to show; worked out from the cells if not given */
  boxes?: SolutionBox[];
  cells: Cell[];
  /**
   * Called when the user types in (or clears) a box. Returns whether the
   * letter was accepted; focus only moves on if it was.
   */
  onEdit?: (index: number, letter: string) => boolean;
  separators: SeparatorLocations;
  shuffling: boolean;
}

export default function SolutionDisplay({
  boxes: boxesProp,
  cells,
  onEdit,
  separators,
  shuffling,
}: SolutionDisplayProps) {
  const bem = getBem('SolutionDisplay');
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const boxes =
    boxesProp ??
    getSolutionBoxes(
      cells.map((cell) => cell.guess),
      '',
    );
  const editable = onEdit !== undefined;

  const isEditable = (i: number) => editable && boxes[i] !== undefined;

  // the next editable box in the given direction
  const findBox = (from: number, step: 1 | -1) => {
    for (let i = from + step; i >= 0 && i < boxes.length; i += step) {
      if (isEditable(i)) {
        return i;
      }
    }

    return undefined;
  };

  const focusBox = (i: number | undefined) => {
    if (i !== undefined) {
      inputRefs.current[i]?.focus({ preventScroll: true });
    }
  };

  return (
    <div className={bem('SolutionDisplay')}>
      {boxes.map((box, i) => {
        const showLetter = shuffling || box.source === 'grid';
        const letter = showLetter ? box.letter : '';
        const className = bem(
          'SolutionDisplay__letter',
          box.source === 'grid' ? 'SolutionDisplay__letter--populated' : null,
          shuffling && box.source === 'auto'
            ? 'SolutionDisplay__letter--auto'
            : null,
          shuffling && box.missing ? 'SolutionDisplay__letter--missing' : null,
        );

        return (
          <span
            className={bem(
              'SolutionDisplay__cell',
              getSeparatorClass(separators, i + 1),
            )}
            key={`${cells[i]?.val}-${i}`}
          >
            {isEditable(i) ? (
              <input
                aria-label={`Letter ${i + 1}`}
                autoCapitalize="characters"
                autoComplete="off"
                className={className}
                onChange={(event) => {
                  const typed = getTypedLetter(event.target.value, letter);

                  if (event.target.value === '') {
                    onEdit?.(i, '');
                  } else if (typed !== '' && onEdit?.(i, typed) === true) {
                    focusBox(findBox(i, 1));
                  }
                }}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    focusBox(findBox(i, -1));
                  } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    focusBox(findBox(i, 1));
                  } else if (
                    event.key === 'Backspace' &&
                    (letter === '' || box.source === 'auto')
                  ) {
                    // nothing in the grid here, so clear the previous box
                    const previous = findBox(i, -1);

                    if (previous !== undefined) {
                      event.preventDefault();
                      onEdit?.(previous, '');
                      focusBox(previous);
                    } else if (letter === '') {
                      event.preventDefault();
                    }
                  }
                }}
                ref={(node) => {
                  inputRefs.current[i] = node;
                }}
                spellCheck="false"
                value={letter}
              />
            ) : (
              <span className={className}>{letter}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
