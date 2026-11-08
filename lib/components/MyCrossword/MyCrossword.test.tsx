import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import validData from '~/testData/test.valid.1';
import MyCrossword from './MyCrossword';

test('it renders', () => {
  const { container } = render(<MyCrossword data={validData} id="test" />);

  expect(container.firstChild).toHaveClass(
    'MyCrossword MyCrossword--blueTheme',
  );
});

test('it renders with different theme', () => {
  const { container } = render(
    <MyCrossword data={validData} id="test" theme="pink" />,
  );

  expect(container.firstChild).toHaveClass(
    'MyCrossword MyCrossword--pinkTheme',
  );
});

test('it shows the intro before the crossword', async () => {
  const { container } = render(
    <MyCrossword
      data={validData}
      id="test"
      intro={{ node: <p>Intro content</p>, continueLabel: 'Start' }}
    />,
  );

  screen.getByText('Intro content');
  expect(container.firstChild).toHaveClass('MyCrossword--showIntro');
  expect(screen.queryByText('Across')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Start' }));

  expect(screen.queryByText('Intro content')).not.toBeInTheDocument();
  expect(container.firstChild).not.toHaveClass('MyCrossword--showIntro');
  screen.getByText('Across');
});

test("crosswords on the same page don't share state", async () => {
  const user = userEvent.setup();

  render(
    <>
      <div data-testid="first">
        <MyCrossword data={validData} id="first" />
      </div>
      <div data-testid="second">
        <MyCrossword data={validData} id="second" />
      </div>
    </>,
  );

  const first = within(screen.getByTestId('first'));
  const second = within(screen.getByTestId('second'));
  const getGuesses = (testId: string) =>
    Array.from(
      screen.getByTestId(testId).querySelectorAll('.GridCell text'),
      (text) => text.textContent,
    ).join('');

  // select a clue and type a letter in the first crossword
  await user.click(first.getByText('Toy on a string (2-2)'));
  await user.keyboard('y');

  expect(first.getByRole('button', { name: /^1\s*across/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(getGuesses('first')).toContain('Y');

  // the second crossword is unaffected
  expect(
    screen.getByTestId('second').querySelector('[aria-current="true"]'),
  ).toBeNull();
  expect(getGuesses('second')).not.toContain('Y');

  // and selecting a clue in the second leaves the first's selection alone
  await user.click(second.getByText('Have a rest (3,4)'));

  expect(second.getByRole('button', { name: /^4\s*across/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(first.getByRole('button', { name: /^1\s*across/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(getGuesses('first')).toContain('Y');
});
