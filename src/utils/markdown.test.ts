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
  it('converts bold markdown to a strong tag', () => {
    expect(inlineMarkdownToHtml('see **MoVi** dataset')).toBe('see <strong>MoVi</strong> dataset');
  });
  it('converts both a link and bold in the same string', () => {
    expect(
      inlineMarkdownToHtml('won **best paper** at [CVPR](https://cvpr.thecvf.com)'),
    ).toBe(
      'won <strong>best paper</strong> at <a href="https://cvpr.thecvf.com" target="_blank" rel="noopener">CVPR</a>',
    );
  });
});
