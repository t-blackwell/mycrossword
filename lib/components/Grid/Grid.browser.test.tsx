import { setViewport } from '~/utils/testBrowser';
import testData from '~/testData/test.valid.1';
import { createTestStores, TestStores } from '~/utils/test';
import Grid from './Grid';

function renderGrid(stores: TestStores, cellSize: number) {
  return (
    <div className="MyCrossword">
      <Grid
        cellMatcher={/[A-Z]/}
        cellSize={cellSize}
        cells={stores.cells.getState().cells}
        clues={stores.clues.getState().clues}
        cols={testData.dimensions.cols}
        rawClues={testData.entries}
        rows={testData.dimensions.rows}
        setGuessGrid={vi.fn()}
      />
    </div>
  );
}

function getSize(selector: string) {
  const element = document.querySelector(selector);

  if (element === null) {
    throw new Error(`${selector} not found`);
  }

  const { width, height } = element.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
}

// the hidden input should always cover the selected cell, including when the
// grid is scaled to fit small screens
async function expectInputToCoverSelectedCell() {
  await expect
    .poll(() => getSize('.Grid__inputContainer'))
    .toEqual(getSize('.GridCell--selected .GridCell__rect'));
}

test.each([
  { screen: 'small', width: 400 },
  { screen: 'large', width: 1200 },
])(
  'the input covers the selected cell when the cell size changes ($screen screen)',
  async ({ width }) => {
    await setViewport(width, 800);

    const stores = createTestStores(testData);
    stores.cells.getState().select({ col: 0, row: 0 });
    stores.clues.getState().select('1-across');

    const { rerender } = stores.render(renderGrid(stores, 31));
    await expectInputToCoverSelectedCell();

    rerender(renderGrid(stores, 50));
    await expectInputToCoverSelectedCell();
  },
);
