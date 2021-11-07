/* eslint-disable no-plusplus */
import classNames from 'classnames';
import { Cell, SeparatorLocations } from './../../interfaces';
import * as React from 'react';
import './SolutionDisplay.scss';

function getSeparatorClass(
  separators: SeparatorLocations,
  letterIndex: number,
) {
  const includesLetter = (seps: number[]) => seps.includes(letterIndex);

  const spaces = separators[','];
  if (includesLetter(spaces)) {
    return 'SolutionDisplay__letter--hasSpace';
  }

  const hyphens = separators['-'];
  if (includesLetter(hyphens)) {
    return 'SolutionDisplay__letter--hasHyphen';
  }

  return undefined;
}

function filterLetters(letters: string, blacklist: string) {
  let filteredLetters = letters;

  blacklist.split('').forEach((badLetter) => {
    filteredLetters = filteredLetters.replace(badLetter, '');
  });

  return filteredLetters;
}

interface SolutionDisplayProps {
  cells: Cell[];
  letters?: string;
  separators: SeparatorLocations;
  shuffling: boolean;
}

export default function SolutionDisplay({
  cells,
  letters,
  separators,
  shuffling,
}: SolutionDisplayProps): JSX.Element {
  // remove the populated grid cells from the anagram fodder
  const flatCells = cells.map((cell) => cell.guess).join('');
  const filteredLetters =
    letters !== undefined
      ? filterLetters(letters?.toUpperCase(), flatCells)
      : undefined;
  let upperLetters = letters?.toUpperCase();
  let j = 0;

  return (
    <div className="SolutionDisplay">
      {cells.map((cell, i) => {
        const inLetters =
          cell.guess !== undefined && upperLetters?.includes(cell.guess);
        if (inLetters) {
          upperLetters = upperLetters?.replace(cell.guess!, '');
        }

        return (
          <span
            className={classNames(
              'SolutionDisplay__letter',
              cell.guess !== undefined
                ? 'SolutionDisplay__letter--populated'
                : null,
              shuffling &&
                cell.guess !== undefined &&
                letters !== undefined &&
                !inLetters
                ? 'SolutionDisplay__letter--missing'
                : null,
              getSeparatorClass(separators, i + 1),
            )}
            // eslint-disable-next-line react/no-array-index-key
            key={`${cell.val}-${i}`}
          >
            {cell.guess ??
              (shuffling &&
              filteredLetters !== undefined &&
              filteredLetters[j] !== undefined
                ? filteredLetters[j++]
                : null)}
          </span>
        );
      })}
    </div>
  );
}
