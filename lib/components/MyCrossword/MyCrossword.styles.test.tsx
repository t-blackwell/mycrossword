import { render } from '@testing-library/react';
import * as React from 'react';
import validData from '~/testData/test.valid.1';
import MyCrossword from './MyCrossword';

vi.mock('virtual:mycrossword/styles', () => ({
  default: '.MyCrossword { color: red; }',
}));

afterEach(() => {
  document.head.innerHTML = '';
});

/**
 * Detaches the document's <html> element during the commit, as React does
 * when it re-renders the whole document (e.g. after a hydration error).
 */
function DetachedDocument() {
  const html = React.useRef(document.documentElement);

  React.useInsertionEffect(() => {
    document.removeChild(html.current);
  }, []);

  React.useLayoutEffect(() => {
    document.appendChild(html.current);
  }, []);

  return null;
}

test('it injects the styles when the document has no head during commit', () => {
  const container = document.createElement('div');

  expect(() =>
    render(
      <>
        <DetachedDocument />
        <MyCrossword data={validData} id="test" />
      </>,
      { container },
    ),
  ).not.toThrow();

  expect(document.head.querySelectorAll('style[data-mycrossword]').length).toBe(
    1,
  );
});
