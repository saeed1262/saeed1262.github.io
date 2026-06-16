import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Card from '@/components/ui/Card.astro';

describe('Card', () => {
  it('renders slotted content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Card, { slots: { default: 'Paper title' } });
    expect(html).toContain('Paper title');
    expect(html).toContain('class="card');
  });
});
