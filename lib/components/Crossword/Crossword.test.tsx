import userEvent from '@testing-library/user-event';
import {
  DEFAULT_CELL_MATCHER,
  DEFAULT_CELL_SIZE,
  DEFAULT_HTML_TAGS,
} from '../../utils/general';
import { GuessGrid } from '~/types';
import invalidData from './../../testData/test.invalid.1';
import validData from './../../testData/test.valid.1';
import Crossword from './Crossword';
import { useCellsStore } from '~/stores/useCellsStore';
import { act, fireEvent, render, screen } from '@testing-library/react';

const DEBOUNCE_TIME = 1000;

test('it renders', () => {
  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="auto"
    />,
  );

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
  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={invalidData}
      id="test"
      stickyClue="auto"
    />,
  );

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

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      loadGrid={guessGrid}
      stickyClue="auto"
    />,
  );

  expect(screen.getAllByText('X').length).toBe(23);
});

test('it displays error with invalid guess grid', () => {
  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      loadGrid={{ value: [] }}
      stickyClue="auto"
    />,
  );

  screen.getByText('Something went wrong');
  screen.getByText('Error loading grid');
});

// TODO: update test to work with input element
test.skip('it calls saveGrid', () => {
  jest.useFakeTimers();

  const saveGrid = jest.fn();
  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      saveGrid={saveGrid}
      stickyClue="auto"
    />,
  );
  expect(saveGrid).toHaveBeenCalledTimes(1);

  const grid = screen.getByTestId('grid');

  // click first cell and type 'A'
  const gridCells = document.querySelectorAll('.GridCell');
  userEvent.click(gridCells[0]);
  fireEvent.keyDown(grid, { key: 'A', code: 'KeyA' });

  act(() => {
    jest.advanceTimersByTime(DEBOUNCE_TIME);
  });
  expect(saveGrid).toHaveBeenCalledTimes(2);

  jest.useRealTimers();
});

test('it always shows sticky clue', async () => {
  act(() => {
    window.innerWidth = 1200;
    window.dispatchEvent(new Event('resize'));
  });

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="always"
    />,
  );

  const stickyClue = document.querySelector('.StickyClue');
  expect(stickyClue).not.toBeNull();
});

test('it never shows sticky clue', async () => {
  act(() => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
  });

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="never"
    />,
  );

  const stickyClue = document.querySelector('.StickyClue');
  expect(stickyClue).toBeNull();
});

// TODO: update to work with media queries
test.skip('it conditionally shows sticky clue', async () => {
  // show on xs viewport
  act(() => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
  });

  const { rerender } = render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="auto"
    />,
  );

  const xsStickyClue = document.querySelector('.StickyClue');
  expect(xsStickyClue).not.toBeNull();

  // don't show on lg viewport
  act(() => {
    window.innerWidth = 1100;
    window.dispatchEvent(new Event('resize'));
  });

  rerender(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="auto"
    />,
  );

  const lgStickyClue = document.querySelector('.StickyClue');
  expect(lgStickyClue).toBeNull();
});

test('the anagram helper enters letters in the grid', async () => {
  const onCellChange = jest.fn();
  const saveGrid = jest.fn();

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="anagram-test"
      onCellChange={onCellChange}
      saveGrid={saveGrid}
      stickyClue="auto"
    />,
  );

  // open the anagram helper for 1 across and shuffle some letters
  await userEvent.click(screen.getByText('Toy on a string (2-2)'));
  await userEvent.click(screen.getByRole('button', { name: 'Anagram helper' }));
  await userEvent.type(screen.getByPlaceholderText('Enter letters...'), 'oyoy');
  await userEvent.click(screen.getByRole('button', { name: 'Shuffle' }));
  saveGrid.mockClear();

  // type into the first solution box
  await userEvent.type(screen.getByLabelText('Letter 1'), 'y');

  const getFirstCell = () =>
    useCellsStore
      .getState()
      .cells.find((cell) => cell.pos.col === 0 && cell.pos.row === 0);

  expect(getFirstCell()?.guess).toBe('Y');
  expect(onCellChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ pos: { col: 0, row: 0 }, guess: 'Y' }),
  );
  expect(saveGrid).toHaveBeenCalledTimes(1);
  expect(saveGrid.mock.calls[0][0].value[0][0]).toBe('Y');
  expect(screen.getByLabelText('Letter 1')).toHaveValue('Y');

  // clearing the box clears the cell
  await userEvent.clear(screen.getByLabelText('Letter 1'));
  expect(getFirstCell()?.guess).toBeUndefined();
});

test('the anagram helper enters letters in the grid before shuffling', async () => {
  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="anagram-test-2"
      saveGrid={jest.fn()}
      stickyClue="never"
    />,
  );

  await userEvent.click(screen.getByText('Toy on a string (2-2)'));
  await userEvent.click(screen.getByRole('button', { name: 'Anagram helper' }));
  await userEvent.type(screen.getByLabelText('Letter 2'), 'o');

  const cell = useCellsStore
    .getState()
    .cells.find((c) => c.pos.col === 1 && c.pos.row === 0);

  expect(cell?.guess).toBe('O');
  expect(screen.getByLabelText('Letter 2')).toHaveValue('O');

  // the letters input is still there
  screen.getByPlaceholderText('Enter letters...');
});
