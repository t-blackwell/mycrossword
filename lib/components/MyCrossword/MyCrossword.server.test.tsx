// @vitest-environment node
import { renderToString } from 'react-dom/server';
import validData from '~/testData/test.valid.1';
import { initialiseGuessGrid } from '~/utils/guess';
import MyCrossword from './MyCrossword';

test('the server HTML includes the whole puzzle', () => {
  expect(typeof window).toBe('undefined');

  const html = renderToString(<MyCrossword data={validData} id="test" />);

  // the cells and their numbers
  expect(html.match(/class="GridCell[ "]/g)).toHaveLength(23);
  expect(html).toMatch(/<text class="GridCell__num"[^>]*>1<\/text>/);

  // the clues
  expect(html).toContain('Toy on a string (2-2)');
  expect(html).toContain('Bits and bobs (4,3,4)');
});

test('the server HTML includes the letters from loadGrid', () => {
  const loadGrid = initialiseGuessGrid(
    validData.dimensions.cols,
    validData.dimensions.rows,
  );
  loadGrid.value[0][0] = 'Y';

  const html = renderToString(
    <MyCrossword data={validData} id="test" loadGrid={loadGrid} />,
  );

  expect(html).toMatch(/<text class="GridCell__text"[^>]*>Y<\/text>/);
});

test('the server HTML shows data errors', () => {
  const invalidData = {
    ...validData,
    entries: [{ ...validData.entries[0], solution: 'YO' }],
  };

  const html = renderToString(<MyCrossword data={invalidData} id="test" />);

  expect(html).toContain('Crossword data error: solution length mismatch');
});
