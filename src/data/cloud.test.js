import { describe, expect, it } from 'vitest';
import PLATFORMS from './cloud.json';
import { MODELS } from './index.js';
import { cloudOptionsFor, validatePlatforms } from '../lib/cloud.js';

describe('plataformas en la nube', () => {
  it('cumplen el esquema', () => {
    expect(validatePlatforms(PLATFORMS)).toEqual([]);
  });

  it('cada modelo pequeño tiene al menos una opción gratis en la nube', () => {
    for (const m of MODELS.filter((x) => x.local === 'facil')) {
      expect(cloudOptionsFor(m, PLATFORMS).length, m.id).toBeGreaterThan(0);
    }
  });
});
