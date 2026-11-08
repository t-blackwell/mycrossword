import { render } from '@testing-library/react';
import { setViewport } from '~/utils/testBrowser';
import testData from '~/testData/test.valid.1';
import { useCellsStore } from '~/stores/useCellsStore';
import { useCluesStore } from '~/stores/useCluesStore';
import { initialiseGuessGrid } from '~/utils/guess';
import { initialiseStores } from '~/utils/test';
import Grid from './Grid';

function renderGrid(cellSize: number) {
  return (
    <div className="MyCrossword">
      <Grid
        cellMatcher={/[A-Z]/}
        cellSize={cellSize}
        cells={useCellsStore.getState().cells}
        clues={useCluesStore.getState().clues}
        cols={testData.dimensions.cols}
        guessGrid={initialiseGuessGrid(
          testData.dimensions.cols,
          testData.dimensions.rows,
        )}
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

    initialiseStores(testData);
    useCellsStore.getState().select({ col: 0, row: 0 });
    useCluesStore.getState().select('1-across');

    const { rerender } = render(renderGrid(31));
    await expectInputToCoverSelectedCell();

    rerender(renderGrid(50));
    await expectInputToCoverSelectedCell();
  },
);
