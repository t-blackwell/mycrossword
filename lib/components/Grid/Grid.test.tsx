import userEvent from '@testing-library/user-event';
import { CellFocus, CellPosition, GuessGrid } from '~/types';
import testData from '~/testData/test.valid.1';
import { initialiseGuessGrid } from '~/utils/guess';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { initialiseStores } from '~/utils/test';
import Grid from './Grid';
import { useCellsStore } from '~/stores/useCellsStore';
import { useCluesStore } from '~/stores/useCluesStore';

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
  rerenderFn: (
    ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
  ) => void,
) {
  expect(getSelectedCell()?.pos).toEqual(selectedCellPos);
  expect(getSelectedClue()?.id).toBe(selectedClueId);

  rerenderFn(
    <Grid
      cellMatcher={cellMatcher}
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

// TODO: update tests to work with input element
describe.skip('all tests', () => {
  test('it renders', () => {
    initialiseStores(testData);

    render(
      <Grid
        cellMatcher={cellMatcher}
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

    const grid = screen.getByTestId('grid');
    const cells = grid.querySelectorAll('.GridCell');
    expect(cells.length).toBe(23);
  });

  test('arrows move between cells', async () => {
    initialiseStores(testData);
    const setGuessGrid = jest.fn();
    const cellFocus = jest.fn();
    let cellFocusCounter = 0;

    const { rerender } = render(
      <Grid
        cellMatcher={cellMatcher}
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

    const grid = screen.getByTestId('grid');

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

    // move down
    fireEvent.keyDown(grid, Arrows.DOWN);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 1 },
      '1-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move back up to top of 1-down
    fireEvent.keyDown(grid, Arrows.UP);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move up to cycle to bottom of 1-down
    fireEvent.keyDown(grid, Arrows.UP);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 5 },
      '1-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move up on 1-down
    fireEvent.keyDown(grid, Arrows.UP);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 4 },
      '1-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move right to jump over to 2-down
    fireEvent.keyDown(grid, Arrows.RIGHT);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 4 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move right to jump over to the 3-down
    fireEvent.keyDown(grid, Arrows.RIGHT);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 4 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // cycle back to the top of 3-down
    fireEvent.keyDown(grid, Arrows.DOWN);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 1 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move left to jump back to 2-down
    fireEvent.keyDown(grid, Arrows.LEFT);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 1 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move up to the top of 2-down
    fireEvent.keyDown(grid, Arrows.UP);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 0 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move left onto 1-across
    fireEvent.keyDown(grid, Arrows.LEFT);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 2, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move left again on 1-across
    fireEvent.keyDown(grid, Arrows.LEFT);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 1, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // move left again on 1-across
    fireEvent.keyDown(grid, Arrows.LEFT);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );
  });

  test('display characters and update cell positions', async () => {
    jest.useFakeTimers();

    initialiseStores(testData);
    const setGuessGrid = jest.fn();
    const cellFocus = jest.fn();
    let guessGridCounter = 0;
    let cellFocusCounter = 0;

    const { rerender } = render(
      <Grid
        cellMatcher={cellMatcher}
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

    const grid = screen.getByTestId('grid');

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

    // type 'A' and move to next position
    fireEvent.keyDown(grid, { key: 'A', code: 'KeyA' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'B' and move to next position
    fireEvent.keyDown(grid, { key: 'B', code: 'KeyB' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'C' and move to next position
    fireEvent.keyDown(grid, { key: 'C', code: 'KeyC' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'D' and stay in the same position
    fireEvent.keyDown(grid, { key: 'D', code: 'KeyD' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // move to 2-down
    fireEvent.keyDown(grid, Arrows.DOWN);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 3, row: 1 },
      '2-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type 'E' and move to next position
    fireEvent.keyDown(grid, { key: 'E', code: 'KeyE' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'F' and move to next position
    fireEvent.keyDown(grid, { key: 'F', code: 'KeyF' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'G' and move to next position
    fireEvent.keyDown(grid, { key: 'G', code: 'KeyG' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'H' and move to next position
    fireEvent.keyDown(grid, { key: 'H', code: 'KeyH' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'I' and move to next position
    fireEvent.keyDown(grid, { key: 'I', code: 'KeyI' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'J' and jump to next clue in the group
    fireEvent.keyDown(grid, { key: 'J', code: 'KeyJ' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'K' and move to next position
    fireEvent.keyDown(grid, { key: 'K', code: 'KeyK' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'L' and move to next position
    fireEvent.keyDown(grid, { key: 'L', code: 'KeyL' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'M' and move to next position
    fireEvent.keyDown(grid, { key: 'M', code: 'KeyM' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type 'N' and stay in the same position
    fireEvent.keyDown(grid, { key: 'N', code: 'KeyN' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type backspace and move back one position
    fireEvent.keyDown(grid, { key: 'Backspace', code: 'Backspace' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type invalid character and stay in the same position
    fireEvent.keyDown(grid, { key: '=', code: 'Equal' });
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
    fireEvent.keyDown(grid, { key: 'Delete', code: 'Delete' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // move up one position
    fireEvent.keyDown(grid, Arrows.UP);
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 2 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type backspace and move back one position
    fireEvent.keyDown(grid, { key: 'Backspace', code: 'Backspace' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type backspace and jump to previous clue in group
    fireEvent.keyDown(grid, { key: 'Backspace', code: 'Backspace' });
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
      jest.advanceTimersByTime(debounceTime);
    });
    expect(setGuessGrid).toHaveBeenCalledTimes(++guessGridCounter);

    // type tab and jump to next clue
    fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 6, row: 1 },
      '3-down',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type tab and jump to next clue
    fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type tab and jump to next clue
    fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab' });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 2 },
      '4-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    // type shift+tab and jump to previous clue
    fireEvent.keyDown(grid, { key: 'Tab', code: 'Tab', shiftKey: true });
    expect(cellFocus).toHaveBeenCalledTimes(++cellFocusCounter);
    expectSelectionsAndRerender(
      { col: 0, row: 0 },
      '1-across',
      setGuessGrid,
      cellFocus,
      rerender,
    );

    jest.useRealTimers();
  });

  test('onCellChange called', async () => {
    initialiseStores(testData);
    const onCellChange = jest.fn();
    const setGuessGrid = jest.fn();

    const { rerender } = render(
      <Grid
        cellMatcher={cellMatcher}
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

    const grid = screen.getByTestId('grid');

    // click top left cell
    await userEvent.click(screen.getByText('1').parentElement!);
    rerender(
      <Grid
        cellMatcher={cellMatcher}
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
    fireEvent.keyDown(grid, { key: 'A', code: 'KeyA' });
    expect(onCellChange).toHaveBeenCalledTimes(1);
    rerender(
      <Grid
        cellMatcher={cellMatcher}
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
    fireEvent.keyDown(grid, { key: 'A', code: 'KeyA' });
    expect(onCellChange).toHaveBeenCalledTimes(1);
  });
});
