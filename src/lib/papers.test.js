import { describe, expect, it } from 'vitest';
import { countByArea, filterPapers, papersForModel, validatePaper, validatePapers } from './papers.js';

const paper = (over = {}) => ({
  id: 'p1',
  title: 'Whisper para español clínico',
  authors: 'Pérez et al.',
  year: 2024,
  venue: 'Interspeech',
  area: 'voz',
  models: ['whisper-large-v3'],
  modelsText: 'Whisper large-v3 ajustado',
  summary: 'Resumen corto.',
  url: 'https://arxiv.org/abs/0000.00000',
  code: null,
  ...over,
});

describe('validatePaper', () => {
  it('acepta un paper completo', () => {
    expect(validatePaper(paper())).toEqual([]);
  });

  it('avisa si un modelo no está en el catálogo', () => {
    expect(validatePaper(paper(), new Set(['yolo26']))).toEqual(['p1: modelo que no está en el catálogo: whisper-large-v3']);
  });

  it('rechaza área, año y url inválidos', () => {
    expect(validatePaper(paper({ area: 'x', year: 1990, url: 'ftp://a' }))).toHaveLength(3);
  });

  it('detecta ids repetidos', () => {
    expect(validatePapers([paper(), paper()])).toContain('p1: id repetido');
  });
});

describe('filterPapers', () => {
  const list = [
    paper(),
    paper({ id: 'p2', title: 'Emociones faciales con CLIP', area: 'emociones', year: 2025, models: ['clip-vit-large-patch14'] }),
    paper({ id: 'p3', title: 'Detección de plagas', area: 'agro-ecologia', year: 2023, models: [] }),
  ];

  it('ordena del más reciente al más antiguo', () => {
    expect(filterPapers(list).map((p) => p.id)).toEqual(['p2', 'p1', 'p3']);
  });

  it('filtra por área y por texto sin tildes', () => {
    expect(filterPapers(list, { area: 'voz' }).map((p) => p.id)).toEqual(['p1']);
    expect(filterPapers(list, { query: 'deteccion' }).map((p) => p.id)).toEqual(['p3']);
  });

  it('busca los papers de un modelo y cuenta por área', () => {
    expect(papersForModel('clip-vit-large-patch14', list).map((p) => p.id)).toEqual(['p2']);
    expect(countByArea(list)).toEqual({ voz: 1, emociones: 1, 'agro-ecologia': 1 });
  });
});
