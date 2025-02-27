/**
 * Basic HTML sanitization function.
 *
 * Note this doesn't use DOMParser or any other browser APIs.
 */
export function sanitize(
  html: string,
  options: { allowedTags?: string[] } = {},
) {
  const { allowedTags = [] } = options;

  // Short-circuit: if there are no < or > characters, return the input as is
  if (!/<|>/.test(html)) {
    return html;
  }

  let previous = '';
  let current = html;

  // Ensure allowedTags are treated as whole words using `\b`
  const allowedPattern =
    allowedTags.length > 0 ? `\\b(${allowedTags.join('|')})\\b` : '(?!)'; // "(?!)" ensures an empty list matches nothing

  // Regex to remove disallowed tags (fully removes both opening & closing tags)
  const tagPattern = new RegExp(`</?(?!${allowedPattern})\\w+[^>]*>`, 'gi');

  // Regex to strip all attributes from allowed tags
  const attributePattern = /<(\w+)[^>]*>/gi;

  while (previous !== current) {
    previous = current;

    // Remove disallowed tags completely
    current = current.replace(tagPattern, '');

    // Remove all attributes from allowed tags
    current = current.replace(attributePattern, '<$1>');
  }

  return current;
}

export function decodeHtmlEntities(html: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;

  return textarea.value;
}
