import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { DEFAULT_HTML_TAGS } from '../../utils/general';
import testData from './../../testData/test.valid.1';
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { render, screen, store } from './../../utils/rtl';
import { initialiseStore } from './../../utils/test';
import Clue from './Clue';

test('it renders', () => {
  render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      breakpoint="xl"
      col={0}
      id="1-across"
      isHighlighted={false}
      num="1"
      row={0}
      text="Clue text inc <em>markup</em>"
    />,
  );

  screen.getByText('1');
  screen.getByText(/clue text inc/i);
  const markup = screen.getByText('markup');
  expect(markup.tagName).toBe('EM');
});

test('it renders answered', () => {
  render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered
      breakpoint="xl"
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
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      breakpoint="xl"
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
  const cellFocus = jest.fn();

  render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      breakpoint="xl"
      col={0}
      id="1-across"
      isHighlighted
      num="1"
      onCellFocus={cellFocus}
      row={0}
      text="Clue text"
    />,
  );

  const clue = screen.getByRole('button');
  userEvent.click(clue);

  expect(cellFocus).toHaveBeenCalledTimes(1);

  const selectedClue = store.getState().clues.clues.find((c) => c.selected);
  expect(selectedClue).toBeDefined();
  expect(selectedClue?.id).toBe('1-across');

  const selectedCell = store.getState().cells.cells.find((c) => c.selected);
  expect(selectedCell).toBeDefined();
  expect(selectedCell?.pos.col).toBe(0);
  expect(selectedCell?.pos.row).toBe(0);
});
