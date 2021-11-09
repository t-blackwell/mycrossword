import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { CellPosition, GuessGrid } from './../../interfaces';
import { select as cellsActionSelect } from './../../redux/cellsSlice';
import { select as cluesActionSelect } from './../../redux/cluesSlice';
import data from './../../testData/test.valid.1';
import { initialiseGuessGrid } from './../../utils/guess';
import { render, screen, store } from './../../utils/rtl';
import { initialiseStore } from './../../utils/test';
import Controls from './Controls';

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
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
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
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
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

test('it renders with shorter button text', () => {
  render(
    <Controls
      breakpoint="xs"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
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

test('it checks incorrect letter', () => {
  // initialise guess grid with X characters
  const gridChar = 'X';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStore(store, data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  store.dispatch(cellsActionSelect(firstCellPos));
  store.dispatch(cluesActionSelect('1-across'));

  // check the first cell in local storage
  expect(guessGrid.value[firstCellPos.col][firstCellPos.row]).toBe(gridChar);

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      setGuessGrid={setLocalStorageGuessGrid}
      onCellChange={cellChange}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  userEvent.click(checkButton);

  const menuItem = screen.getByText('Check letter');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(1);

  // check the incorrect 'X' has been removed from the cells
  const firstCell = store
    .getState()
    .cells.cells.find(
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

test('it checks correct letter', () => {
  // initialise guess grid with Y characters
  const gridChar = 'Y';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStore(store, data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  store.dispatch(cellsActionSelect(firstCellPos));
  store.dispatch(cluesActionSelect('1-across'));

  // check the first cell in local storage
  expect(guessGrid.value[firstCellPos.col][firstCellPos.row]).toBe(gridChar);

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  userEvent.click(checkButton);

  const menuItem = screen.getByText('Check letter');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(0);

  // check the correct 'Y' (solution = YO-YO) has been kept in the cells
  const firstCell = store
    .getState()
    .cells.cells.find(
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

test('it checks word', () => {
  // initialise guess grid with Y characters
  const gridChar = 'Y';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStore(store, data, getLocalStorageGuessGrid());

  // mark first cell and clue as selected
  store.dispatch(cellsActionSelect({ col: 0, row: 0 }));
  store.dispatch(cluesActionSelect('1-across'));

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  userEvent.click(checkButton);

  const menuItem = screen.getByText('Check word');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(2);

  // check the word YO-YO ... Ys should remain, Os should be undefined
  const solution = 'YOYO';
  const localStorageGuessGrid = getLocalStorageGuessGrid();
  for (let i = 0; i < 4; i += 1) {
    // check cells in store
    const currentCell = store
      .getState()
      .cells.cells.find((cell) => cell.pos.col === i && cell.pos.row === 0);
    expect(currentCell).toBeDefined();
    expect(currentCell?.guess).toBe(
      solution[i] === gridChar ? gridChar : undefined,
    );

    // check cells in local storage
    const currentCellLs = localStorageGuessGrid.value[i][0];
    expect(currentCellLs).toBe(solution[i] === gridChar ? gridChar : '');
  }
});

test('it checks grid', () => {
  // initialise guess grid with W characters
  const gridChar = 'W';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStore(store, data, getLocalStorageGuessGrid());

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const checkButton = screen.getByRole('button', { name: 'Check' });
  userEvent.click(checkButton);

  const menuItem = screen.getByText('Check grid');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  // confirm check grid menu selection
  const confirmButton = screen.getByRole('button', {
    name: 'Confirm check grid',
  });
  userEvent.click(confirmButton);

  expect(cellChange).toHaveBeenCalledTimes(21); // 23 - 2 (two Ws)

  const guessGrid = getLocalStorageGuessGrid();

  // traverse cells and check they've all been cleared exc two (YELLO*W* & LIEDO*W*N)
  store.getState().cells.cells.forEach((cell) => {
    if (cell.guess === gridChar) {
      expect(cell.guess).toBe(gridChar);
      expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe(gridChar);
    } else {
      expect(cell.guess).toBeUndefined();
      expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe('');
    }
  });
});

test('it reveals letter', () => {
  // initialise empty guess grid
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStore(store, data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  store.dispatch(cellsActionSelect(firstCellPos));
  store.dispatch(cluesActionSelect('1-across'));

  // check the first cell in local storage
  expect(guessGrid.value[firstCellPos.col][firstCellPos.row]).toBe('');

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const revealButton = screen.getByRole('button', { name: 'Reveal' });
  userEvent.click(revealButton);

  const menuItem = screen.getByText('Reveal letter');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(1);

  // check the correct 'Y' (solution = YO-YO) has added
  const expectedChar = 'Y';
  const firstCell = store
    .getState()
    .cells.cells.find(
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

test('it reveals word', () => {
  // initialise empty guess grid
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  const guessGrid = getLocalStorageGuessGrid();
  initialiseStore(store, data, guessGrid);

  // mark first cell and clue as selected
  const firstCellPos: CellPosition = { col: 0, row: 0 };
  store.dispatch(cellsActionSelect(firstCellPos));
  store.dispatch(cluesActionSelect('1-across'));

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const revealButton = screen.getByRole('button', { name: 'Reveal' });
  userEvent.click(revealButton);

  const menuItem = screen.getByText('Reveal word');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(4);

  // check the word YO-YO has been added to the grid
  const solution = 'YOYO';
  const localStorageGuessGrid = getLocalStorageGuessGrid();
  for (let i = 0; i < 4; i += 1) {
    const expectedChar = solution[i];

    // check cells in store
    const currentCell = store
      .getState()
      .cells.cells.find((cell) => cell.pos.col === i && cell.pos.row === 0);
    expect(currentCell).toBeDefined();
    expect(currentCell?.guess).toBe(expectedChar);

    // check cells in local storage
    const currentCellLs = localStorageGuessGrid.value[i][0];
    expect(currentCellLs).toBe(expectedChar);
  }
});

test('it reveals grid', () => {
  // initialise empty guess grid
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStore(store, data, getLocalStorageGuessGrid());

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const reveal = screen.getByRole('button', { name: 'Reveal' });
  userEvent.click(reveal);

  const menuItem = screen.getByText('Reveal grid');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  // confirm reveal grid menu selection
  const confirmButton = screen.getByRole('button', {
    name: 'Confirm reveal grid',
  });
  userEvent.click(confirmButton);

  expect(cellChange).toHaveBeenCalledTimes(23);

  const guessGrid = getLocalStorageGuessGrid();

  // traverse cells and check they've all been populated
  store.getState().cells.cells.forEach((cell) => {
    expect(cell.guess).toBe(cell.val);
    expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe(cell.val);
  });
});

test('it clears word', () => {
  // initialise guess grid with X characters
  const gridChar = 'X';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStore(store, data, getLocalStorageGuessGrid());

  // mark first cell and clue as selected
  store.dispatch(cellsActionSelect({ col: 0, row: 0 }));
  store.dispatch(cluesActionSelect('1-across'));

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const clearButton = screen.getByRole('button', { name: 'Clear' });
  userEvent.click(clearButton);

  const menuItem = screen.getByText('Clear word');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  expect(cellChange).toHaveBeenCalledTimes(2);

  const localStorageGuessGrid = getLocalStorageGuessGrid();

  // part of selected word at 1-across should have been cleared
  for (let i = 0; i < 4; i += 1) {
    // check cells in store
    const currentCell = store
      .getState()
      .cells.cells.find((cell) => cell.pos.col === i && cell.pos.row === 0);
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

test('it clears grid', () => {
  // initialise guess grid with X characters
  const gridChar = 'X';
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
    gridChar,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStore(store, data, getLocalStorageGuessGrid());

  const cellChange = jest.fn();

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={jest.fn}
      onCellChange={cellChange}
      setGuessGrid={setLocalStorageGuessGrid}
      solutionsAvailable
    />,
  );

  const clearButton = screen.getByRole('button', { name: 'Clear' });
  userEvent.click(clearButton);

  const menuItem = screen.getByText('Clear grid');
  expect(menuItem).toBeEnabled();
  userEvent.click(menuItem);

  // confirm clear grid menu selection
  const confirmButton = screen.getByRole('button', {
    name: 'Confirm clear grid',
  });
  userEvent.click(confirmButton);

  expect(cellChange).toHaveBeenCalledTimes(23);

  const guessGrid = getLocalStorageGuessGrid();

  // traverse cells and check they've all been cleared
  store.getState().cells.cells.forEach((cell) => {
    expect(cell.guess).toBeUndefined();
    expect(guessGrid.value[cell.pos.col][cell.pos.row]).toBe('');
  });
});

test('it calls function on anagram helper button click', () => {
  const initGrid = initialiseGuessGrid(
    data.dimensions.cols,
    data.dimensions.rows,
  );
  setLocalStorageGuessGrid(initGrid);
  initialiseStore(store, data, getLocalStorageGuessGrid());

  const onAnagramHelperClick = jest.fn();

  // mark first cell and clue as selected
  store.dispatch(cellsActionSelect({ col: 0, row: 0 }));
  store.dispatch(cluesActionSelect('1-across'));

  render(
    <Controls
      breakpoint="md"
      cells={store.getState().cells.cells}
      clues={store.getState().clues.clues}
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
  userEvent.click(anagramHelperButton);
  expect(onAnagramHelperClick).toHaveBeenCalledTimes(1);
});
