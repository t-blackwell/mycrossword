import { render, screen } from '@testing-library/react';
import * as React from 'react';
import StickyClue from './StickyClue';

test('it renders', () => {
  render(<StickyClue num="num" text="text" />);
  screen.getByText('num');
  screen.getByText('text');
});
