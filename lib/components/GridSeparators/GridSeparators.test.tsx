import { render } from '@testing-library/react';
import data from '~/testData/test.valid.1';
import barredData from '~/testData/test.barred.1';
import GridSeparators from './GridSeparators';
import { DEFAULT_CELL_SIZE } from '~/utils/general';

interface RectProps {
  width: string;
  height: string;
  x: string;
  y: string;
}

test('it renders', () => {
  const expectedRects: RectProps[] = [
    { width: '7.75', height: '1', x: '60.625', y: '17' },
    { width: '1', height: '31', x: '95', y: '65' },
    { width: '31', height: '1', x: '97', y: '127' },
  ];

  const { container } = render(
    <GridSeparators cellSize={DEFAULT_CELL_SIZE} clues={data.entries} />,
  );

  const rects = container.querySelectorAll('rect');
  expect(rects.length).toBe(3);

  rects.forEach((rect, i) => {
    expect(rect.getAttribute('width')).toBe(expectedRects[i].width);
    expect(rect.getAttribute('height')).toBe(expectedRects[i].height);
    expect(rect.getAttribute('x')).toBe(expectedRects[i].x);
    expect(rect.getAttribute('y')).toBe(expectedRects[i].y);
  });
});

test('it renders bars in a barred grid', () => {
  const { container } = render(
    <GridSeparators cellSize={DEFAULT_CELL_SIZE} clues={barredData.entries} />,
  );

  const rects = container.querySelectorAll('rect');
  expect(rects.length).toBe(8);

  // the first bar is between the cells at (1, 0) and (1, 1): three units
  // thick over the grid line, overhanging the cell's edge by two at each end
  expect(rects[0].getAttribute('width')).toBe('35');
  expect(rects[0].getAttribute('height')).toBe('3');
  expect(rects[0].getAttribute('x')).toBe('31');
  expect(rects[0].getAttribute('y')).toBe('31');

  // the next is between the cells at (2, 1) and (3, 1)
  expect(rects[1].getAttribute('width')).toBe('3');
  expect(rects[1].getAttribute('height')).toBe('35');
  expect(rects[1].getAttribute('x')).toBe('95');
  expect(rects[1].getAttribute('y')).toBe('31');
});
