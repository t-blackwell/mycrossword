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

test('it restarts the countdown when the countdown changes', () => {
  vi.useFakeTimers();

  const { rerender } = render(
    <Intro node="Intro" countdown={{ seconds: 3 }} onContinue={vi.fn()} />,
  );

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  screen.getByRole('button', { name: 'Skip in 1' });

  rerender(
    <Intro node="Intro" countdown={{ seconds: 5 }} onContinue={vi.fn()} />,
  );

  // the new countdown starts from its own value, with only its timer running
  expect(screen.getByRole('button', { name: 'Skip in 5' })).toBeDisabled();
  expect(vi.getTimerCount()).toBe(1);

  // the previous countdown would have finished by now
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(screen.getByRole('button', { name: 'Skip in 4' })).toBeDisabled();

  act(() => {
    vi.advanceTimersByTime(4000);
  });
  expect(
    screen.getByRole('button', { name: 'Continue to crossword' }),
  ).toBeEnabled();
  expect(vi.getTimerCount()).toBe(0);
});

test('it restarts the countdown when the intro content changes', () => {
  vi.useFakeTimers();
  const countdown = { seconds: 3 };

  const { rerender } = render(
    <Intro node="First" countdown={countdown} onContinue={vi.fn()} />,
  );

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  screen.getByRole('button', { name: 'Skip in 1' });

  rerender(<Intro node="Second" countdown={countdown} onContinue={vi.fn()} />);

  screen.getByText('Second');
  expect(screen.getByRole('button', { name: 'Skip in 3' })).toBeDisabled();
  expect(vi.getTimerCount()).toBe(1);
});

test('it can continue straight away when the countdown is removed', () => {
  vi.useFakeTimers();
  const onContinue = vi.fn();

  const { rerender } = render(
    <Intro node="Intro" countdown={{ seconds: 3 }} onContinue={onContinue} />,
  );
  expect(vi.getTimerCount()).toBe(1);

  rerender(<Intro node="Intro" onContinue={onContinue} />);

  const button = screen.getByRole('button', { name: 'Continue to crossword' });
  expect(button).toBeEnabled();
  expect(vi.getTimerCount()).toBe(0);

  fireEvent.click(button);
  expect(onContinue).toHaveBeenCalledTimes(1);
});
