import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import ClueDisplay from './ClueDisplay';

const clueText = "one two!three-four,five'six&seven/<em>eight</em>.";

test('it renders', () => {
  render(<ClueDisplay clue={clueText} onClick={jest.fn} />);

  screen.getByText(/one two!three-four,five'six&seven/i);
  const eight = screen.getByText('eight');
  expect(eight.tagName).toBe('EM');
});

test('it renders with split words', () => {
  const onClick = jest.fn();
  render(<ClueDisplay clue={clueText} onClick={onClick} splitWords />);

  expect(screen.queryByText(clueText)).not.toBeInTheDocument();

  ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'].forEach(
    (word, i) => {
      const button = screen.getByRole('button', { name: word });
      userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(i + 1);
    },
  );
});
