// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// selecting a clue updates the URL hash and progress is autosaved to local
// storage, so reset both to keep tests isolated
afterEach(() => {
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search,
  );
  localStorage.clear();
});
