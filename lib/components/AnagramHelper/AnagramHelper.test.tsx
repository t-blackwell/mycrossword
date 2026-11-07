import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_HTML_TAGS } from '~/utils/general';
import data from '~/testData/test.valid.1';
import { getGroupCells, getGroupSeparators } from '~/utils/clue';
import { initialiseStores } from '~/utils/test';
import AnagramHelper from './AnagramHelper';
import { useCluesStore } from '~/stores/useCluesStore';
import { useCellsStore } from '~/stores/useCellsStore';

test('it renders', async () => {
  initialiseStores(data);

  const oneAcross = useCluesStore
    .getState()
    .clues.find((clue) => clue.id === '1-across')!;
  const groupCells = getGroupCells(
    ['1-across'],
    useCellsStore.getState().cells,
  );
  const groupSeparators = getGroupSeparators(
    ['1-across'],
    useCluesStore.getState().clues,
  );
  const onClose = jest.fn();
  const onCellGuess = jest.fn();

  const { rerender } = render(
    <AnagramHelper
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      clue={oneAcross}
      groupCells={groupCells}
      groupSeparators={groupSeparators}
      onCellGuess={onCellGuess}
      onClose={onClose}
    />,
  );

  // clue starts broken out into clickable words
  screen.getByText('1 across');
  screen.getByText('Toy');
  screen.getByText('on');
  screen.getByText('a');
  screen.getByText('string');

  // input should be empty
  const input = screen.getByPlaceholderText('Enter letters...');
  expect(input).toHaveValue('');

  // buttons should be disabled
  const reset = screen.getByRole('button', { name: 'Reset' });
  expect(reset).toBeDisabled();
  const shuffle = screen.getByRole('button', { name: 'Shuffle' });
  expect(shuffle).toBeDisabled();

  // check close button calls function
  const close = screen.getByRole('button', { name: 'Close' });
  await userEvent.click(close);
  expect(onClose).toHaveBeenCalledTimes(1);

  // type character into input
  await userEvent.type(input, 'wxyz');

  // check character counter is visible and buttons are now enabled
  screen.getByText('4/4');
  expect(reset).toBeEnabled();
  expect(shuffle).toBeEnabled();

  // shuffle letters into word wheel
  await userEvent.click(shuffle);

  // input control should have been removed
  expect(input).not.toBeInTheDocument();

  // check clue is now a single string
  screen.getByText('Toy on a string (2-2)');

  // there's no row/wheel toggle
  expect(screen.queryByRole('button', { name: 'Row' })).toBeNull();

  // check characters appear in the wheel and the solution boxes
  ['W', 'X', 'Y', 'Z'].forEach((letter) => {
    screen.getByText(letter);
    screen.getByDisplayValue(letter);
  });

  // typing in a solution box enters the letter in the grid
  const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
  await userEvent.type(boxes[0], 'z');
  expect(onCellGuess).toHaveBeenLastCalledWith(groupCells[0], 'Z');

  // the grid letter then shows in the box and fades on the wheel
  rerender(
    <AnagramHelper
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      clue={oneAcross}
      groupCells={groupCells.map((cell, i) =>
        i === 0 ? { ...cell, guess: 'Z' } : cell,
      )}
      groupSeparators={groupSeparators}
      onCellGuess={onCellGuess}
      onClose={onClose}
    />,
  );
  expect(screen.getAllByRole('textbox')[0]).toHaveValue('Z');
  expect(screen.getByText('Z').parentElement).toHaveClass(
    'LetterTiles__tile--used',
  );

  // and stays put when shuffling
  await userEvent.click(shuffle);
  expect(screen.getAllByRole('textbox')[0]).toHaveValue('Z');

  // reset buttons and input
  await userEvent.click(reset);

  // type letters and hit escape to clear
  const newInput = screen.getByPlaceholderText('Enter letters...');
  await userEvent.type(newInput, 'abc'); // can't use {esc}
  fireEvent.keyDown(newInput, { key: 'Escape', code: 'Escape' });
  expect(newInput).toHaveValue('');

  // type letters and hit enter to shuffle
  await userEvent.type(newInput, 'xyz'); // can't use {enter}
  fireEvent.keyDown(newInput, { key: 'Enter', code: 'Enter' });

  // input control should have been removed again
  expect(newInput).not.toBeInTheDocument();

  // check W isn't include this time
  expect(screen.queryByText('W')).toBeNull();

  // check characters appear in the wheel and the solution boxes
  ['X', 'Y', 'Z'].forEach((letter) => {
    screen.getByText(letter);
    screen.getByDisplayValue(letter);
  });
});
