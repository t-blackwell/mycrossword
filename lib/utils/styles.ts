import css from 'virtual:mycrossword/styles';

const STYLE_ELEMENT_ATTRIBUTE = 'data-mycrossword';

/**
 * Adds the library's stylesheet to the document (once) so consumers don't
 * need to import `mycrossword/style.css` themselves.
 *
 * `css` is the compiled stylesheet in the built library, but is empty during
 * development and testing where Vite handles the components' CSS imports.
 */
export function injectStyles(doc: Document | undefined = globalThis.document) {
  if (
    css === '' ||
    doc === undefined ||
    doc.head.querySelector(`style[${STYLE_ELEMENT_ATTRIBUTE}]`) !== null
  ) {
    return;
  }

  const style = doc.createElement('style');
  style.setAttribute(STYLE_ELEMENT_ATTRIBUTE, '');
  style.textContent = css;

  // insert before any other styles so they can override the defaults
  doc.head.insertBefore(style, doc.head.firstChild);
}
