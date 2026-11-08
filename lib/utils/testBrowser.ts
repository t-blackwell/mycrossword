import { act } from '@testing-library/react';
import { page } from 'vitest/browser';

/**
 * Resize the browser viewport, waiting for the resulting `resize` event to be
 * handled inside `act` so components listening for it (e.g. via
 * useBreakpoint) have finished updating.
 *
 * `page.viewport` can resolve before the `resize` event fires, so awaiting it
 * alone leaves those updates to happen later, outside `act`.
 */
export async function setViewport(width: number, height: number) {
  await act(async () => {
    const resized =
      window.innerWidth === width && window.innerHeight === height
        ? Promise.resolve()
        : new Promise((resolve) => {
            window.addEventListener('resize', resolve, { once: true });
          });

    await page.viewport(width, height);
    await resized;
  });
}
