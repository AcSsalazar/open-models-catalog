import { describe, expect, it } from 'vitest';
import PAPERS from './papers.json';
import { MODELS } from './index.js';
import { validatePapers } from '../lib/papers.js';

describe('papers destacados', () => {
  it('cumplen el esquema y citan modelos que existen en el catálogo', () => {
    expect(validatePapers(PAPERS, new Set(MODELS.map((m) => m.id)))).toEqual([]);
  });

  it('cubren voz y emociones con al menos dos papers cada una', () => {
    expect(PAPERS.filter((p) => p.area === 'voz').length).toBeGreaterThanOrEqual(2);
    expect(PAPERS.filter((p) => p.area === 'emociones').length).toBeGreaterThanOrEqual(2);
  });
});
