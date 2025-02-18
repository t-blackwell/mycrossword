import { render, screen } from '@testing-library/react';
import GridError from './GridError';

test('it renders', () => {
  const message = 'test error message';
  render(<GridError message={message} />);

  screen.getByText('Something went wrong');
  screen.getByText(message);
});
