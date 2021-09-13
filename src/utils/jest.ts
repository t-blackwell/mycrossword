export function suppressConsoleError() {
  jest.spyOn(console, 'error').mockImplementation(() => jest.fn());
}

export function restoreConsoleError() {
  jest.spyOn(console, 'error').mockRestore();
}
