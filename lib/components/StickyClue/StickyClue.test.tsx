// eslint-disable-next-line @typescript-eslint/no-redeclare
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DEFAULT_HTML_TAGS } from '~/utils/general';
import StickyClue from './StickyClue';

test('it renders', () => {
  render(
    <StickyClue
      allowedTags={DEFAULT_HTML_TAGS}
      num="num"
      onMoveNext={jest.fn}
      onMovePrev={jest.fn}
      show="always"
      text="one & <strong>two</strong>"
    />,
  );
  screen.getByText('num');
  screen.getByText(/one &/i);
  const two = screen.getByText('two');
  expect(two.tagName).toBe('STRONG');

  const buttons = screen.getAllByRole('button');
  expect(buttons.length).toBe(2);
});

test('it renders empty', () => {
  render(
    <StickyClue
      allowedTags={DEFAULT_HTML_TAGS}
      onMoveNext={jest.fn}
      onMovePrev={jest.fn}
      show="always"
    />,
  );
  const buttons = screen.queryAllByRole('button');
  expect(buttons.length).toBe(0);
});

test('it calls onMoveNext', async () => {
  const onMove = jest.fn();
  render(
    <StickyClue
      allowedTags={DEFAULT_HTML_TAGS}
      num="num"
      onMoveNext={onMove}
      onMovePrev={jest.fn}
      show="always"
      text="text"
    />,
  );
  const button = screen.getByRole('button', { name: /next clue/i });
  expect(button).toBeVisible();
  await userEvent.click(button);
  expect(onMove).toHaveBeenCalledTimes(1);
});

test('it calls onMovePrev', async () => {
  const onMove = jest.fn();
  render(
    <StickyClue
      allowedTags={DEFAULT_HTML_TAGS}
      num="num"
      onMoveNext={jest.fn}
      onMovePrev={onMove}
      show="always"
      text="text"
    />,
  );
  const button = screen.getByRole('button', { name: /previous clue/i });
  await userEvent.click(button);
  expect(onMove).toHaveBeenCalledTimes(1);
});
