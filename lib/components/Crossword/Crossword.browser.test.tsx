import { render } from '@testing-library/react';
import { page } from 'vitest/browser';
import validData from '~/testData/test.valid.1';
import MyCrossword from '~/components/MyCrossword/MyCrossword';

function isStickyClueVisible() {
  const stickyClue = document.querySelector('.StickyClue');

  return (
    stickyClue !== null &&
    window.getComputedStyle(stickyClue).display !== 'none'
  );
}

test('it conditionally shows sticky clue', async () => {
  // show on xs viewport
  await page.viewport(500, 800);

  render(<MyCrossword data={validData} id="test" stickyClue="auto" />);

  expect(isStickyClueVisible()).toBe(true);

  // show on sm viewport
  await page.viewport(700, 800);
  expect(isStickyClueVisible()).toBe(true);

  // don't show on lg viewport
  await page.viewport(1100, 800);
  expect(isStickyClueVisible()).toBe(false);
});

test('it always shows sticky clue', async () => {
  await page.viewport(1100, 800);

  render(<MyCrossword data={validData} id="test" stickyClue="always" />);

  expect(isStickyClueVisible()).toBe(true);
});
