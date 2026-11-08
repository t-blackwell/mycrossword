import { DEFAULT_HTML_TAGS } from './general';
import { decodeHtmlEntities, sanitize } from './html';

/**
 * Sanitise the clue text as the components do, then parse it with the DOM to
 * see what the browser would actually create.
 */
function render(text: string, allowedTags = DEFAULT_HTML_TAGS) {
  const container = document.createElement('div');
  container.innerHTML = sanitize(decodeHtmlEntities(text), { allowedTags });
  return container;
}

describe('sanitize', () => {
  test('it returns text without markup unchanged', () => {
    const text = 'Toy on a string (2-2) & more';
    expect(sanitize(text)).toBe(text);
  });

  test('it removes all tags by default', () => {
    expect(sanitize('A <b>bold</b> <i>clue</i>')).toBe('A bold clue');
  });

  test('it keeps allowed tags', () => {
    expect(
      sanitize('A <b>bold</b> <i>clue</i> <u>here</u>', {
        allowedTags: ['b', 'i'],
      }),
    ).toBe('A <b>bold</b> <i>clue</i> here');
  });

  test('it matches allowed tags case-insensitively', () => {
    expect(sanitize('<EM>x</EM>', { allowedTags: ['em'] })).toBe('<EM>x</EM>');
  });

  test('it only allows whole tag names', () => {
    expect(
      sanitize('<emx>x</emx> <bx>y</bx>', { allowedTags: ['em', 'b'] }),
    ).toBe('x y');
  });

  test('it strips attributes from allowed tags', () => {
    expect(
      sanitize('<b class="x" onclick="alert(1)">bold</b>', {
        allowedTags: ['b'],
      }),
    ).toBe('<b>bold</b>');
  });

  test('it removes disallowed tags but keeps their text', () => {
    expect(sanitize('<div><span>text</span></div>')).toBe('text');
    expect(sanitize('<script>alert(1)</script>')).toBe('alert(1)');
  });

  test('it removes self-closing and void tags', () => {
    expect(sanitize('a<br/>b<hr />c<img src="x">d')).toBe('abcd');
  });
});

describe('decodeHtmlEntities', () => {
  test('it decodes named entities case-insensitively', () => {
    expect(decodeHtmlEntities('&amp; &AMP; &lt;&gt; &quot; &pound;')).toBe(
      '& & <> " £',
    );
  });

  test('it decodes decimal and hexadecimal entities', () => {
    expect(decodeHtmlEntities('&#65;&#x42;&#X43; &#128512;')).toBe('ABC 😀');
  });

  test('it leaves unknown and invalid entities unchanged', () => {
    expect(decodeHtmlEntities('&unknown; &#xZZ; &#x110000;')).toBe(
      '&unknown; &#xZZ; &#x110000;',
    );
  });
});

describe('sanitizing clue text', () => {
  test('it removes encoded tags once decoded', () => {
    expect(render('&lt;img src=x onerror=alert(1)&gt;Clue').innerHTML).toBe(
      'Clue',
    );
  });

  test('it renders double-encoded tags as text', () => {
    const container = render('&amp;lt;b&amp;gt;Clue');

    expect(container.children.length).toBe(0);
    // decoded once, so the browser shows the literal text '<b>'
    expect(container.textContent).toBe('<b>Clue');
  });

  test.each([
    '<img src=x onerror=alert(1)>',
    '<IMG SRC=x ONERROR=alert(1)>',
    '<svg/onload=alert(1)>',
    '<svg><script>alert(1)</script></svg>',
    '<b/onmouseover=alert(1)>bold</b>',
    '<b onmouseover="alert(1)">bold</b>',
    '<em title="x>" onmouseover=alert(1)>em</em>',
    '<b title="x>"><img src=x onerror=alert(1)>',
    '<img src="x>" onerror=alert(1)>',
    '<img src=x onerror=alert(1) <b>bold</b>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<a href="javascript:alert(1)">link</a>',
    '<!-- <img src=x onerror=alert(1)> -->',
    '<style>@import "https://example.com/x.css";</style>',
    '<scr<script>ipt>alert(1)</script>',
    '<<b>img src=x onerror=alert(1)>',
    '&lt;svg onload=alert(1)&gt;',
    '&#60;img src=x onerror=alert(1)&#62;',
    '&#x3C;img src=x onerror=alert(1)&#x3E;',
  ])('it neutralises %s', (payload) => {
    const container = render(payload);

    container.querySelectorAll('*').forEach((element) => {
      expect(DEFAULT_HTML_TAGS).toContain(element.tagName.toLowerCase());
      expect(element.attributes.length).toBe(0);
    });
  });
});
