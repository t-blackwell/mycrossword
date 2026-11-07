import { render, screen } from '@testing-library/react';
import data from '~/testData/test.valid.1';
import { getGroupCells } from '~/utils/clue';
import { useCellsStore } from '~/stores/useCellsStore';
import userEvent from '@testing-library/user-event';
import SolutionDisplay from './SolutionDisplay';
import { getSolutionBoxes } from './solution';
import { initialiseStores } from '~/utils/test';

const noSeparators = { ',': [], '-': [] };

function getCells(clueIds: string[]) {
  const cells = useCellsStore.getState().cells;
  return getGroupCells(clueIds, cells);
}

beforeEach(() => {
  initialiseStores(data);
});

test('it renders', () => {
  // get clue cells and reveal (set guess) for the first element
  const cells = getCells(['1-down']).map((cell) => {
    if (cell.pos.col === 0 && cell.pos.row === 0) {
      return {
        ...cell,
        guess: cell.val,
      };
    }
    return cell;
  });

  render(
    <SolutionDisplay
      cells={cells}
      separators={noSeparators}
      shuffling={false}
    />,
  );

  screen.getByText('Y');
  expect(screen.queryByText('E')).not.toBeInTheDocument();
  expect(screen.queryByText('L')).not.toBeInTheDocument(); // double L
  expect(screen.queryByText('O')).not.toBeInTheDocument();
  expect(screen.queryByText('W')).not.toBeInTheDocument();
});

test('it renders letters while shuffling', () => {
  // get clue cells
  const cells = getCells(['1-down']);

  render(
    <SolutionDisplay
      boxes={getSolutionBoxes(
        cells.map((cell) => cell.guess),
        'ABCDEF',
      )}
      cells={cells}
      separators={noSeparators}
      shuffling
    />,
  );

  screen.getByText('A');
  screen.getByText('B');
  screen.getByText('C');
  screen.getByText('D');
  screen.getByText('E');
  screen.getByText('F');

  // without onEdit, the boxes aren't editable
  expect(screen.queryByRole('textbox')).toBeNull();
});

test('it lets the user type into the boxes while shuffling', async () => {
  const cells = getCells(['1-across']).map((cell, i) =>
    i === 0 ? { ...cell, guess: cell.val } : cell,
  );
  const onEdit = vi.fn(() => true);

  render(
    <SolutionDisplay
      boxes={getSolutionBoxes(
        cells.map((cell) => cell.guess),
        'YOYO',
      )}
      cells={cells}
      onEdit={onEdit}
      separators={noSeparators}
      shuffling
    />,
  );

  // every box is editable, including the one with a grid letter
  const inputs = screen.getAllByRole('textbox');
  expect(inputs.map((input) => (input as HTMLInputElement).value)).toEqual([
    'Y',
    'O',
    'Y',
    'O',
  ]);
  expect(inputs[0]).toHaveClass('SolutionDisplay__letter--populated');
  expect(inputs[1]).toHaveClass('SolutionDisplay__letter--auto');

  // typing replaces the letter and moves on to the next box
  await userEvent.type(inputs[1], 'y');
  expect(onEdit).toHaveBeenLastCalledWith(1, 'Y');
  expect(inputs[2]).toHaveFocus();

  // clearing a box
  await userEvent.clear(inputs[0]);
  expect(onEdit).toHaveBeenLastCalledWith(0, '');

  // backspace in a box that's not in the grid clears the previous box
  onEdit.mockClear();
  await userEvent.type(inputs[2], '{backspace}');
  expect(onEdit).toHaveBeenLastCalledWith(1, '');
  expect(inputs[1]).toHaveFocus();

  // arrow keys move between boxes
  await userEvent.type(inputs[2], '{arrowleft}');
  expect(inputs[1]).toHaveFocus();
});

test('it renders with separator', () => {
  // get clue cells and reveal all
  const cells = getCells(['1-across']).map((cell) => ({
    ...cell,
    guess: cell.val,
  }));

  render(
    <SolutionDisplay
      cells={cells}
      separators={{ ',': [], '-': [2] }}
      shuffling={false}
    />,
  );

  // YO-YO
  const letterYs = screen.getAllByText('Y');
  const letterOs = screen.getAllByText('O');

  expect(letterYs.length).toBe(2);
  expect(letterOs.length).toBe(2);

  // first O should have a hyphen
  expect(letterOs[0].parentElement).toHaveClass(
    'SolutionDisplay__cell--hasHyphen',
  );
});

test('it renders with multiple clues', () => {
  // get clue cells and reveal all
  const cells = getCells(['2-down', '3-down']).map((cell) => ({
    ...cell,
    guess: cell.val,
  }));

  render(
    <SolutionDisplay
      cells={cells}
      separators={{ ',': [4, 7], '-': [] }}
      shuffling={false}
    />,
  );

  // ODDS AND ENDS
  const letterOs = screen.getAllByText('O');
  const letterDs = screen.getAllByText('D');
  const letterSs = screen.getAllByText('S');
  const letterAs = screen.getAllByText('A');
  const letterNs = screen.getAllByText('N');
  const letterEs = screen.getAllByText('E');

  expect(letterOs.length).toBe(1);
  expect(letterDs.length).toBe(4);
  expect(letterSs.length).toBe(2);
  expect(letterAs.length).toBe(1);
  expect(letterNs.length).toBe(2);
  expect(letterEs.length).toBe(1);

  // first S and third D should have a space
  expect(letterSs[0].parentElement).toHaveClass(
    'SolutionDisplay__cell--hasSpace',
  );
  expect(letterDs[2].parentElement).toHaveClass(
    'SolutionDisplay__cell--hasSpace',
  );
});

test('the boxes can be edited before shuffling', async () => {
  const cells = getCells(['1-across']).map((cell, i) =>
    i === 0 ? { ...cell, guess: cell.val } : cell,
  );
  const onEdit = vi.fn(() => true);

  render(
    <SolutionDisplay
      cells={cells}
      onEdit={onEdit}
      separators={noSeparators}
      shuffling={false}
    />,
  );

  // only the grid letter shows
  const inputs = screen.getAllByRole('textbox');
  expect(inputs.map((input) => (input as HTMLInputElement).value)).toEqual([
    'Y',
    '',
    '',
    '',
  ]);

  await userEvent.type(inputs[1], 'o');
  expect(onEdit).toHaveBeenLastCalledWith(1, 'O');
  expect(inputs[2]).toHaveFocus();
});

test("focus stays put when a letter isn't accepted", async () => {
  const cells = getCells(['1-across']);
  const onEdit = vi.fn((_index: number, letter: string) => letter !== '1');

  render(
    <SolutionDisplay
      cells={cells}
      onEdit={onEdit}
      separators={noSeparators}
      shuffling={false}
    />,
  );

  const inputs = screen.getAllByRole('textbox');

  await userEvent.type(inputs[0], '1');
  expect(onEdit).toHaveBeenLastCalledWith(0, '1');
  expect(inputs[0]).toHaveFocus();
  expect(inputs[0]).toHaveValue('');

  await userEvent.type(inputs[0], 'y');
  expect(onEdit).toHaveBeenLastCalledWith(0, 'Y');
  expect(inputs[1]).toHaveFocus();
});
