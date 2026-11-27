import { describe, expect, it } from 'vitest';
import { renderDetail } from './ModelDetail.js';
import { MODELS } from '../data/index.js';
import { escapeHtml } from '../lib/html.js';

describe('renderDetail', () => {
  it('genera la ficha de todos los modelos del catálogo', () => {
    for (const m of MODELS) {
      const html = renderDetail(m);
      expect(html, m.id).toContain(escapeHtml(m.description));
      for (const b of m.benchmarks) expect(html, m.id).toContain(escapeHtml(b.source));
    }
  });

  it('escapa el texto', () => {
    const m = { ...MODELS[0], description: '<script>x</script>' };
    expect(renderDetail(m)).not.toContain('<script>');
  });
});
