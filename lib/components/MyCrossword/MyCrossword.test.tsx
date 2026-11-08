import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import validData from '~/testData/test.valid.1';
import { initialiseGuessGrid } from '~/utils/guess';
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

test('it hydrates server HTML and then restores saved progress', async () => {
  const savedGrid = initialiseGuessGrid(
    validData.dimensions.cols,
    validData.dimensions.rows,
  );
  // 1 across
  savedGrid.value[0][0] = 'Y';
  savedGrid.value[1][0] = 'O';
  savedGrid.value[2][0] = 'Y';
  savedGrid.value[3][0] = 'O';

  const ui = <MyCrossword data={validData} id="hydrate-test" />;

  // the server has no access to saved progress
  const container = document.createElement('div');
  container.innerHTML = renderToString(ui);
  document.body.appendChild(container);

  const getGuesses = () =>
    Array.from(
      container.querySelectorAll('.GridCell__text'),
      (text) => text.textContent,
    ).join('');

  expect(container.querySelectorAll('.GridCell')).toHaveLength(23);
  expect(getGuesses()).toBe('');

  localStorage.setItem('crosswords.hydrate-test', JSON.stringify(savedGrid));

  const consoleError = vi.spyOn(console, 'error');
  const onRecoverableError = vi.fn();

  try {
    const root = await act(async () =>
      hydrateRoot(container, ui, { onRecoverableError }),
    );

    // the browser's first render matched the server HTML
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    // and the saved letters were restored after hydrating
    expect(getGuesses()).toBe('YOYO');
    expect(
      within(container).getByRole('button', { name: /^1\s*across/ }),
    ).toHaveClass('Clue--answered');

    // without overwriting what was saved
    expect(
      JSON.parse(localStorage.getItem('crosswords.hydrate-test') ?? ''),
    ).toEqual(savedGrid);

    act(() => root.unmount());
  } finally {
    consoleError.mockRestore();
    container.remove();
  }
});
