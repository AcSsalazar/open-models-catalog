import { describe, expect, it } from 'vitest';
import { MODELS } from './index.js';
import { validateCatalog } from '../lib/schema.js';

describe('catálogo', () => {
  it('todos los modelos cumplen el esquema', () => {
    expect(validateCatalog(MODELS)).toEqual([]);
  });

  it('los requisitos son coherentes con los pesos', () => {
    for (const m of MODELS) {
      const r = m.requirements;
      if (r.minVramGB != null && m.weights?.q4GB != null) {
        expect(r.minVramGB, m.id).toBeGreaterThanOrEqual(m.weights.q4GB * 0.9);
      }
    }
  });
});

describe('nivel para correr en local', () => {
  it('coincide con la VRAM mínima', () => {
    for (const m of MODELS) {
      const vram = m.requirements.minVramGB;
      if (vram == null) continue;
      if (m.local === 'facil') expect(vram, m.id).toBeLessThanOrEqual(8);
      if (m.local === 'gpu') expect(vram, m.id).toBeGreaterThan(8);
      if (m.local === 'gpu') expect(vram, m.id).toBeLessThanOrEqual(24);
      if (m.local === 'dificil') expect(vram, m.id).toBeGreaterThan(24);
    }
  });
});
