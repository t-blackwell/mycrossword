import sanitize from 'sanitize-html';

export function isValidChar(char: string) {
  if (char.length !== 1) {
    return false;
  }

  const whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return whitelist.includes(char);
}

export function isInViewport(rect: DOMRect) {
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  );
}

export function stripHtml(dirtyHtml: string) {
  return sanitize(dirtyHtml, {
    allowedAttributes: {},
    allowedTags: [],
  });
}

export function santizeHtml(dirtyHtml: string) {
  return sanitize(dirtyHtml, {
    allowedAttributes: {},
    allowedTags: ['b', 'strong', 'i', 'em', 'u', 'sub', 'sup'],
  });
}
