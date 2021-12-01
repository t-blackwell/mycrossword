// eslint-disable-next-line @typescript-eslint/no-redeclare
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import StickyClue from './StickyClue';

test('it renders', () => {
  render(<StickyClue num="num" text="one & <strong>two</strong>" />);
  screen.getByText('num');
  screen.getByText(/one &/i);
  const two = screen.getByText('two');
  expect(two.tagName).toBe('STRONG');
});
