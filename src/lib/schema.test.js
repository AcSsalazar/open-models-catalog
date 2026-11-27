import { describe, expect, it } from 'vitest';
import { validateCatalog, validateModel } from './schema.js';

export const sample = {
  id: 'ejemplo-7b',
  name: 'Ejemplo 7B',
  org: 'Org',
  category: 'texto',
  task: 'Chat',
  params: '7B',
  paramsB: 7,
  released: '2025-01',
  license: 'Apache 2.0',
  versions: [],
  links: { huggingface: 'https://huggingface.co/org/ejemplo', kaggle: null, github: null, ollama: null, paper: null },
  weights: { fullGB: 14, fullPrecision: 'bf16', q4GB: 4.4, formats: ['safetensors'] },
  requirements: { minVramGB: 6, minRamGB: 8, cpuOk: true, note: '' },
  local: 'facil',
  benchmarks: [{ name: 'MMLU', score: '60', source: 'https://huggingface.co/org/ejemplo' }],
  description: 'Modelo de ejemplo.',
};

describe('validateModel', () => {
  it('acepta un modelo completo', () => {
    expect(validateModel(sample)).toEqual([]);
  });

  it('detecta categoría, fecha y links inválidos', () => {
    const errors = validateModel({
      ...sample,
      category: 'otra',
      released: '2025',
      links: { huggingface: 'http://inseguro' },
    });
    expect(errors.join('\n')).toMatch(/categoría/);
    expect(errors.join('\n')).toMatch(/released/);
    expect(errors.join('\n')).toMatch(/huggingface/);
  });

  it('exige fuente en cada benchmark', () => {
    const errors = validateModel({ ...sample, benchmarks: [{ name: 'MMLU', score: '60' }] });
    expect(errors).toHaveLength(1);
  });
});

describe('validateCatalog', () => {
  it('detecta ids repetidos', () => {
    expect(validateCatalog([sample, sample])).toContain('ejemplo-7b: id repetido');
  });
});
