import { sanitizeRichHtml } from '@/lib/security/sanitization'

describe('sanitizeRichHtml', () => {
  test('escapes unsafe script tags', () => {
    expect(sanitizeRichHtml('<script>alert(1)</script>hello')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;hello',
    )
  })

  test('preserves the allow-listed formatting tags', () => {
    expect(sanitizeRichHtml('<p><strong>Hello</strong><br/>world</p>')).toBe(
      '<p><strong>Hello</strong><br />world</p>',
    )
  })

  test('preserves safe links and forces noopener semantics', () => {
    expect(
      sanitizeRichHtml('<a href=\"https://example.com/path?q=1\">Open</a>', { allowLinks: true }),
    ).toBe('<a href="https://example.com/path?q=1" target="_blank" rel="noopener noreferrer">Open</a>')
  })

  test('drops javascript links while keeping inner text', () => {
    expect(
      sanitizeRichHtml('<a href=\"javascript:alert(1)\">Bad</a>', { allowLinks: true }),
    ).toBe('Bad')
  })

  test('preserves explicitly allowed citation tags only with valid attributes', () => {
    expect(
      sanitizeRichHtml('<citation data-id=\"dev_123\" data-number=\"4\">[4]</citation>', {
        allowCitations: true,
      }),
    ).toBe('<citation data-id="dev_123" data-number="4">[4]</citation>')
  })

  test('rejects malformed citation ids', () => {
    expect(
      sanitizeRichHtml('<citation data-id=\"dev 123\" data-number=\"4\">[4]</citation>', {
        allowCitations: true,
      }),
    ).toContain('&lt;citation')
  })
})
