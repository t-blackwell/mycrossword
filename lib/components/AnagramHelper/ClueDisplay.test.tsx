import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_HTML_TAGS } from '../../utils/general';
import ClueDisplay from './ClueDisplay';

const clueText = "one two!three-four,five'six&seven/<em>eight</em>.";

test('it renders', () => {
  render(
    <ClueDisplay
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      clue={clueText}
      onClick={jest.fn}
    />,
  );

  screen.getByText(/one two!three-four,five'six&seven/i);
  const eight = screen.getByText('eight');
  expect(eight.tagName).toBe('EM');
});

test('it renders with split words', () => {
  const onClick = jest.fn();
  render(
    <ClueDisplay
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      clue={clueText}
      onClick={onClick}
      splitWords
    />,
  );

  expect(screen.queryByText(clueText)).not.toBeInTheDocument();

  ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'].forEach(
    async (word, i) => {
      const button = screen.getByRole('button', { name: word });
      await userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(i + 1);
    },
  );
});
