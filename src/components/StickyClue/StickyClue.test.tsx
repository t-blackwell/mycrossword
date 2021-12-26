// eslint-disable-next-line @typescript-eslint/no-redeclare
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import StickyClue from './StickyClue';

test('it renders', () => {
  render(
    <StickyClue
      num="num"
      onMoveNext={jest.fn}
      onMovePrev={jest.fn}
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
  render(<StickyClue onMoveNext={jest.fn} onMovePrev={jest.fn} />);
  const buttons = screen.queryAllByRole('button');
  expect(buttons.length).toBe(0);
});

test('it calls onMoveNext', () => {
  const onMove = jest.fn();
  render(
    <StickyClue
      num="num"
      onMoveNext={onMove}
      onMovePrev={jest.fn}
      text="text"
    />,
  );
  const button = screen.getByRole('button', { name: /next clue/i });
  userEvent.click(button);
  expect(onMove).toHaveBeenCalledTimes(1);
});

test('it calls onMovePrev', () => {
  const onMove = jest.fn();
  render(
    <StickyClue
      num="num"
      onMoveNext={jest.fn}
      onMovePrev={onMove}
      text="text"
    />,
  );
  const button = screen.getByRole('button', { name: /previous clue/i });
  userEvent.click(button);
  expect(onMove).toHaveBeenCalledTimes(1);
});
