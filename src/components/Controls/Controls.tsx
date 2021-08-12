import * as React from 'react';
import {
  check as cluesActionCheck,
  clear as cluesActionClear,
  reveal as cellsActionReveal,
} from 'redux/cellsSlice';
import { getClues } from 'redux/cluesSlice';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import './Controls.css';

export default function Controls(): JSX.Element {
  const dispatch = useAppDispatch();
  const clues = useAppSelector(getClues);
  const selectedClue = clues.find((clue) => clue.selected);

  return (
    <div className="Controls">
      {selectedClue !== undefined ? (
        <>
          <button
            className="Controls__button"
            type="button"
            onClick={() => {
              dispatch(cluesActionCheck(selectedClue.group));
            }}
          >
            Check
          </button>
          <button
            className="Controls__button"
            type="button"
            onClick={() => {
              dispatch(cellsActionReveal(selectedClue.group));
            }}
          >
            Reveal
          </button>
          <button
            className="Controls__button"
            type="button"
            onClick={() => {
              dispatch(cluesActionClear(selectedClue.group));
            }}
          >
            Clear
          </button>
          <button className="Controls__button" type="button">
            Anagram helper
          </button>
        </>
      ) : null}
    </div>
  );
}
