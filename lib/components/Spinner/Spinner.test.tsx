import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

test('it renders small', () => {
  render(<Spinner size="small" />);
  const spinner = screen.getByRole('status');
  expect(spinner).toHaveClass('Spinner--small');
});

test('it renders standard', () => {
  render(<Spinner size="standard" />);
  const spinner = screen.getByRole('status');
  expect(spinner).toHaveClass('Spinner--standard');
});

test('it renders large', () => {
  render(<Spinner size="large" />);
  const spinner = screen.getByRole('status');
  expect(spinner).toHaveClass('Spinner--large');
});
