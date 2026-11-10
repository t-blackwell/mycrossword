import { injectStyles } from './styles';

vi.mock('virtual:mycrossword/styles', () => ({
  default: '.MyCrossword { color: red; }',
}));

afterEach(() => {
  document.head.innerHTML = '';
});

test('it injects the stylesheet once, before existing styles', () => {
  const existingStyle = document.createElement('style');
  document.head.appendChild(existingStyle);

  injectStyles();
  injectStyles();

  const styles = document.head.querySelectorAll('style[data-mycrossword]');
  expect(styles.length).toBe(1);
  expect(styles[0].textContent).toBe('.MyCrossword { color: red; }');
  expect(document.head.firstChild).toBe(styles[0]);
});

test('it does nothing without a document (e.g. server rendering)', () => {
  expect(() => injectStyles(undefined)).not.toThrow();
});

test('it waits for the document to have a head', () => {
  // e.g. while React re-renders the whole document after a hydration error
  const html = document.documentElement;
  document.removeChild(html);

  try {
    expect(document.head).toBeNull();
    expect(injectStyles()).toBe(false);
  } finally {
    document.appendChild(html);
  }

  expect(injectStyles()).toBe(true);
  expect(document.head.querySelectorAll('style[data-mycrossword]').length).toBe(
    1,
  );
});
