import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { GuessGrid } from './../../interfaces';
import invalidData from './../../testData/test.invalid.1';
import validData from './../../testData/test.valid.1';
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { act, fireEvent, render, screen } from './../../utils/rtl';
import Crossword from './Crossword';

const debounceTime = 1000;

test('it renders', () => {
  render(<Crossword data={validData} id="test" />);

  screen.getByText('Across');
  screen.getByText('Down');

  // 1-across, 1-down and superscript 1 in the grid
  expect(screen.getAllByText('1').length).toBe(3);
  expect(screen.getAllByText('2').length).toBe(2);
  expect(screen.getAllByText('3').length).toBe(2);
  expect(screen.getAllByText('4').length).toBe(2);

  screen.getByText('Toy on a string (2-2)');
  screen.getByText('Have a rest (3,4)');
  screen.getByText('Colour (6)');
  screen.getByText('Bits and bobs (4,3,4)');
  screen.getByText('See 2');
});

test('it displays error with invalid data', () => {
  render(<Crossword data={invalidData} id="test" />);

  screen.getByText('Something went wrong');
  screen.getByText('Crossword data error: solution length mismatch');
});

test('it displays valid guess grid', () => {
  const guessGrid: GuessGrid = {
    value: [
      ['X', 'X', 'X', 'X', 'X', 'X', '', '', '', '', '', '', ''],
      ['X', '', 'X', '', '', '', '', '', '', '', '', '', ''],
      ['X', '', 'X', '', '', '', '', '', '', '', '', '', ''],
      ['X', 'X', 'X', 'X', 'X', 'X', 'X', '', '', '', '', '', ''],
      ['', '', 'X', '', '', '', '', '', '', '', '', '', ''],
      ['', '', 'X', '', '', '', '', '', '', '', '', '', ''],
      ['', 'X', 'X', 'X', 'X', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ],
  };

  render(<Crossword data={validData} id="test" loadGrid={guessGrid} />);

  expect(screen.getAllByText('X').length).toBe(23);
});

test('it displays error with invalid guess grid', () => {
  render(<Crossword data={validData} id="test" loadGrid={{ value: [] }} />);

  screen.getByText('Something went wrong');
  screen.getByText('Error loading grid');
});

// TODO: update test to work with input element
test.skip('it calls saveGrid', () => {
  jest.useFakeTimers();

  const saveGrid = jest.fn();
  render(<Crossword data={validData} id="test" saveGrid={saveGrid} />);
  expect(saveGrid).toHaveBeenCalledTimes(1);

  const grid = screen.getByTestId('grid');

  // click first cell and type 'A'
  const gridCells = document.querySelectorAll('.GridCell');
  userEvent.click(gridCells[0]);
  fireEvent.keyDown(grid, { key: 'A', code: 'KeyA' });

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(saveGrid).toHaveBeenCalledTimes(2);

  jest.useRealTimers();
});
