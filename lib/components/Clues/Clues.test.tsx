import { DEFAULT_HTML_TAGS } from '~/utils/general';
import testData from '~/testData/test.valid.1';
import { createTestStores, TestStores } from '~/utils/test';
import Clues from './Clues';
import { screen, within } from '@testing-library/react';

const DEFAULT_GRID_HEIGHT = 481;

let stores: TestStores;

beforeEach(() => {
  stores = createTestStores(testData);
});

test('it renders', () => {
  const clues = stores.clues.getState().clues;

  stores.render(
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
  const clues = stores.clues.getState().clues;

  stores.render(
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
  const clues = stores.clues.getState().clues;

  stores.render(
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

test('it renders the clues as lists labelled by direction', () => {
  const clues = stores.clues.getState().clues;

  stores.render(
    <Clues
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      entries={clues}
      gridHeight={DEFAULT_GRID_HEIGHT}
      selectedClueId="3-down"
    />,
  );

  const across = screen.getByRole('list', { name: 'Across' });
  const down = screen.getByRole('list', { name: 'Down' });

  expect(within(across).getAllByRole('listitem')).toHaveLength(2);
  expect(within(down).getAllByRole('listitem')).toHaveLength(3);

  within(across).getByRole('button', { name: /^1\s*across\s*Toy on a string/ });
  within(down).getByRole('button', { name: /^1\s*down\s*Colour/ });

  // the selected clue's group is marked as current
  const current = screen
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-current') === 'true')
    .map((button) => button.getAttribute('data-clue-id'));
  expect(current).toEqual(['2-down', '3-down']);
});
