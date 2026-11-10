import css from 'virtual:mycrossword/styles';

const STYLE_ELEMENT_ATTRIBUTE = 'data-mycrossword';

/**
 * Adds the library's stylesheet to the document (once) so consumers don't
 * need to import `mycrossword/style.css` themselves.
 *
 * `css` is the compiled stylesheet in the built library, but is empty during
 * development and testing where Vite handles the components' CSS imports.
 *
 * Returns whether the stylesheet is (now) in the document. It can't be added
 * while the document has no `<head>`, e.g. while React re-renders the whole
 * document after a hydration error, when it detaches the old `<html>` element
 * until the new one is inserted.
 */
export function injectStyles(
  doc: Document | undefined = globalThis.document,
): boolean {
  if (css === '' || doc === undefined) {
    return true;
  }

  if (doc.querySelector(`style[${STYLE_ELEMENT_ATTRIBUTE}]`) !== null) {
    return true;
  }

  const head = doc.head as HTMLHeadElement | null;

  if (head === null) {
    return false;
  }

  const style = doc.createElement('style');
  style.setAttribute(STYLE_ELEMENT_ATTRIBUTE, '');
  style.textContent = css;

  // insert before any other styles so they can override the defaults
  head.insertBefore(style, head.firstChild);

  return true;
}
