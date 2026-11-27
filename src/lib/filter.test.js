import { describe, expect, it } from 'vitest';
import { countByCategory, filterModels } from './filter.js';

const m = (id, category, extra = {}) => ({
  id,
  name: id,
  org: 'Org',
  category,
  task: '',
  license: 'MIT',
  versions: [],
  requirements: { minVramGB: 4, minRamGB: 8, cpuOk: true },
  ...extra,
});

const models = [
  m('whisper', 'audio', { task: 'Reconocimiento de voz' }),
  m('llama', 'texto', { org: 'Meta' }),
  m('flux', 'imagen', { license: 'Apache 2.0' }),
];

describe('filterModels', () => {
  it('filtra por categoría', () => {
    expect(filterModels(models, { category: 'audio' }).map((x) => x.id)).toEqual(['whisper']);
    expect(filterModels(models, { category: 'todas' })).toHaveLength(3);
  });

  it('busca sin importar mayúsculas ni tildes', () => {
    expect(filterModels(models, { query: 'RECONOCIMIENTO' }).map((x) => x.id)).toEqual(['whisper']);
    expect(filterModels(models, { query: 'reconocímiento voz' })).toHaveLength(1);
    expect(filterModels(models, { query: 'meta' }).map((x) => x.id)).toEqual(['llama']);
  });

  it('cuenta por categoría', () => {
    expect(countByCategory(models)).toEqual({ audio: 1, texto: 1, imagen: 1 });
  });
});
