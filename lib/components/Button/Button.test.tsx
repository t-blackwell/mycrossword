import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

test('it renders', async () => {
  const onClick = jest.fn();

  render(<Button onClick={onClick}>test</Button>);

  const button = screen.getByRole('button', { name: 'test' });
  expect(button).toHaveClass('Button--filled');

  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('it renders outlined', () => {
  render(
    <Button onClick={jest.fn} variant="outlined">
      test
    </Button>,
  );

  const button = screen.getByRole('button', { name: 'test' });
  expect(button).toHaveClass('Button--outlined');
});

test('it renders disabled', async () => {
  const onClick = jest.fn();

  render(
    <Button disabled onClick={onClick}>
      test
    </Button>,
  );

  const button = screen.getByRole('button', { name: 'test' });
  expect(button).toBeDisabled();

  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(0);
});

test('it renders with aria label', () => {
  render(
    <Button ariaLabel="close" onClick={jest.fn} variant="outlined">
      X
    </Button>,
  );

  screen.getByRole('button', { name: 'close' });
});
