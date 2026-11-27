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
