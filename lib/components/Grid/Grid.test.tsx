import userEvent from '@testing-library/user-event';
import { CellFocus, CellPosition, GuessGrid } from '~/types';
import testData from '~/testData/test.valid.1';
import { act, fireEvent, screen } from '@testing-library/react';
import { createTestStores, TestStores } from '~/utils/test';
import Grid from './Grid';
import { DEFAULT_CELL_SIZE } from '~/utils/general';
import { useCellsStore, useCluesStore } from '~/stores/stores';

const cellMatcher = /[A-Z]/;

const debounceTime = 1000;

let stores: TestStores;

beforeEach(() => {
  stores = createTestStores(testData);
});

const Arrows = {
  UP: { key: 'ArrowUp', code: 'ArrowUp' },
  DOWN: { key: 'ArrowDown', code: 'ArrowDown' },
  LEFT: { key: 'ArrowLeft', code: 'ArrowLeft' },
  RIGHT: { key: 'ArrowRight', code: 'ArrowRight' },
};

function getCells() {
  return stores.cells.getState().cells;
}

function getClues() {
  return stores.clues.getState().clues;
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
 * @param cellFocus
 * @param rerenderFn
 */
function expectSelectionsAndRerender(
  selectedCellPos: CellPosition,
  selectedClueId: string,
  setGuessGrid: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void,
  cellFocus: (cellFocus: CellFocus) => void,
  rerenderFn: (ui: React.ReactElement) => void,
) {
  expect(getSelectedCell()?.pos).toEqual(selectedCellPos);
  expect(getSelectedClue()?.id).toBe(selectedClueId);

  rerenderFn(
    <Grid
      cellMatcher={cellMatcher}
      cellSize={DEFAULT_CELL_SIZE}
      cells={getCells()}
      clues={getClues()}
      cols={testData.dimensions.cols}
      onCellFocus={cellFocus}
      rawClues={testData.entries}
      rows={testData.dimensions.rows}
      setGuessGrid={setGuessGrid}
    />,
  );
}

// some tests use fake timers to skip the debounce delay before saving
afterEach(() => {
  vi.useRealTimers();
});

describe('Grid', () => {
  test('it renders', () => {
    stores.render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={vi.fn()}
      />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    const grid = screen.getByTestId('grid');
    const cells = grid.querySelectorAll('.GridCell');
    expect(cells.length).toBe(23);
  });

  test('arrows move between cells', async () => {
    const setGuessGrid = vi.fn();
    const cellFocus = vi.fn();
    let cellFocusCounter = 0;

    const { rerender } = stores.render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        onCellFocus={cellFocus}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );

    // nothing is saved when mounting
    expect(setGuessGrid).not.toHaveBeenCalled();

    const input = screen.getByRole('textbox');

    // click top left cell
    const topLeftCellNum = screen.getByText('1');
    await userEvent.click(topLeftCellNum.parentElement!);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    const steps: Array<{
      description: string;
      key: keyof typeof Arrows;
      pos: CellPosition;
      clueId: string;
    }> = [
      {
        description: 'switch to 1-down without moving (crossing cell)',
        key: 'DOWN',
        pos: { col: 0, row: 0 },
        clueId: '1-down',
      },
      {
        description: 'move down 1-down',
        key: 'DOWN',
        pos: { col: 0, row: 1 },
        clueId: '1-down',
      },
      {
        description: 'move back up to top of 1-down',
        key: 'UP',
        pos: { col: 0, row: 0 },
        clueId: '1-down',
      },
      {
        description: 'move up to cycle to bottom of 1-down',
        key: 'UP',
        pos: { col: 0, row: 5 },
        clueId: '1-down',
      },
      {
        description: 'move up on 1-down',
        key: 'UP',
        pos: { col: 0, row: 4 },
        clueId: '1-down',
      },
      {
        description: 'move right to jump over to 2-down',
        key: 'RIGHT',
        pos: { col: 3, row: 4 },
        clueId: '2-down',
      },
      {
        description: 'move right to jump over to 3-down',
        key: 'RIGHT',
        pos: { col: 6, row: 4 },
        clueId: '3-down',
      },
      {
        description: 'cycle back to the top of 3-down',
        key: 'DOWN',
        pos: { col: 6, row: 1 },
        clueId: '3-down',
      },
      {
        description: 'move left to jump back to 2-down',
        key: 'LEFT',
        pos: { col: 3, row: 1 },
        clueId: '2-down',
      },
      {
        description: 'move up to the top of 2-down',
        key: 'UP',
        pos: { col: 3, row: 0 },
        clueId: '2-down',
      },
      {
        description: 'switch to 1-across without moving (crossing cell)',
        key: 'LEFT',
        pos: { col: 3, row: 0 },
        clueId: '1-across',
      },
      {
        description: 'move left on 1-across',
        key: 'LEFT',
        pos: { col: 2, row: 0 },
        clueId: '1-across',
      },
      {
        description: 'move left again on 1-across',
        key: 'LEFT',
        pos: { col: 1, row: 0 },
        clueId: '1-across',
      },
      {
        description: 'move left to the start of 1-across',
        key: 'LEFT',
        pos: { col: 0, row: 0 },
        clueId: '1-across',
      },
    ];

    for (const { description, key, pos, clueId } of steps) {
      fireEvent.keyDown(input, Arrows[key]);
      expect(cellFocus, description).toHaveBeenCalledTimes(++cellFocusCounter);
      expect(cellFocus, description).toHaveBeenLastCalledWith({ pos, clueId });
      expectSelectionsAndRerender(
        pos,
        clueId,
        setGuessGrid,
        cellFocus,
        rerender,
      );
    }
  });
  test('display characters and update cell positions', async () => {
    vi.useFakeTimers();
    const setGuessGrid = vi.fn();
    const cellFocus = vi.fn();
    let guessGridCounter = 0;
    let cellFocusCounter = 0;

    const { rerender } = stores.render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        onCellFocus={cellFocus}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );

    // nothing is saved when mounting
    expect(setGuessGrid).toHaveBeenCalledTimes(guessGridCounter);

    const input = screen.getByRole('textbox');

    // click top left cell
    const topLeftCellNum = screen.getByText('1');
    fireEvent.click(topLeftCellNum.parentElement!);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type 'A' and move to next position
    fireEvent.change(input, { target: { value: 'A' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 1, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('A');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'B' and move to next position
    fireEvent.change(input, { target: { value: 'B' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 2, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('B');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'C' and move to next position
    fireEvent.change(input, { target: { value: 'C' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('C');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'D' and stay in the same position
    fireEvent.change(input, { target: { value: 'D' } });
    expect(cellFocus).toHaveBeenCalledTimes(cellFocusCounter); // no change
    expectSelectionsAndRerender(
      { col: 3, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('D');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // switch to 2-down without moving (crossing cell)
    fireEvent.keyDown(input, Arrows.DOWN);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 0 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move down 2-down
    fireEvent.keyDown(input, Arrows.DOWN);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 1 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type 'E' and move to next position
    fireEvent.change(input, { target: { value: 'E' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 2 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('E');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'F' and move to next position
    fireEvent.change(input, { target: { value: 'F' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 3 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('F');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'G' and move to next position
    fireEvent.change(input, { target: { value: 'G' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 4 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('G');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'H' and move to next position
    fireEvent.change(input, { target: { value: 'H' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 5 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('H');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'I' and move to next position
    fireEvent.change(input, { target: { value: 'I' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 6 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('I');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'J' and jump to next clue in the group
    fireEvent.change(input, { target: { value: 'J' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 1 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('J');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'K' and move to next position
    fireEvent.change(input, { target: { value: 'K' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 2 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('K');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'L' and move to next position
    fireEvent.change(input, { target: { value: 'L' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 3 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('L');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'M' and move to next position
    fireEvent.change(input, { target: { value: 'M' } });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 4 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('M');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'N' and stay in the same position
    fireEvent.change(input, { target: { value: 'N' } });
    expect(cellFocus).toHaveBeenCalledTimes(cellFocusCounter); // no change
    expectSelectionsAndRerender(
      { col: 6, row: 4 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    screen.getByText('N');

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type backspace and move back one position
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 3 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    expect(screen.queryByText('N')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type invalid character and stay in the same position
    fireEvent.change(input, { target: { value: '=' } });
    expect(cellFocus).toHaveBeenCalledTimes(cellFocusCounter); // no change
    expectSelectionsAndRerender(
      { col: 6, row: 3 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    expect(screen.queryByText('=')).not.toBeInTheDocument();

    // type delete and stay in the same position
    fireEvent.keyDown(input, { key: 'Delete', code: 'Delete' });
    expect(cellFocus).toHaveBeenCalledTimes(cellFocusCounter); // no change
    expectSelectionsAndRerender(
      { col: 6, row: 3 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    expect(screen.queryByText('M')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // move up one position
    fireEvent.keyDown(input, Arrows.UP);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 2 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type backspace and move back one position
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 1 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    expect(screen.queryByText('L')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type backspace and jump to previous clue in group
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 6 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );
    expect(screen.queryByText('K')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(guessGridCounter + 1);

    // type tab and jump to next clue
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 1 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type tab and jump to next clue
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type tab and jump to next clue
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 2 },
      '4-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type shift+tab and jump to previous clue
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab', shiftKey: true });
    expect(cellFocus).toHaveBeenCalledTimes(cellFocusCounter + 1);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );
  });

  test('onCellChange called', async () => {
    const onCellChange = vi.fn();
    const setGuessGrid = vi.fn();

    const { rerender } = stores.render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        onCellChange={onCellChange}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );

    const input = screen.getByRole('textbox');

    // click top left cell
    await userEvent.click(screen.getByText('1').parentElement!);
    rerender(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        onCellChange={onCellChange}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );

    // type 'A'
    fireEvent.change(input, { target: { value: 'A' } });
    expect(onCellChange).toHaveBeenCalledTimes(1);
    rerender(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        onCellChange={onCellChange}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );

    // click top left cell again
    await userEvent.click(screen.getByText('1').parentElement!);
    rerender(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        onCellChange={onCellChange}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );

    // type 'A' again and check onCellChange doesn't get called for a second time
    fireEvent.change(input, { target: { value: 'A' } });
    expect(onCellChange).toHaveBeenCalledTimes(1);
  });
});

describe('Grid accessibility', () => {
  function ConnectedGrid({
    onCellFocus,
    onEscape,
  }: {
    onCellFocus?: (cellFocus: CellFocus) => void;
    onEscape?: () => void;
  }) {
    const cells = useCellsStore((state) => state.cells);
    const clues = useCluesStore((state) => state.clues);

    return (
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={cells}
        clues={clues}
        cols={testData.dimensions.cols}
        onCellFocus={onCellFocus}
        onEscape={onEscape}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={vi.fn()}
      />
    );
  }

  const getAnnouncement = () =>
    screen.getByTestId('grid-announcement').textContent;

  test('the grid is presented via a labelled input', () => {
    stores.render(<ConnectedGrid />);

    const svg = screen.getByTestId('grid').querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    const input = screen.getByRole('textbox', { name: 'Crossword grid' });
    expect(input).toHaveAccessibleDescription(/arrow keys/i);
    expect(input).toHaveAccessibleDescription(/escape to leave the grid/i);

    const liveRegion = screen.getByTestId('grid-announcement');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toBeEmptyDOMElement();
  });

  test('tabbing to the grid selects and announces the first clue', async () => {
    const cellFocus = vi.fn();
    stores.render(<ConnectedGrid onCellFocus={cellFocus} />);

    await userEvent.tab();

    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(getSelectedClue()?.id).toBe('1-across');
    expect(getSelectedCell()?.pos).toEqual({ col: 0, row: 0 });
    expect(cellFocus).toHaveBeenCalledWith({
      pos: { col: 0, row: 0 },
      clueId: '1-across',
    });
    expect(getAnnouncement()).toBe(
      '1 across: Toy on a string (2-2). Letter 1 of 4, blank.',
    );
  });

  test('tabbing to the grid keeps an existing selection', async () => {
    stores.clues.getState().select('4-across');
    stores.cells.getState().select({ col: 2, row: 2 });
    stores.render(<ConnectedGrid />);

    await userEvent.tab();

    expect(getSelectedClue()?.id).toBe('4-across');
    expect(getSelectedCell()?.pos).toEqual({ col: 2, row: 2 });
    expect(getAnnouncement()).toBe(
      '4 across: Have a rest (3,4). Letter 3 of 7, blank.',
    );
  });

  test('clicking a cell announces it', async () => {
    stores.render(<ConnectedGrid />);

    // the 4 across cell number
    await userEvent.click(screen.getByText('4').parentElement!);

    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(getAnnouncement()).toBe(
      '4 across: Have a rest (3,4). Letter 1 of 7, blank.',
    );
  });

  test('announces moving and typing within and between clues', async () => {
    stores.render(<ConnectedGrid />);

    await userEvent.tab();
    const input = screen.getByRole('textbox');

    // within the clue only the letter is announced
    fireEvent.keyDown(input, Arrows.RIGHT);
    expect(getAnnouncement()).toBe('Letter 2 of 4, blank.');

    // typing moves on to the next cell
    fireEvent.change(input, { target: { value: 'Y' } });
    expect(getAnnouncement()).toBe('Letter 3 of 4, blank.');

    // typing in the last cell stays put and announces the letter
    fireEvent.keyDown(input, Arrows.RIGHT);
    fireEvent.change(input, { target: { value: 'O' } });
    expect(getSelectedCell()?.pos).toEqual({ col: 3, row: 0 });
    expect(getAnnouncement()).toBe('Letter 4 of 4, O.');

    // switching direction announces the crossing clue
    fireEvent.keyDown(input, Arrows.DOWN);
    expect(getSelectedClue()?.id).toBe('2-down');
    expect(getAnnouncement()).toBe(
      '2 down, 3 down: Bits and bobs (4,3,4). Letter 1 of 11, O.',
    );

    // deleting announces the cleared cell
    fireEvent.keyDown(input, { key: 'Delete', code: 'Delete' });
    expect(getAnnouncement()).toBe('Letter 1 of 11, blank.');
  });

  test('announces checked cells', async () => {
    stores.render(<ConnectedGrid />);

    await userEvent.tab();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'X' } });
    fireEvent.keyDown(input, Arrows.LEFT);
    expect(getAnnouncement()).toBe('Letter 1 of 4, X.');

    act(() => {
      const { cells, setCells } = stores.cells.getState();
      setCells(
        cells.map((cell) =>
          cell.guess !== undefined ? { ...cell, checked: true } : cell,
        ),
      );
    });
    expect(getAnnouncement()).toBe('Letter 1 of 4, X, incorrect.');
  });

  test('the announcement is cleared on blur and repeated on refocus', async () => {
    stores.render(<ConnectedGrid />);

    await userEvent.tab();
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, Arrows.RIGHT);
    expect(getAnnouncement()).toBe('Letter 2 of 4, blank.');

    act(() => input.blur());
    expect(getAnnouncement()).toBe('');

    act(() => input.focus());
    expect(getAnnouncement()).toBe(
      '1 across: Toy on a string (2-2). Letter 2 of 4, blank.',
    );
  });

  test('changes are not announced while the grid is not focused', () => {
    stores.render(<ConnectedGrid />);

    act(() => {
      stores.clues.getState().select('1-across');
      stores.cells.getState().select({ col: 0, row: 0 });
    });

    expect(getAnnouncement()).toBe('');
  });

  test('Escape leaves the grid', async () => {
    const onEscape = vi.fn();
    const { rerender } = stores.render(<ConnectedGrid onEscape={onEscape} />);

    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledTimes(1);

    // without a handler, the input is blurred
    rerender(<ConnectedGrid />);
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('textbox')).not.toHaveFocus();
  });

  test('it saves pending changes when unmounting', () => {
    vi.useFakeTimers();
    const setGuessGrid = vi.fn();

    function ConnectedGrid() {
      const cells = useCellsStore((state) => state.cells);
      const clues = useCluesStore((state) => state.clues);

      return (
        <Grid
          cellMatcher={cellMatcher}
          cellSize={DEFAULT_CELL_SIZE}
          cells={cells}
          clues={clues}
          cols={testData.dimensions.cols}
          rawClues={testData.entries}
          rows={testData.dimensions.rows}
          setGuessGrid={setGuessGrid}
        />
      );
    }

    const { unmount } = stores.render(<ConnectedGrid />);

    fireEvent.click(screen.getByText('1').parentElement!);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A' } });

    // unmount before the debounce delay
    expect(setGuessGrid).not.toHaveBeenCalled();
    unmount();

    expect(setGuessGrid).toHaveBeenCalledTimes(1);
    expect(setGuessGrid.mock.calls[0][0].value[0][0]).toBe('A');
  });
});
