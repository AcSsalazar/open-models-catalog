import { describe, expect, it } from 'vitest';
import { renderCloud, renderDetail, renderPapers } from './ModelDetail.js';
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

describe('renderCloud', () => {
  const platforms = [
    { id: 'a', name: 'GPU16', url: 'https://a.test', type: 'notebook', gpu: 'T4', vramGB: 16, ramGB: 12 },
    { id: 'b', name: 'SoloCPU', url: 'https://b.test', type: 'vm', gpu: null, vramGB: null, ramGB: 24 },
  ];
  const model = (minVramGB, minRamGB, cpuOk = true) => ({ requirements: { minVramGB, minRamGB, cpuOk } });

  it('lista las plataformas donde cabe', () => {
    const html = renderCloud(model(6, 8), platforms);
    expect(html).toContain('GPU16</a> (GPU)');
    expect(html).toContain('SoloCPU</a> (CPU, lento)');
  });

  it('avisa si no cabe en ninguna', () => {
    expect(renderCloud(model(80, 128, false), platforms)).toContain('No cabe');
  });
});

describe('renderPapers', () => {
  it('muestra los papers que citan el modelo y nada si no hay', () => {
    const whisper = MODELS.find((m) => m.id === 'whisper-large-v3');
    expect(renderPapers(whisper)).toContain('Papers que lo usan');
    expect(renderPapers({ id: 'no-existe' })).toBe('');
  });
});
