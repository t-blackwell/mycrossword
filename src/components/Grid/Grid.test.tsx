import userEvent from '@testing-library/user-event';
import { CellPosition, GuessGrid } from 'interfaces';
import * as React from 'react';
import testData from 'testData/test.valid.1';
import { initialiseGuessGrid } from 'utils/guess';
import { act, fireEvent, render, screen, store } from 'utils/rtl';
import { initialiseStore } from 'utils/test';
import Grid from './Grid';

const debounceTime = 1000;

const emptyGuessGrid = initialiseGuessGrid(
  testData.dimensions.cols,
  testData.dimensions.rows,
);

const Arrows = {
  UP: { key: 'ArrowUp', code: 'ArrowUp' },
  DOWN: { key: 'ArrowDown', code: 'ArrowDown' },
  LEFT: { key: 'ArrowLeft', code: 'ArrowLeft' },
  RIGHT: { key: 'ArrowRight', code: 'ArrowRight' },
};

function getCells() {
  return store.getState().cells.cells;
}

function getClues() {
  return store.getState().clues.clues;
}

function getSelectedCell() {
  return getCells().find((cell) => cell.selected);
}

function getSelectedClue() {
  return getClues().find((clue) => clue.selected);
}

/**
 * Check selected cell position and selected clue id and rerender
 * the grid.
 * @param selectedCellPos
 * @param selectedClueId
 * @param setGuessGrid
 * @param rerenderFn
 */
function expectSelectionsAndRerender(
  selectedCellPos: CellPosition,
  selectedClueId: string,
  setGuessGrid: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void,
  rerenderFn: (
    ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
  ) => void,
) {
  expect(getSelectedCell()?.pos).toEqual(selectedCellPos);
  expect(getSelectedClue()?.id).toBe(selectedClueId);

  rerenderFn(
    <Grid
      cells={getCells()}
      clues={getClues()}
      cols={testData.dimensions.cols}
      guessGrid={emptyGuessGrid}
      rawClues={testData.entries}
      rows={testData.dimensions.rows}
      setGuessGrid={setGuessGrid}
    />,
  );
}

test('it renders', () => {
  initialiseStore(store, testData);

  render(
    <Grid
      cells={getCells()}
      clues={getClues()}
      cols={testData.dimensions.cols}
      guessGrid={emptyGuessGrid}
      rawClues={testData.entries}
      rows={testData.dimensions.rows}
      setGuessGrid={jest.fn}
    />,
  );

  expect(screen.queryByRole('status')).not.toBeInTheDocument();

  const grid = screen.getByRole('textbox');
  const cells = grid.querySelectorAll('.GridCell');
  expect(cells.length).toBe(23);
});

test('it renders with loading', () => {
  initialiseStore(store, testData);

  render(
    <Grid
      cells={getCells()}
      clues={getClues()}
      cols={testData.dimensions.cols}
      guessGrid={emptyGuessGrid}
      isLoading
      rawClues={testData.entries}
      rows={testData.dimensions.rows}
      setGuessGrid={jest.fn}
    />,
  );

  screen.getByRole('status');
});

test('arrows move between cells', async () => {
  initialiseStore(store, testData);
  const setGuessGrid = jest.fn();

  const { rerender } = render(
    <Grid
      cells={getCells()}
      clues={getClues()}
      cols={testData.dimensions.cols}
      guessGrid={emptyGuessGrid}
      rawClues={testData.entries}
      rows={testData.dimensions.rows}
      setGuessGrid={setGuessGrid}
    />,
  );
  expect(setGuessGrid).toHaveBeenCalledTimes(1);

  const grid = screen.getByRole('textbox');

  // click top left cell
  const topLeftCellNum = screen.getByText('1');
  userEvent.click(topLeftCellNum.parentElement!);
  expectSelectionsAndRerender(
    { col: 0, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );

  // move down
  fireEvent.keyDown(grid, Arrows.DOWN);
  expectSelectionsAndRerender(
    { col: 0, row: 1 },
    '1-down',
    setGuessGrid,
    rerender,
  );

  // move back up to top of 1-down
  fireEvent.keyDown(grid, Arrows.UP);
  expectSelectionsAndRerender(
    { col: 0, row: 0 },
    '1-down',
    setGuessGrid,
    rerender,
  );

  // move up to cycle to bottom of 1-down
  fireEvent.keyDown(grid, Arrows.UP);
  expectSelectionsAndRerender(
    { col: 0, row: 5 },
    '1-down',
    setGuessGrid,
    rerender,
  );

  // move up on 1-down
  fireEvent.keyDown(grid, Arrows.UP);
  expectSelectionsAndRerender(
    { col: 0, row: 4 },
    '1-down',
    setGuessGrid,
    rerender,
  );

  // move right to jump over to 2-down
  fireEvent.keyDown(grid, Arrows.RIGHT);
  expectSelectionsAndRerender(
    { col: 3, row: 4 },
    '2-down',
    setGuessGrid,
    rerender,
  );

  // move right to jump over to the 3-down
  fireEvent.keyDown(grid, Arrows.RIGHT);
  expectSelectionsAndRerender(
    { col: 6, row: 4 },
    '3-down',
    setGuessGrid,
    rerender,
  );

  // cycle back to the top of 3-down
  fireEvent.keyDown(grid, Arrows.DOWN);
  expectSelectionsAndRerender(
    { col: 6, row: 1 },
    '3-down',
    setGuessGrid,
    rerender,
  );

  // move left to jump back to 2-down
  fireEvent.keyDown(grid, Arrows.LEFT);
  expectSelectionsAndRerender(
    { col: 3, row: 1 },
    '2-down',
    setGuessGrid,
    rerender,
  );

  // move up to the top of 2-down
  fireEvent.keyDown(grid, Arrows.UP);
  expectSelectionsAndRerender(
    { col: 3, row: 0 },
    '2-down',
    setGuessGrid,
    rerender,
  );

  // move left onto 1-across
  fireEvent.keyDown(grid, Arrows.LEFT);
  expectSelectionsAndRerender(
    { col: 2, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );

  // move left again on 1-across
  fireEvent.keyDown(grid, Arrows.LEFT);
  expectSelectionsAndRerender(
    { col: 1, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );

  // move left again on 1-across
  fireEvent.keyDown(grid, Arrows.LEFT);
  expectSelectionsAndRerender(
    { col: 0, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );
});

test('display characters and update cell positions', () => {
  jest.useFakeTimers();

  initialiseStore(store, testData);
  const setGuessGrid = jest.fn();

  const { rerender } = render(
    <Grid
      cells={getCells()}
      clues={getClues()}
      cols={testData.dimensions.cols}
      guessGrid={emptyGuessGrid}
      rawClues={testData.entries}
      rows={testData.dimensions.rows}
      setGuessGrid={setGuessGrid}
    />,
  );
  expect(setGuessGrid).toHaveBeenCalledTimes(1);

  const grid = screen.getByRole('textbox');

  // click top left cell
  const topLeftCellNum = screen.getByText('1');
  userEvent.click(topLeftCellNum.parentElement!);
  expectSelectionsAndRerender(
    { col: 0, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );

  // type 'A' and move to next position
  fireEvent.keyDown(grid, { key: 'A', code: 'KeyA' });
  expectSelectionsAndRerender(
    { col: 1, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );
  screen.getByText('A');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(2);

  // type 'B' and move to next position
  fireEvent.keyDown(grid, { key: 'B', code: 'KeyB' });
  expectSelectionsAndRerender(
    { col: 2, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );
  screen.getByText('B');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(3);

  // type 'C' and move to next position
  fireEvent.keyDown(grid, { key: 'C', code: 'KeyC' });
  expectSelectionsAndRerender(
    { col: 3, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );
  screen.getByText('C');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(4);

  // type 'D' and stay in the same position
  fireEvent.keyDown(grid, { key: 'D', code: 'KeyD' });
  expectSelectionsAndRerender(
    { col: 3, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );
  screen.getByText('D');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(5);

  // move to 2-down
  fireEvent.keyDown(grid, Arrows.DOWN);
  expectSelectionsAndRerender(
    { col: 3, row: 1 },
    '2-down',
    setGuessGrid,
    rerender,
  );

  // type 'E' and move to next position
  fireEvent.keyDown(grid, { key: 'E', code: 'KeyE' });
  expectSelectionsAndRerender(
    { col: 3, row: 2 },
    '2-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('E');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(6);

  // type 'F' and move to next position
  fireEvent.keyDown(grid, { key: 'F', code: 'KeyF' });
  expectSelectionsAndRerender(
    { col: 3, row: 3 },
    '2-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('F');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(7);

  // type 'G' and move to next position
  fireEvent.keyDown(grid, { key: 'G', code: 'KeyG' });
  expectSelectionsAndRerender(
    { col: 3, row: 4 },
    '2-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('G');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(8);

  // type 'H' and move to next position
  fireEvent.keyDown(grid, { key: 'H', code: 'KeyH' });
  expectSelectionsAndRerender(
    { col: 3, row: 5 },
    '2-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('H');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(9);

  // type 'I' and move to next position
  fireEvent.keyDown(grid, { key: 'I', code: 'KeyI' });
  expectSelectionsAndRerender(
    { col: 3, row: 6 },
    '2-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('I');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(10);

  // type 'J' and jump to next clue in the group
  fireEvent.keyDown(grid, { key: 'J', code: 'KeyJ' });
  expectSelectionsAndRerender(
    { col: 6, row: 1 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('J');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(11);

  // type 'K' and move to next position
  fireEvent.keyDown(grid, { key: 'K', code: 'KeyK' });
  expectSelectionsAndRerender(
    { col: 6, row: 2 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('K');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(12);

  // type 'L' and move to next position
  fireEvent.keyDown(grid, { key: 'L', code: 'KeyL' });
  expectSelectionsAndRerender(
    { col: 6, row: 3 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('L');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(13);

  // type 'M' and move to next position
  fireEvent.keyDown(grid, { key: 'M', code: 'KeyM' });
  expectSelectionsAndRerender(
    { col: 6, row: 4 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('M');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(14);

  // type 'N' and stay in the same position
  fireEvent.keyDown(grid, { key: 'N', code: 'KeyN' });
  expectSelectionsAndRerender(
    { col: 6, row: 4 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  screen.getByText('N');

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(15);

  // type backspace and move back one position
  fireEvent.keyDown(grid, { key: 'Backspace', code: 'Backspace' });
  expectSelectionsAndRerender(
    { col: 6, row: 3 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  expect(screen.queryByText('N')).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(16);

  // type invalid character and stay in the same position
  fireEvent.keyDown(grid, { key: '=', code: 'Equal' });
  expectSelectionsAndRerender(
    { col: 6, row: 3 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  expect(screen.queryByText('=')).not.toBeInTheDocument();

  // type delete and stay in the same position
  fireEvent.keyDown(grid, { key: 'Delete', code: 'Delete' });
  expectSelectionsAndRerender(
    { col: 6, row: 3 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  expect(screen.queryByText('M')).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(17);

  // move up one position
  fireEvent.keyDown(grid, Arrows.UP);
  expectSelectionsAndRerender(
    { col: 6, row: 2 },
    '3-down',
    setGuessGrid,
    rerender,
  );

  // type backspace and move back one position
  fireEvent.keyDown(grid, { key: 'Backspace', code: 'Backspace' });
  expectSelectionsAndRerender(
    { col: 6, row: 1 },
    '3-down',
    setGuessGrid,
    rerender,
  );
  expect(screen.queryByText('L')).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(18);

  // type backspace and jump to previous clue in group
  fireEvent.keyDown(grid, { key: 'Backspace', code: 'Backspace' });
  expectSelectionsAndRerender(
    { col: 3, row: 6 },
    '2-down',
    setGuessGrid,
    rerender,
  );
  expect(screen.queryByText('K')).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(debounceTime);
  });
  expect(setGuessGrid).toHaveBeenCalledTimes(19);

  // type tab and jump to next clue
  fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab' });
  expectSelectionsAndRerender(
    { col: 6, row: 1 },
    '3-down',
    setGuessGrid,
    rerender,
  );

  // type tab and jump to next clue
  fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab' });
  expectSelectionsAndRerender(
    { col: 0, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );

  // type tab and jump to next clue
  fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab' });
  expectSelectionsAndRerender(
    { col: 0, row: 2 },
    '4-across',
    setGuessGrid,
    rerender,
  );

  // type shift+tab and jump to previous clue
  fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab', shiftKey: true });
  expectSelectionsAndRerender(
    { col: 0, row: 0 },
    '1-across',
    setGuessGrid,
    rerender,
  );

  jest.useRealTimers();
});
