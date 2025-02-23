import DOMPurify from 'isomorphic-dompurify';

type SanitizeOptions = {
  allowedAttributes?: string[];
  allowedTags?: string[];
};

export function sanitize(html: string, options: SanitizeOptions = {}) {
  // skip sanitization on the server
  if (typeof window === 'undefined') {
    return html;
  }

  const domPurifyOptions = {
    ALLOWED_ATTR: options.allowedAttributes ?? [],
    ALLOWED_TAGS: options.allowedTags ?? [],
  };

  return DOMPurify.sanitize(html, domPurifyOptions);
}

export function decodeHtmlEntities(html: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;

  return textarea.value;
}
