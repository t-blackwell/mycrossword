import { screen } from '@testing-library/react';
import { setViewport } from '~/utils/testBrowser';
import data from '~/testData/test.valid.1';
import { createTestStores } from '~/utils/test';
import Controls from './Controls';

function renderControls() {
  const stores = createTestStores(data);

  stores.render(
    <Controls
      cells={stores.cells.getState().cells}
      clues={stores.clues.getState().clues}
      gridCols={data.dimensions.cols}
      gridRows={data.dimensions.rows}
      onAnagramHelperClick={vi.fn()}
      setGuessGrid={vi.fn()}
      solutionsAvailable={false}
    />,
  );

  const button = screen.getByRole('button', { name: 'Anagram helper' });
  const label = button.querySelector('span');

  if (label === null) {
    throw new Error('Anagram helper button label not found');
  }

  // the visible text is set with CSS (::after) depending on the screen size
  return () => window.getComputedStyle(label, '::after').content;
}

test('it renders with full button text', async () => {
  await setViewport(1200, 800);

  const getButtonText = renderControls();

  expect(getButtonText()).toBe('"Anagram helper"');
});

test('it renders with shorter button text', async () => {
  await setViewport(500, 800);

  const getButtonText = renderControls();

  expect(getButtonText()).toBe('"Anag."');

  // the accessible name is unchanged
  screen.getByRole('button', { name: 'Anagram helper' });
});
