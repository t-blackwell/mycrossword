import userEvent from '@testing-library/user-event';
import { DEFAULT_HTML_TAGS } from '~/utils/general';
import testData from '~/testData/test.valid.1';
import { initialiseStores } from '~/utils/test';
import Clue from './Clue';
import { render, screen } from '@testing-library/react';
import { useCluesStore } from '~/stores/useCluesStore';
import { useCellsStore } from '~/stores/useCellsStore';

test('it renders', () => {
  render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
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
  render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered
      col={0}
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
  render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
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
  initialiseStores(testData);
  const cellFocus = jest.fn();

  render(
    <Clue
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      answered={false}
      col={0}
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

  const selectedClue = useCluesStore.getState().clues.find((c) => c.selected);
  expect(selectedClue).toBeDefined();
  expect(selectedClue?.id).toBe('1-across');

  const selectedCell = useCellsStore.getState().cells.find((c) => c.selected);
  expect(selectedCell).toBeDefined();
  expect(selectedCell?.pos.col).toBe(0);
  expect(selectedCell?.pos.row).toBe(0);
});
