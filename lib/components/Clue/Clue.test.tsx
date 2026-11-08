import userEvent from '@testing-library/user-event';
import { DEFAULT_HTML_TAGS } from '~/utils/general';
import testData from '~/testData/test.valid.1';
import { createTestStores } from '~/utils/test';
import Clue from './Clue';
import { screen } from '@testing-library/react';

test('it renders', () => {
  createTestStores().render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
      direction="across"
      id="1-across"
      isHighlighted={false}
      num="1"
      row={0}
      text="Clue text inc <em>markup</em>"
    />,
  );

  screen.getByText('1');
  screen.getByText(/clue text inc/i);
  const markup = screen.getByText('markup');
  expect(markup.tagName).toBe('EM');
});

test('it renders answered', () => {
  createTestStores().render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered
      col={0}
      direction="across"
      id="1-across"
      isHighlighted={false}
      num="1"
      row={0}
      text="Clue text"
    />,
  );

  screen.getByText('1');
  screen.getByText('Clue text');

  const clue = screen.getByRole('button');
  expect(clue).toHaveClass('Clue--answered');
});

test('it renders highlighted', () => {
  createTestStores().render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
      direction="across"
      id="1-across"
      isHighlighted
      num="1"
      row={0}
      text="Clue text"
    />,
  );

  screen.getByText('1');
  screen.getByText('Clue text');

  const clue = screen.getByRole('button');
  expect(clue).toHaveClass('Clue--highlighted');
});

test('it selects clue', async () => {
  const stores = createTestStores(testData);
  const cellFocus = vi.fn();

  stores.render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
      direction="across"
      id="1-across"
      isHighlighted
      num="1"
      onCellFocus={cellFocus}
      row={0}
      text="Clue text"
    />,
  );

  const clue = screen.getByRole('button');
  await userEvent.click(clue);

  expect(cellFocus).toHaveBeenCalledTimes(1);

  const selectedClue = stores.clues.getState().clues.find((c) => c.selected);
  expect(selectedClue).toBeDefined();
  expect(selectedClue?.id).toBe('1-across');

  const selectedCell = stores.cells.getState().cells.find((c) => c.selected);
  expect(selectedCell).toBeDefined();
  expect(selectedCell?.pos.col).toBe(0);
  expect(selectedCell?.pos.row).toBe(0);
});

test('it uses the latest props when clicked', async () => {
  const stores = createTestStores(testData);
  const firstOnCellFocus = vi.fn();
  const latestOnCellFocus = vi.fn();

  const { rerender } = stores.render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
      direction="across"
      id="1-across"
      isHighlighted={false}
      num="1"
      onCellFocus={firstOnCellFocus}
      row={0}
      text="Toy on a string (2-2)"
    />,
  );

  rerender(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
      direction="across"
      id="4-across"
      isHighlighted={false}
      num="4"
      onCellFocus={latestOnCellFocus}
      row={2}
      text="Have a rest (3,4)"
    />,
  );

  await userEvent.click(screen.getByRole('button'));

  expect(firstOnCellFocus).not.toHaveBeenCalled();
  expect(latestOnCellFocus).toHaveBeenCalledWith({
    pos: { col: 0, row: 2 },
    clueId: '4-across',
  });
  expect(stores.clues.getState().clues.find((c) => c.selected)?.id).toBe(
    '4-across',
  );
  expect(stores.cells.getState().cells.find((c) => c.selected)?.pos).toEqual({
    col: 0,
    row: 2,
  });
});

test('it is a button announcing its direction and state', () => {
  const { rerender } = createTestStores().render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
      direction="down"
      id="1-down"
      isHighlighted={false}
      num="1"
      row={0}
      text="Colour (6)"
    />,
  );

  const clue = screen.getByRole('button', { name: /1\s*down\s*Colour \(6\)/ });
  expect(clue.tagName).toBe('BUTTON');
  expect(clue).toHaveAttribute('type', 'button');
  expect(clue).toHaveAttribute('data-clue-id', '1-down');
  expect(clue).not.toHaveAttribute('aria-current');
  expect(clue).not.toHaveAccessibleName(/answered/);

  rerender(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered
      col={0}
      direction="down"
      id="1-down"
      isHighlighted
      num="1"
      row={0}
      text="Colour (6)"
    />,
  );

  expect(clue).toHaveAttribute('aria-current', 'true');
  expect(clue).toHaveAccessibleName(/\(answered\)$/);
});

test('it can be selected with the keyboard', async () => {
  const stores = createTestStores(testData);
  const cellFocus = vi.fn();

  stores.render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
      direction="down"
      id="1-down"
      isHighlighted={false}
      num="1"
      onCellFocus={cellFocus}
      row={0}
      text="Colour (6)"
    />,
  );

  await userEvent.tab();
  expect(screen.getByRole('button')).toHaveFocus();

  // Space as well as Enter now that it's a real button
  await userEvent.keyboard(' ');
  expect(cellFocus).toHaveBeenCalledWith({
    pos: { col: 0, row: 0 },
    clueId: '1-down',
  });
  expect(stores.clues.getState().clues.find((c) => c.selected)?.id).toBe(
    '1-down',
  );
});
