import * as React from 'react';
import { DEFAULT_HTML_TAGS } from '../../utils/general';
import testData from './../../testData/test.valid.1';
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { render, screen, store } from './../../utils/rtl';
import { initialiseStore } from './../../utils/test';
import Clues from './Clues';

beforeEach(() => {
  initialiseStore(store, testData);
});

test('it renders', () => {
  const { clues } = store.getState().clues;

  render(
    <Clues
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      breakpoint="xl"
      entries={clues}
    />,
  );

  screen.getByText('Across');
  screen.getByText('Down');

  expect(screen.getAllByText('1').length).toBe(2); // across and down
  screen.getByText('2');
  screen.getByText('3');
  screen.getByText('4');

  screen.getByText('Toy on a string (2-2)');
  screen.getByText('Have a rest (3,4)');
  screen.getByText('Colour (6)');
  screen.getByText('Bits and bobs (4,3,4)');
  screen.getByText('See 2');
});

test('it highlights selected clue', () => {
  const { clues } = store.getState().clues;

  render(
    <Clues
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      breakpoint="xl"
      entries={clues}
      selectedClueId="1-across"
    />,
  );

  const clueText = screen.getByText('Toy on a string (2-2)');
  expect(clueText.parentElement).toHaveClass('Clue--highlighted');
});

test('it highlights linked clues', () => {
  const { clues } = store.getState().clues;

  render(
    <Clues
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      breakpoint="xl"
      entries={clues}
      selectedClueId="2-down"
    />,
  );

  const clueTextOne = screen.getByText('Bits and bobs (4,3,4)');
  expect(clueTextOne.parentElement).toHaveClass('Clue--highlighted');

  const clueTextTwo = screen.getByText('See 2');
  expect(clueTextTwo.parentElement).toHaveClass('Clue--highlighted');
});
