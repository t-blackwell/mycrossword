import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { restoreConsoleMessage, suppressConsoleMessage } from '~/utils/test';
import Confirm, { DEFAULT_TIMEOUT } from './Confirm';

test('it renders', async () => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();

  render(
    <Confirm buttonText="Confirm" onCancel={onCancel} onConfirm={onConfirm} />,
  );

  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  const confirmButton = screen.getByRole('button', { name: 'Confirm' });
  screen.getByText(`This will automatically cancel in ${DEFAULT_TIMEOUT}`);

  await userEvent.click(cancelButton);
  expect(onCancel).toHaveBeenCalledTimes(1);

  await userEvent.click(confirmButton);
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test('it renders with timeout override', () => {
  render(
    <Confirm
      buttonText="Confirm"
      onCancel={vi.fn()}
      onConfirm={vi.fn()}
      timeout={3}
    />,
  );

  screen.getByText('This will automatically cancel in 3');
});

test('it automatically cancels after timeout', () => {
  vi.useFakeTimers();

  const onCancel = vi.fn();

  render(
    <Confirm buttonText="Confirm" onCancel={onCancel} onConfirm={vi.fn()} />,
  );

  expect(onCancel).toHaveBeenCalledTimes(0);

  for (let i = DEFAULT_TIMEOUT; i > 0; i -= 1) {
    screen.getByText(`This will automatically cancel in ${i}`);
    act(() => {
      vi.runOnlyPendingTimers();
    });
  }

  expect(onCancel).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});

test('it should throw error with invalid timeout', () => {
  suppressConsoleMessage('error');

  expect(() =>
    render(
      <Confirm
        buttonText="Confirm"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        timeout={0}
      />,
    ),
  ).toThrow();

  expect(() =>
    render(
      <Confirm
        buttonText="Confirm"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        timeout={-1}
      />,
    ),
  ).toThrow();

  restoreConsoleMessage('error');
});
