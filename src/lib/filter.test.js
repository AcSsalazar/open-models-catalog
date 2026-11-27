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

  it('muestra solo los que corren en el equipo', () => {
    const big = m('grande', 'texto', { requirements: { minVramGB: 80, minRamGB: 160, cpuOk: false } });
    const list = [...models, big];
    expect(filterModels(list, { onlyFits: true }, { ramGB: 16, vramGB: 8 })).toHaveLength(3);
    expect(filterModels(list, { onlyFits: false }, { ramGB: 16, vramGB: 8 })).toHaveLength(4);
  });

  it('ordena por VRAM, parámetros y fecha con los vacíos al final', () => {
    const list = [
      m('a', 'texto', { paramsB: 70, released: '2024-01', requirements: { minVramGB: 40 } }),
      m('b', 'texto', { paramsB: null, released: null, requirements: { minVramGB: null } }),
      m('c', 'texto', { paramsB: 1, released: '2025-06', requirements: { minVramGB: 2 } }),
    ];
    const ids = (sort) => filterModels(list, { sort }).map((x) => x.id).join('');
    expect(ids('vram')).toBe('cab');
    expect(ids('params')).toBe('cab');
    expect(ids('fecha')).toBe('cab');
    expect(ids('categoria')).toBe('abc');
  });

  it('cuenta por categoría', () => {
    expect(countByCategory(models)).toEqual({ audio: 1, texto: 1, imagen: 1 });
  });
});
