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

const entityDictionary: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&#x2F;': '/',
  '&#96;': '`',
  '&#x3D;': '=',
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&apos;': "'",
  '&sect;': '§',
  '&para;': '¶',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&laquo;': '«',
  '&raquo;': '»',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&hellip;': '…',
  '&middot;': '·',
  '&bull;': '•',
  '&ndash;': '–',
  '&mdash;': '—',
  '&alpha;': 'α',
  '&beta;': 'β',
  '&gamma;': 'γ',
  '&delta;': 'δ',
  '&pi;': 'π',
  '&sigma;': 'σ',
  '&omega;': 'ω',
  '&mu;': 'μ',
  '&tau;': 'τ',
  '&phi;': 'φ',
  '&chi;': 'χ',
  '&psi;': 'ψ',
  '&theta;': 'θ',
};

/**
 * Decode HTML entities in a string.
 */
export function decodeHtmlEntities(html: string): string {
  return html.replace(/&([^;]+);/g, (entity, entityCode) => {
    // Check dictionary for named entities (case-insensitive)
    const namedEntity = entityDictionary[entity.toLowerCase()];

    if (namedEntity !== undefined) {
      return namedEntity;
    }

    // Handle decimal numeric entities
    if (entityCode.startsWith('#')) {
      let code: number;

      // Handle hexadecimal entities (&#x...)
      if (entityCode.startsWith('#x') || entityCode.startsWith('#X')) {
        code = parseInt(entityCode.slice(2), 16);
      } else {
        // Handle decimal entities (&#...)
        code = parseInt(entityCode.slice(1), 10);
      }

      // Use String.fromCodePoint instead of String.fromCharCode to handle all Unicode
      if (!isNaN(code)) {
        try {
          return String.fromCodePoint(code);
        } catch (e) {
          // Return the original entity if the code point is invalid
          return entity;
        }
      }
    }

    // Return unchanged if not recognized
    return entity;
  });
}
