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

test('it calls saveGrid', () => {
  vi.useFakeTimers();

  try {
    const saveGrid = vi.fn();
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

    // click first cell and type 'A'
    const gridCells = document.querySelectorAll('.GridCell');
    fireEvent.click(gridCells[0]);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });

    // saving is debounced
    expect(saveGrid).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_TIME);
    });
    expect(saveGrid).toHaveBeenCalledTimes(2);
    expect(saveGrid.mock.calls[1][0].value[0][0]).toBe('A');
  } finally {
    vi.useRealTimers();
  }
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

// see Crossword.browser.test.tsx for the 'auto' sticky clue tests

test("it doesn't change the URL hash by default", async () => {
  const user = userEvent.setup();

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

  await user.click(screen.getByText('Have a rest (3,4)'));

  expect(window.location.hash).toBe('');
});

test('it ignores the URL hash on load by default', () => {
  window.history.replaceState(null, '', '#4-across');

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

  expect(document.querySelector('.Clue--highlighted')).toBeNull();
});

test('it writes the selected clue to the URL hash, keeping history.state', async () => {
  const user = userEvent.setup();
  const routerState = { key: 'abc123', idx: 2 };
  window.history.replaceState(routerState, '');

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="never"
      urlHash
    />,
  );

  await user.click(screen.getByText('Have a rest (3,4)'));

  expect(window.location.hash).toBe('#4-across');
  expect(window.history.state).toEqual(routerState);
});

test('it restores the URL hash when the same clue is selected again', async () => {
  const user = userEvent.setup();

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="never"
      urlHash
    />,
  );

  await user.click(screen.getByText('Have a rest (3,4)'));
  expect(window.location.hash).toBe('#4-across');

  // e.g. an in-page link elsewhere on the host page
  window.history.replaceState(null, '', '#comments');

  await user.click(screen.getByText('Have a rest (3,4)'));
  expect(window.location.hash).toBe('#4-across');
});

test("a remounted crossword doesn't write the previous crossword's clue to the URL hash", async () => {
  const user = userEvent.setup();

  const { rerender } = render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test-1"
      key="test-1"
      stickyClue="never"
      urlHash
    />,
  );

  await user.click(screen.getByText('Have a rest (3,4)'));
  expect(window.location.hash).toBe('#4-across');

  // e.g. a client-side navigation to another page with a new crossword
  window.history.replaceState(null, '', window.location.pathname);

  rerender(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test-2"
      key="test-2"
      stickyClue="never"
      urlHash
    />,
  );

  expect(window.location.hash).toBe('');
  expect(document.querySelector('.Clue--highlighted')).toBeNull();
});

test('it selects the clue in the URL hash on load', () => {
  window.history.replaceState(null, '', '#4-across');

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="test"
      stickyClue="never"
      urlHash
    />,
  );

  expect(document.querySelector('.Clue--highlighted')).toHaveTextContent(
    'Have a rest (3,4)',
  );
});

test('the anagram helper enters letters in the grid', async () => {
  const onCellChange = vi.fn();
  const saveGrid = vi.fn();

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
      saveGrid={vi.fn()}
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

test("the anagram helper doesn't move on from a rejected letter", async () => {
  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="anagram-test-3"
      saveGrid={vi.fn()}
      stickyClue="never"
    />,
  );

  await userEvent.click(screen.getByText('Toy on a string (2-2)'));
  await userEvent.click(screen.getByRole('button', { name: 'Anagram helper' }));

  // 1 isn't allowed by the default cell matcher
  await userEvent.type(screen.getByLabelText('Letter 1'), '1y');

  const getCell = (col: number) =>
    useCellsStore
      .getState()
      .cells.find((c) => c.pos.col === col && c.pos.row === 0);

  expect(getCell(0)?.guess).toBe('Y');
  expect(getCell(1)?.guess).toBeUndefined();
  expect(screen.getByLabelText('Letter 2')).toHaveFocus();
});

test("closing the anagram helper doesn't save a stale grid", async () => {
  const saveGrid = vi.fn();

  render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="anagram-test-4"
      saveGrid={saveGrid}
      stickyClue="never"
    />,
  );

  await userEvent.click(screen.getByText('Toy on a string (2-2)'));
  await userEvent.click(screen.getByRole('button', { name: 'Anagram helper' }));
  await userEvent.type(screen.getByLabelText('Letter 1'), 'y');
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));

  // the remounted grid saves the current letters, not a stale snapshot
  const lastSaved = saveGrid.mock.calls[saveGrid.mock.calls.length - 1][0];
  expect(lastSaved.value[0][0]).toBe('Y');
});
