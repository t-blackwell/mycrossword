import { render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import data from '~/testData/test.valid.1';
import { initialiseStores } from '~/utils/test';
import { useCellsStore } from '~/stores/useCellsStore';
import { useCluesStore } from '~/stores/useCluesStore';
import Controls from './Controls';

function renderControls() {
  initialiseStores(data);

  render(
    <Controls
      cells={useCellsStore.getState().cells}
      clues={useCluesStore.getState().clues}
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
  await page.viewport(1200, 800);

  const getButtonText = renderControls();

  expect(getButtonText()).toBe('"Anagram helper"');
});

test('it renders with shorter button text', async () => {
  await page.viewport(500, 800);

  const getButtonText = renderControls();

  expect(getButtonText()).toBe('"Anag."');

  // the accessible name is unchanged
  screen.getByRole('button', { name: 'Anagram helper' });
});
