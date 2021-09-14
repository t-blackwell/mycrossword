import { isValidChar } from 'utils/general';

describe('isValidChar', () => {
  test('whitelist characters return true', () => {
    const whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    whitelist.split('').forEach((char) => {
      expect(isValidChar(char)).toBeTruthy();
    });
  });

  test('blacklist characters return false', () => {
    const blacklist = 'abcdefghijklmnopqrstuvwxyz!"£$%^&*(){}[]:@~;#,./<>?';

    blacklist.split('').forEach((char) => {
      expect(isValidChar(char)).toBeFalsy();
    });
  });

  test('empty string returns false', () => {
    expect(isValidChar('')).toBeFalsy();
  });

  test('more than one character returns false', () => {
    expect(isValidChar('AB')).toBeFalsy();
  });
});
