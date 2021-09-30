/* eslint-disable no-plusplus */
import classNames from 'classnames';
import { Cell } from 'interfaces';
import * as React from 'react';
import './SolutionDisplay.scss';

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
  shuffling: boolean;
}

export default function SolutionDisplay({
  cells,
  letters,
  shuffling,
}: SolutionDisplayProps): JSX.Element {
  // remove the populated grid cells from the anagram fodder
  const flatCells = cells.map((cell) => cell.guess).join('');
  const filteredLetters =
    letters !== undefined
      ? filterLetters(letters?.toUpperCase(), flatCells)
      : undefined;
  let j = 0;

  return (
    <div className="SolutionDisplay">
      {cells.map((cell, i) => (
        <span
          className={classNames(
            'SolutionDisplay__letter',
            cell.guess !== undefined
              ? 'SolutionDisplay__letter--populated'
              : null,
            shuffling &&
              cell.guess !== undefined &&
              letters !== undefined &&
              letters !== '' &&
              !letters.toUpperCase().includes(cell.guess)
              ? 'SolutionDisplay__letter--missing'
              : null,
          )}
          // eslint-disable-next-line react/no-array-index-key
          key={`${cell.val}-${i}`}
        >
          {cell.guess ??
            (shuffling &&
            filteredLetters !== undefined &&
            filteredLetters !== '' &&
            filteredLetters[j] !== undefined
              ? filteredLetters[j++]
              : null)}
        </span>
      ))}
    </div>
  );
}
