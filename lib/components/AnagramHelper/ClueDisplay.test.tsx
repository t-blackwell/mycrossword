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
      onClick={vi.fn()}
    />,
  );

  screen.getByText(/one two!three-four,five'six&seven/i);
  const eight = screen.getByText('eight');
  expect(eight.tagName).toBe('EM');
});

test('it renders with split words', async () => {
  const onClick = vi.fn();
  render(
    <ClueDisplay
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      clue={clueText}
      onClick={onClick}
      splitWords
    />,
  );

  expect(screen.queryByText(clueText)).not.toBeInTheDocument();

  const words = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
  ];

  for (const [i, word] of words.entries()) {
    const button = screen.getByRole('button', { name: word });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(i + 1);
    expect(onClick).toHaveBeenLastCalledWith(word);
  }
});
