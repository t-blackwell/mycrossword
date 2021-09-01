import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { initialiseStore } from 'utils/test';
import testData from '../../testData/test.valid.1';
import { render, screen, store } from '../../utils/rtl';
import Clue from './Clue';

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
  initialiseStore(store, testData);

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
