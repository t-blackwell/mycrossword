import * as React from 'react';
import invalidData1 from 'testData/test.invalid.1';
import validData from 'testData/test.valid.1';
import { restoreConsoleError, suppressConsoleError } from 'utils/jest';
import { render, screen } from 'utils/rtl';
import MyCrossword from './MyCrossword';

test('it renders', () => {
  const { container } = render(<MyCrossword data={validData} id="test" />);

  expect(container.firstChild).toHaveClass(
    'MyCrossword MyCrossword--yellowTheme',
  );

  screen.getByText('Across');
  screen.getByText('Down');

  // 1-across, 1-down and superscript 1 in the grid
  expect(screen.getAllByText('1').length).toBe(3);
  expect(screen.getAllByText('2').length).toBe(2);
  expect(screen.getAllByText('3').length).toBe(2);
  expect(screen.getAllByText('4').length).toBe(2);

  screen.getByText('Toy on a string (2-2)');
  screen.getByText('Have a rest (3,4)');
  screen.getByText('Colour (6)');
  screen.getByText('Bits and bobs (4,3,4)');
  screen.getByText('See 2');
});

test('it renders with different theme', () => {
  const { container } = render(
    <MyCrossword data={validData} id="test" theme="pink" />,
  );

  expect(container.firstChild).toHaveClass(
    'MyCrossword MyCrossword--pinkTheme',
  );

  screen.getByText('Across');
  screen.getByText('Down');

  // 1-across, 1-down and superscript 1 in the grid
  expect(screen.getAllByText('1').length).toBe(3);
  expect(screen.getAllByText('2').length).toBe(2);
  expect(screen.getAllByText('3').length).toBe(2);
  expect(screen.getAllByText('4').length).toBe(2);

  screen.getByText('Toy on a string (2-2)');
  screen.getByText('Have a rest (3,4)');
  screen.getByText('Colour (6)');
  screen.getByText('Bits and bobs (4,3,4)');
  screen.getByText('See 2');
});

test('it throws with invalid data', () => {
  suppressConsoleError();
  expect(() => render(<MyCrossword data={invalidData1} id="test" />)).toThrow();
  restoreConsoleError();
});
