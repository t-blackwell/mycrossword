import { render, screen } from '@testing-library/react';
import data from '~/testData/test.valid.1';
import { getGroupCells } from '~/utils/clue';
import { useCellsStore } from '~/stores/useCellsStore';
import SolutionDisplay from './SolutionDisplay';
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
      cells={cells}
      letters="ABCDEF"
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
  expect(letterOs[0]).toHaveClass('SolutionDisplay__letter--hasHyphen');
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
  expect(letterSs[0]).toHaveClass('SolutionDisplay__letter--hasSpace');
  expect(letterDs[2]).toHaveClass('SolutionDisplay__letter--hasSpace');
});
