import { describe, it, expect } from 'vitest';
import { inlineMarkdownToHtml } from '@/utils/markdown';

describe('inlineMarkdownToHtml', () => {
  it('converts a markdown link to an anchor', () => {
    expect(inlineMarkdownToHtml('Joined [Weta](https://wetafx.co.nz) today')).toBe(
      'Joined <a href="https://wetafx.co.nz" target="_blank" rel="noopener">Weta</a> today',
    );
  });
  it('leaves plain text unchanged', () => {
    expect(inlineMarkdownToHtml('no links here')).toBe('no links here');
  });
  it('escapes HTML in the surrounding text', () => {
    expect(inlineMarkdownToHtml('a < b & c')).toBe('a &lt; b &amp; c');
  });
  it('ignores non-http url schemes', () => {
    expect(inlineMarkdownToHtml('[x](javascript:alert(1))')).toBe('[x](javascript:alert(1))');
  });
});
