import {
  decodeHtmlEntities,
  isValidChar,
  sanitizeHtml,
  stripHtml,
} from '../utils/general';

describe('isValidChar', () => {
  test('whitelist characters return true', () => {
    const whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    whitelist.split('').forEach((char) => {
      expect(isValidChar(char, /[A-Z]/)).toBeTruthy();
    });
  });

  test('blacklist characters return false', () => {
    const blacklist =
      'abcdefghijklmnopqrstuvwxyz0123456789!"£$%^&*(){}[]:@~;#,./<>?';

    blacklist.split('').forEach((char) => {
      expect(isValidChar(char, /[A-Z]/)).toBeFalsy();
    });
  });

  test('empty string returns false', () => {
    expect(isValidChar('', /[A-Z]/)).toBeFalsy();
  });

  test('more than one character returns false', () => {
    expect(isValidChar('AB', /[A-Z]/)).toBeFalsy();
  });
});

describe('sanitizeHtml', () => {
  const allowedTags = ['strong', 'b', 'em', 'i', 'u', 'sub', 'sup'];

  test('only keep allowed tags', () => {
    const dirtyHtml = `
      <p>p tag disallowed</p>
      <span>span tag disallowed</span>
      <div>div tag disallowed</div>
      <strong>strong tag allowed</strong>
      <b>b tag allowed</b>
      <em>em tag allowed</em>
      <i>i tag allowed</i>
      <u>u tag allowed</u>
      <sub>sub tag allowed</sub>
      <sup>sup tag allowed</sup>
    `;

    const expectedCleanHtml = `
      p tag disallowed
      span tag disallowed
      div tag disallowed
      <strong>strong tag allowed</strong>
      <b>b tag allowed</b>
      <em>em tag allowed</em>
      <i>i tag allowed</i>
      <u>u tag allowed</u>
      <sub>sub tag allowed</sub>
      <sup>sup tag allowed</sup>
    `;

    expect(sanitizeHtml(dirtyHtml, allowedTags)).toBe(expectedCleanHtml);
  });
});

describe('stripHtml', () => {
  test('all markup removed', () => {
    const dirtyHtml = `
      <p>p tag disallowed</p>
      <span>span tag disallowed</span>
      <div>div tag disallowed</div>
      <strong>strong tag disallowed</strong>
      <b>b tag disallowed</b>
      <em>em tag disallowed</em>
      <i>i tag disallowed</i>
      <u>u tag disallowed</u>
      <sub>sub tag disallowed</sub>
      <sup>sup tag disallowed</sup>
    `;

    const expectedCleanHtml = `
      p tag disallowed
      span tag disallowed
      div tag disallowed
      strong tag disallowed
      b tag disallowed
      em tag disallowed
      i tag disallowed
      u tag disallowed
      sub tag disallowed
      sup tag disallowed
    `;

    expect(stripHtml(dirtyHtml)).toBe(expectedCleanHtml);
  });
});

describe('decodeHtmlEntities', () => {
  test('all html entities decoded', () => {
    expect(decodeHtmlEntities('two &amp; three &gt; &radic;sixteen')).toBe(
      'two & three > √sixteen',
    );
  });
});
