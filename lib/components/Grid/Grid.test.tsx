import userEvent from '@testing-library/user-event';
import { CellFocus, CellPosition, GuessGrid } from '~/types';
import testData from '~/testData/test.valid.1';
import { initialiseGuessGrid } from '~/utils/guess';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { initialiseStores } from '~/utils/test';
import Grid from './Grid';
import { useCellsStore } from '~/stores/useCellsStore';
import { useCluesStore } from '~/stores/useCluesStore';
import { DEFAULT_CELL_SIZE } from '~/utils/general';

const cellMatcher = /[A-Z]/;

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
  return useCellsStore.getState().cells;
}

function getClues() {
  return useCluesStore.getState().clues;
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
      guessGrid={emptyGuessGrid}
      onCellFocus={cellFocus}
      rawClues={testData.entries}
      rows={testData.dimensions.rows}
      setGuessGrid={setGuessGrid}
    />,
  );
}

describe('Grid', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('it renders', () => {
    initialiseStores(testData);

    render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        guessGrid={emptyGuessGrid}
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
    initialiseStores(testData);
    const setGuessGrid = vi.fn();
    const cellFocus = vi.fn();
    let cellFocusCounter = 0;

    const { rerender } = render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        guessGrid={emptyGuessGrid}
        onCellFocus={cellFocus}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );
    expect(setGuessGrid).toHaveBeenCalledTimes(1);

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

    initialiseStores(testData);
    const setGuessGrid = vi.fn();
    const cellFocus = vi.fn();
    let guessGridCounter = 0;
    let cellFocusCounter = 0;

    const { rerender } = render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        guessGrid={emptyGuessGrid}
        onCellFocus={cellFocus}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={setGuessGrid}
      />,
    );
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

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
    initialiseStores(testData);
    const onCellChange = vi.fn();
    const setGuessGrid = vi.fn();

    const { rerender } = render(
      <Grid
        cellMatcher={cellMatcher}
        cellSize={DEFAULT_CELL_SIZE}
        cells={getCells()}
        clues={getClues()}
        cols={testData.dimensions.cols}
        guessGrid={emptyGuessGrid}
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
        guessGrid={emptyGuessGrid}
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
        guessGrid={emptyGuessGrid}
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
        guessGrid={emptyGuessGrid}
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
