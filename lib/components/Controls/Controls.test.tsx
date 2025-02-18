import userEvent from '@testing-library/user-event';
import { CellPosition, GuessGrid } from '~/types';
import data from '~/testData/test.valid.1';
import { initialiseGuessGrid } from '~/utils/guess';
import { initialiseStores } from '~/utils/test';
import Controls from './Controls';
import { act, render, screen } from '@testing-library/react';
import { useCellsStore } from '~/stores/useCellsStore';
import { useCluesStore } from '~/stores/useCluesStore';

function getLocalStorageGuessGrid(): GuessGrid {
  const str = localStorage.getItem(data.id);

  if (!str) {
    throw new Error(`Unable to find "${data.id}" in localStorage`);
  }

  return JSON.parse(str);
}

function setLocalStorageGuessGrid(
  guessGrid: GuessGrid | ((val: GuessGrid) => GuessGrid),
) {
  localStorage.setItem(data.id, JSON.stringify(guessGrid));
}

beforeEach(() => {
  localStorage.clear();
});

test('it renders', () => {
  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      setGuessGrid={jest.fn}
      solutionsAvailable
    />,
  );

  screen.getByRole('button', { name: 'Check' });
  screen.getByRole('button', { name: 'Reveal' });
  screen.getByRole('button', { name: 'Clear' });
  screen.getByRole('button', { name: 'Anagram helper' });
});

test('it renders without solution controls', () => {
  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      setGuessGrid={jest.fn}
      solutionsAvailable={false}
    />,
  );

  expect(
    screen.queryByRole('button', { name: 'Check' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Reveal' }),
  ).not.toBeInTheDocument();
  screen.getByRole('button', { name: 'Clear' });
  screen.getByRole('button', { name: 'Anagram helper' });
});

// TODO: fix media query test (::after text not found)
test.skip('it renders with shorter button text', () => {
  act(() => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
  });

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      setGuessGrid={jest.fn}
      solutionsAvailable={false}
    />,
  );

  screen.getByRole('button', { name: 'Anag.' });
  expect(
    screen.queryByRole('button', { name: 'Anagram helper' }),
  ).not.toBeInTheDocument();
});

test('it checks incorrect letter', async () => {
  // initialise guess grid with X characters
  const gridChar = 'X';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStores(data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  useCellsStore.getState().select(firstCellPos);
  useCluesStore.getState().select('1-across');

  // check the first cell in local storage
  expect(guessGrid.value[firstCellPos.col][firstCellPos.row]).toBe(gridChar);

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      setGuessGrid={setLocalStorageGuessGrid}
      onCellChange={cellChange}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  await userEvent.click(checkButton);

  const menuItem = screen.getByText('Check letter');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(1);

  // check the incorrect 'X' has been removed from the cells
  const firstCell = useCellsStore
    .getState()
    .cells.find(
      (cell) =>
        cell.pos.col === firstCellPos.col && cell.pos.row === firstCellPos.row,
    );
  expect(firstCell).toBeDefined();
  expect(firstCell?.guess).toBeUndefined();

  // check the incorrect 'X' has been removed from the local storage
  expect(
    getLocalStorageGuessGrid().value[firstCellPos.col][firstCellPos.row],
  ).toBe('');
});

test('it checks correct letter', async () => {
  // initialise guess grid with Y characters
  const gridChar = 'Y';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStores(data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  useCellsStore.getState().select(firstCellPos);
  useCluesStore.getState().select('1-across');

  // check the first cell in local storage
  expect(guessGrid.value[firstCellPos.col][firstCellPos.row]).toBe(gridChar);

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  await userEvent.click(checkButton);

  const menuItem = screen.getByText('Check letter');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(0);

  // check the correct 'Y' (solution = YO-YO) has been kept in the cells
  const firstCell = useCellsStore
    .getState()
    .cells.find(
      (cell) =>
        cell.pos.col === firstCellPos.col && cell.pos.row === firstCellPos.row,
    );
  expect(firstCell).toBeDefined();
  expect(firstCell?.guess).toBe(gridChar);

  // check the letter has been kept in local storage
  expect(
    getLocalStorageGuessGrid().value[firstCellPos.col][firstCellPos.row],
  ).toBe(gridChar);
});

test('it checks word', async () => {
  // initialise guess grid with Y characters
  const gridChar = 'Y';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStores(data, getLocalStorageGuessGrid());

  // mark first cell and clue as selected
  useCellsStore.getState().select({ col: 0, row: 0 });
  useCluesStore.getState().select('1-across');

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  await userEvent.click(checkButton);

  const menuItem = screen.getByText('Check word');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(2);

  // check the word YO-YO ... Ys should remain, Os should be undefined
  const solution = 'YOYO';
  const localStorageGuessGrid = getLocalStorageGuessGrid();
  for (let i = 0; i < 4; i += 1) {
    // check cells in store
    const currentCell = useCellsStore
      .getState()
      .cells.find((cell) => cell.pos.col === i && cell.pos.row === 0);
    expect(currentCell).toBeDefined();
    expect(currentCell?.guess).toBe(
      solution[i] === gridChar ? gridChar : undefined,
    );

    // check cells in local storage
    const currentCellLs = localStorageGuessGrid.value[i][0];
    expect(currentCellLs).toBe(solution[i] === gridChar ? gridChar : '');
  }
});

test('it checks grid', async () => {
  // initialise guess grid with W characters
  const gridChar = 'W';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStores(data, getLocalStorageGuessGrid());

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  await userEvent.click(checkButton);

  const menuItem = screen.getByText('Check grid');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  // confirm check grid menu selection
  const confirmButton = screen.getByRole('button', {
    name: 'Confirm check grid',
  });
  await userEvent.click(confirmButton);

  expect(cellChange).toHaveBeenCalledTimes(21); // 23 - 2 (two Ws)

  const guessGrid = getLocalStorageGuessGrid();

  // traverse cells and check they've all been cleared exc two (YELLO*W* & LIEDO*W*N)
  useCellsStore.getState().cells.forEach((cell) => {
    if (cell.guess === gridChar) {
      expect(cell.guess).toBe(gridChar);
      expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe(gridChar);
    } else {
      expect(cell.guess).toBeUndefined();
      expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe('');
    }
  });
});

test('it reveals letter', async () => {
  // initialise empty guess grid
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStores(data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  useCellsStore.getState().select(firstCellPos);
  useCluesStore.getState().select('1-across');

  // check the first cell in local storage
  expect(guessGrid.value[firstCellPos.col][firstCellPos.row]).toBe('');

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const revealButton = screen.getByRole('button', { name: 'Reveal' });
  await userEvent.click(revealButton);

  const menuItem = screen.getByText('Reveal letter');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(1);

  // check the correct 'Y' (solution = YO-YO) has added
  const expectedChar = 'Y';
  const firstCell = useCellsStore
    .getState()
    .cells.find(
      (cell) =>
        cell.pos.col === firstCellPos.col && cell.pos.row === firstCellPos.row,
    );
  expect(firstCell).toBeDefined();
  expect(firstCell?.guess).toBe(expectedChar);

  // check the letter has been kept in local storage
  expect(
    getLocalStorageGuessGrid().value[firstCellPos.col][firstCellPos.row],
  ).toBe(expectedChar);
});

test('it reveals word', async () => {
  // initialise empty guess grid
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStores(data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  useCellsStore.getState().select(firstCellPos);
  useCluesStore.getState().select('1-across');

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const revealButton = screen.getByRole('button', { name: 'Reveal' });
  await userEvent.click(revealButton);

  const menuItem = screen.getByText('Reveal word');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(4);

  // check the word YO-YO has been added to the grid
  const solution = 'YOYO';
  const localStorageGuessGrid = getLocalStorageGuessGrid();
  for (let i = 0; i < 4; i += 1) {
    const expectedChar = solution[i];

    // check cells in store
    const currentCell = useCellsStore
      .getState()
      .cells.find((cell) => cell.pos.col === i && cell.pos.row === 0);
    expect(currentCell).toBeDefined();
    expect(currentCell?.guess).toBe(expectedChar);

    // check cells in local storage
    const currentCellLs = localStorageGuessGrid.value[i][0];
    expect(currentCellLs).toBe(expectedChar);
  }
});

test('it reveals grid', async () => {
  // initialise empty guess grid
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStores(data, getLocalStorageGuessGrid());

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const reveal = screen.getByRole('button', { name: 'Reveal' });
  await userEvent.click(reveal);

  const menuItem = screen.getByText('Reveal grid');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  // confirm reveal grid menu selection
  const confirmButton = screen.getByRole('button', {
    name: 'Confirm reveal grid',
  });
  await userEvent.click(confirmButton);

  expect(cellChange).toHaveBeenCalledTimes(23);

  const guessGrid = getLocalStorageGuessGrid();

  // traverse cells and check they've all been populated
  useCellsStore.getState().cells.forEach((cell) => {
    expect(cell.guess).toBe(cell.val);
    expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe(cell.val);
  });
});

test('it clears word', async () => {
  // initialise guess grid with X characters
  const gridChar = 'X';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStores(data, getLocalStorageGuessGrid());

  // mark first cell and clue as selected
  useCellsStore.getState().select({ col: 0, row: 0 });
  useCluesStore.getState().select('1-across');

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const clearButton = screen.getByRole('button', { name: 'Clear' });
  await userEvent.click(clearButton);

  const menuItem = screen.getByText('Clear word');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(2);

  const localStorageGuessGrid = getLocalStorageGuessGrid();

  // part of selected word at 1-across should have been cleared
  for (let i = 0; i < 4; i += 1) {
    // check cells in store
    const currentCell = useCellsStore
      .getState()
      .cells.find((cell) => cell.pos.col === i && cell.pos.row === 0);
    const currentCellLs = localStorageGuessGrid.value[i][0];
    expect(currentCell).toBeDefined();

    // outer letters have neighbours i.e. shouldn't have been removed
    if (i === 0 || i === 3) {
      expect(currentCell?.guess).toBe(gridChar);
      expect(currentCellLs).toBe(gridChar);
    } else {
      expect(currentCell?.guess).toBeUndefined();
      expect(currentCellLs).toBe('');
    }
  }
});

test('it clears grid', async () => {
  // initialise guess grid with X characters
  const gridChar = 'X';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStores(data, getLocalStorageGuessGrid());

  const cellChange = jest.fn();

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const clearButton = screen.getByRole('button', { name: 'Clear' });
  await userEvent.click(clearButton);

  const menuItem = screen.getByText('Clear grid');
  expect(menuItem).toBeEnabled();
  await userEvent.click(menuItem);

  // confirm clear grid menu selection
  const confirmButton = screen.getByRole('button', {
    name: 'Confirm clear grid',
  });
  await userEvent.click(confirmButton);

  expect(cellChange).toHaveBeenCalledTimes(23);

  const guessGrid = getLocalStorageGuessGrid();

  // traverse cells and check they've all been cleared
  useCellsStore.getState().cells.forEach((cell) => {
    expect(cell.guess).toBeUndefined();
    expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe('');
  });
});

test('it calls function on anagram helper button click', async () => {
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStores(data, getLocalStorageGuessGrid());

  const onAnagramHelperClick = jest.fn();

  // mark first cell and clue as selected
  useCellsStore.getState().select({ col: 0, row: 0 });
  useCluesStore.getState().select('1-across');

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={onAnagramHelperClick}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const anagramHelperButton = screen.getByRole('button', {
    name: 'Anagram helper',
  });
  await userEvent.click(anagramHelperButton);
  expect(onAnagramHelperClick).toHaveBeenCalledTimes(1);
});
