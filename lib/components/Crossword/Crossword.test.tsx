import userEvent from '@testing-library/user-event';
import {
  DEFAULT_CELL_MATCHER,
  DEFAULT_CELL_SIZE,
  DEFAULT_HTML_TAGS,
} from '../../utils/general';
import { GuessGrid } from '~/types';
import { initialiseGuessGrid } from '~/utils/guess';
import invalidData from './../../testData/test.invalid.1';
import validData from './../../testData/test.valid.1';
import Crossword from './Crossword';
import { act, fireEvent, screen } from '@testing-library/react';
import { createTestStores } from '~/utils/test';

const DEBOUNCE_TIME = 1000;

function getGridAnnouncementRegion() {
  return document.querySelector<HTMLElement>('.Grid [aria-live]')!;
}

test('it renders', () => {
  createTestStores().render(
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
  createTestStores().render(
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

  createTestStores().render(
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
  createTestStores().render(
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

test("it displays error with a guess grid that doesn't fit the crossword", () => {
  // the right number of cells, but in columns of the wrong lengths
  const { cols, rows } = validData.dimensions;
  const guessGrid = initialiseGuessGrid(cols, rows);
  guessGrid.value[0].push('');
  guessGrid.value[1].pop();

  createTestStores().render(
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

  screen.getByText('Error loading grid');
});

test('it ignores corrupt saved progress', () => {
  localStorage.setItem('crosswords.corrupt-test', '{"value":[null]}');

  createTestStores().render(
    <Crossword
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      allowMissingSolutions={false}
      cellMatcher={DEFAULT_CELL_MATCHER}
      cellSize={DEFAULT_CELL_SIZE}
      data={validData}
      id="corrupt-test"
      stickyClue="auto"
    />,
  );

  screen.getByText('Toy on a string (2-2)');
  expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
});

test('it calls saveGrid', () => {
  vi.useFakeTimers();

  try {
    const saveGrid = vi.fn();
    createTestStores().render(
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
    // nothing is saved until there's a change
    expect(saveGrid).not.toHaveBeenCalled();

    // click first cell and type 'A'
    const gridCells = document.querySelectorAll('.GridCell');
    fireEvent.click(gridCells[0]);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });

    // saving is debounced
    expect(saveGrid).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_TIME);
    });
    expect(saveGrid).toHaveBeenCalledTimes(1);
    expect(saveGrid.mock.calls[0][0].value[0][0]).toBe('A');
  } finally {
    vi.useRealTimers();
  }
});

test('it always shows sticky clue', async () => {
  act(() => {
    window.innerWidth = 1200;
    window.dispatchEvent(new Event('resize'));
  });

  createTestStores().render(
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

  createTestStores().render(
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

  createTestStores().render(
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

  createTestStores().render(
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

  createTestStores().render(
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

  createTestStores().render(
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

  const { rerender } = createTestStores().render(
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

  createTestStores().render(
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
  const stores = createTestStores();

  const onCellChange = vi.fn();
  const saveGrid = vi.fn();

  stores.render(
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
    stores.cells
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
  const stores = createTestStores();

  stores.render(
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

  const cell = stores.cells
    .getState()
    .cells.find((c) => c.pos.col === 1 && c.pos.row === 0);

  expect(cell?.guess).toBe('O');
  expect(screen.getByLabelText('Letter 2')).toHaveValue('O');

  // the letters input is still there
  screen.getByPlaceholderText('Enter letters...');
});

test("the anagram helper doesn't move on from a rejected letter", async () => {
  const stores = createTestStores();

  stores.render(
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
    stores.cells
      .getState()
      .cells.find((c) => c.pos.col === col && c.pos.row === 0);

  expect(getCell(0)?.guess).toBe('Y');
  expect(getCell(1)?.guess).toBeUndefined();
  expect(screen.getByLabelText('Letter 2')).toHaveFocus();
});

test("closing the anagram helper doesn't save a stale grid", async () => {
  const saveGrid = vi.fn();

  createTestStores().render(
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

test('keyboard users can move between the grid and the clue list', async () => {
  createTestStores().render(
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

  const grid = screen.getByRole('textbox', { name: 'Crossword grid' });

  // the grid is the first stop and selects the first clue
  await userEvent.tab();
  expect(grid).toHaveFocus();
  expect(getGridAnnouncementRegion()).toHaveTextContent(
    '1 across: Toy on a string (2-2). Letter 1 of 4, blank.',
  );

  // Tab moves between clues within the grid
  await userEvent.tab();
  expect(grid).toHaveFocus();
  expect(getGridAnnouncementRegion()).toHaveTextContent(
    '4 across: Have a rest (3,4). Letter 1 of 7, blank.',
  );

  // Escape moves focus to the selected clue in the list
  await userEvent.keyboard('{Escape}');
  const clue = screen.getByRole('button', { name: /^4\s*across/ });
  expect(clue).toHaveFocus();
  expect(clue).toHaveAttribute('aria-current', 'true');

  // and Tab continues through the clue list
  await userEvent.tab();
  expect(screen.getByRole('button', { name: /^1\s*down/ })).toHaveFocus();

  // selecting a clue returns to the grid
  await userEvent.keyboard('{Enter}');
  expect(grid).toHaveFocus();
  expect(getGridAnnouncementRegion()).toHaveTextContent(
    '1 down: Colour (6). Letter 1 of 6, blank.',
  );
});

test('it restores saved progress when the data changes', () => {
  const props = {
    allowedHtmlTags: DEFAULT_HTML_TAGS,
    allowMissingSolutions: false,
    cellMatcher: DEFAULT_CELL_MATCHER,
    cellSize: DEFAULT_CELL_SIZE,
    id: 'data-change-test',
    stickyClue: 'never' as const,
  };
  const getGuesses = () =>
    Array.from(
      document.querySelectorAll('.GridCell__text'),
      (text) => text.textContent,
    ).join('');

  const { rerender } = createTestStores().render(
    <Crossword {...props} data={validData} />,
  );
  expect(getGuesses()).toBe('');

  // e.g. saved by another tab
  const savedGrid = initialiseGuessGrid(
    validData.dimensions.cols,
    validData.dimensions.rows,
  );
  savedGrid.value[0][0] = 'Y';
  localStorage.setItem(
    'crosswords.data-change-test',
    JSON.stringify(savedGrid),
  );

  rerender(<Crossword {...props} data={structuredClone(validData)} />);
  expect(getGuesses()).toBe('Y');

  // saved progress that doesn't match the grid is ignored
  localStorage.setItem(
    'crosswords.data-change-test',
    JSON.stringify({ value: [['Y']] }),
  );

  rerender(<Crossword {...props} data={structuredClone(validData)} />);
  expect(getGuesses()).toBe('');
  expect(screen.queryByText(/error/i)).not.toBeInTheDocument();

  localStorage.removeItem('crosswords.data-change-test');
});
