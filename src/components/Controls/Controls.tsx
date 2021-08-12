import * as React from 'react';
import {
  check as cluesActionCheck,
  clear as cluesActionClear,
  reveal as cellsActionReveal,
} from 'redux/cellsSlice';
import { useAppDispatch } from 'redux/hooks';
import './Controls.css';

interface ControlsProps {
  selectedClueGroup?: string[];
}

function Controls({ selectedClueGroup }: ControlsProps): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <div className="Controls">
      {selectedClueGroup !== undefined ? (
        <>
          <button
            className="Controls__button"
            type="button"
            onClick={() => {
              dispatch(cluesActionCheck(selectedClueGroup));
            }}
          >
            Check
          </button>
          <button
            className="Controls__button"
            type="button"
            onClick={() => {
              dispatch(cellsActionReveal(selectedClueGroup));
            }}
          >
            Reveal
          </button>
          <button
            className="Controls__button"
            type="button"
            onClick={() => {
              dispatch(cluesActionClear(selectedClueGroup));
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

export default React.memo(Controls);
