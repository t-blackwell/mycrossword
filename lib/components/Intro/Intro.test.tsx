import { act, fireEvent, render, screen } from '@testing-library/react';
import Intro from './Intro';

afterEach(() => {
  vi.useRealTimers();
});

test('it renders the intro content', () => {
  render(<Intro node={<p>Sponsored by Example</p>} onContinue={vi.fn()} />);

  screen.getByText('Sponsored by Example');
});

test('it can continue straight away without a countdown', () => {
  const onContinue = vi.fn();
  render(<Intro node="Intro" onContinue={onContinue} />);

  const button = screen.getByRole('button', { name: 'Continue to crossword' });
  expect(button).toBeEnabled();

  fireEvent.click(button);
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test('it counts down before allowing the user to continue', () => {
  vi.useFakeTimers();
  const onContinue = vi.fn();

  render(
    <Intro node="Intro" countdown={{ seconds: 3 }} onContinue={onContinue} />,
  );

  const button = screen.getByRole('button', { name: 'Skip in 3' });
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent('Skip in3');

  // clicking while counting down does nothing
  fireEvent.click(button);
  expect(onContinue).not.toHaveBeenCalled();

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  screen.getByRole('button', { name: 'Skip in 2' });

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  screen.getByRole('button', { name: 'Skip in 1' });

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  const continueButton = screen.getByRole('button', {
    name: 'Continue to crossword',
  });
  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test('it uses custom labels', () => {
  vi.useFakeTimers();

  render(
    <Intro
      continueLabel="Start puzzle"
      countdown={{ seconds: 1, label: 'Wait' }}
      node="Intro"
      onContinue={vi.fn()}
    />,
  );

  screen.getByRole('button', { name: 'Wait 1' });

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  screen.getByRole('button', { name: 'Start puzzle' });
});

test('it stops the countdown when unmounted', () => {
  vi.useFakeTimers();

  const { unmount } = render(
    <Intro node="Intro" countdown={{ seconds: 5 }} onContinue={vi.fn()} />,
  );
  expect(vi.getTimerCount()).toBe(1);

  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
