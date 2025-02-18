import { render } from '@testing-library/react';
import data from '~/testData/test.valid.1';
import GridSeparators from './GridSeparators';

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

  const { container } = render(<GridSeparators clues={data.entries} />);

  const rects = container.querySelectorAll('rect');
  expect(rects.length).toBe(3);

  rects.forEach((rect, i) => {
    expect(rect.getAttribute('width')).toBe(expectedRects[i].width);
    expect(rect.getAttribute('height')).toBe(expectedRects[i].height);
    expect(rect.getAttribute('x')).toBe(expectedRects[i].x);
    expect(rect.getAttribute('y')).toBe(expectedRects[i].y);
  });
});
