import userEvent from '@testing-library/user-event';
import { GuardianCrossword } from 'interfaces';
import * as React from 'react';
import { updateGrid as cellsUpdateGrid } from 'redux/cellsSlice';
import { updateGrid as cluesUpdateGrid } from 'redux/cluesSlice';
import { initialiseCells } from 'utils/cell';
import { initialiseClues } from 'utils/clue';
import testData from '../../testData/test.valid.1';
import { render, screen, store } from '../../utils/test';
import Clue from './Clue';

function initialiseState(data: GuardianCrossword) {
  const cells = initialiseCells(
    data.dimensions.cols,
    data.dimensions.rows,
    data.entries,
  );

  const clues = initialiseClues(data.entries, cells);

  store.dispatch(cellsUpdateGrid(cells));
  store.dispatch(cluesUpdateGrid(clues));
}

test('it renders', () => {
  render(
    <Clue
      answered={false}
      col={0}
      id="1-across"
      isHighlighted={false}
      num="1"
      row={0}
      text="Clue text"
    />,
  );

  screen.getByText('1');
  screen.getByText('Clue text');
});

test('it renders answered', () => {
  render(
    <Clue
      answered
      col={0}
      id="1-across"
      isHighlighted={false}
      num="1"
      row={0}
      text="Clue text"
    />,
  );

  screen.getByText('1');
  screen.getByText('Clue text');

  const clue = screen.getByRole('button');
  expect(clue).toHaveClass('Clue--answered');
});

test('it renders highlighted', () => {
  render(
    <Clue
      answered={false}
      col={0}
      id="1-across"
      isHighlighted
      num="1"
      row={0}
      text="Clue text"
    />,
  );

  screen.getByText('1');
  screen.getByText('Clue text');

  const clue = screen.getByRole('button');
  expect(clue).toHaveClass('Clue--highlighted');
});

test('it selects clue', () => {
  initialiseState(testData);

  render(
    <Clue
      answered={false}
      col={0}
      id="1-across"
      isHighlighted
      num="1"
      row={0}
      text="Clue text"
    />,
  );

  const clue = screen.getByRole('button');
  userEvent.click(clue);

  const selectedClue = store.getState().clues.clues.find((c) => c.selected);
  expect(selectedClue).toBeDefined();
  expect(selectedClue?.id).toBe('1-across');

  const selectedCell = store.getState().cells.cells.find((c) => c.selected);
  expect(selectedCell).toBeDefined();
  expect(selectedCell?.pos.col).toBe(0);
  expect(selectedCell?.pos.row).toBe(0);
});
