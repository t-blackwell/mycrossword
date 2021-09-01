import * as React from 'react';
import { initialiseStore } from 'utils/test';
import testData from '../../testData/test.valid.1';
import { render, screen, store } from '../../utils/rtl';
import Clues from './Clues';

test('it renders', () => {
  initialiseStore(store, testData);
  const { clues } = store.getState().clues;

  render(<Clues entries={clues} />);

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
  initialiseStore(store, testData);
  const { clues } = store.getState().clues;

  render(<Clues entries={clues} selectedClueId="1-across" />);

  const clueText = screen.getByText('Toy on a string (2-2)');
  expect(clueText.parentElement).toHaveClass('Clue--highlighted');
});
