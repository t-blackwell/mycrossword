import { DEFAULT_HTML_TAGS } from '~/utils/general';
import testData from '~/testData/test.valid.1';
import { initialiseStores } from '~/utils/test';
import Clues from './Clues';
import { render, screen } from '@testing-library/react';
import { useCluesStore } from '~/stores/useCluesStore';

const DEFAULT_GRID_HEIGHT = 481;

beforeEach(() => {
  initialiseStores(testData);
});

test('it renders', () => {
  const clues = useCluesStore.getState().clues;

  render(
    <Clues
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      entries={clues}
      gridHeight={DEFAULT_GRID_HEIGHT}
    />,
  );

  screen.getByText('Across');
  screen.getByText('Down');

  expect(screen.getAllByText('1').length).toBe(2); // across and down
  screen.getByText('2');
  screen.getByText('3');
  screen.getByText('4');

  screen.getByText('Toy on a string (2-2)');
  screen.getByText('Have a rest (3,4)');
  screen.getByText('Colour (6)');
  screen.getByText('Bits and bobs (4,3,4)');
  screen.getByText('See 2');
});

test('it highlights selected clue', () => {
  const clues = useCluesStore.getState().clues;

  render(
    <Clues
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      entries={clues}
      gridHeight={DEFAULT_GRID_HEIGHT}
      selectedClueId="1-across"
    />,
  );

  const clueText = screen.getByText('Toy on a string (2-2)');
  expect(clueText.parentElement).toHaveClass('Clue--highlighted');
});

test('it highlights linked clues', () => {
  const clues = useCluesStore.getState().clues;

  render(
    <Clues
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      entries={clues}
      gridHeight={DEFAULT_GRID_HEIGHT}
      selectedClueId="2-down"
    />,
  );

  const clueTextOne = screen.getByText('Bits and bobs (4,3,4)');
  expect(clueTextOne.parentElement).toHaveClass('Clue--highlighted');

  const clueTextTwo = screen.getByText('See 2');
  expect(clueTextTwo.parentElement).toHaveClass('Clue--highlighted');
});
