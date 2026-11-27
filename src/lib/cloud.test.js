import { describe, expect, it } from 'vitest';
import { cloudFit, cloudOptionsFor, runsOwnWeights, validatePlatform, validatePlatforms } from './cloud.js';

const base = {
  id: 'colab',
  name: 'Google Colab',
  provider: 'Google',
  type: 'notebook',
  free: 'Notebooks con GPU gratis.',
  students: null,
  gpu: 'NVIDIA T4',
  vramGB: 15,
  ramGB: 12,
  limits: 'Sesiones de hasta 12 h.',
  requiresCard: false,
  url: 'https://colab.research.google.com',
  source: 'https://research.google.com/colaboratory/faq.html',
  notes: null,
};

const model = (minVramGB, minRamGB, cpuOk = true) => ({ requirements: { minVramGB, minRamGB, cpuOk } });

describe('validatePlatform', () => {
  it('acepta una plataforma completa', () => {
    expect(validatePlatform(base)).toEqual([]);
  });

  it('exige vramGB si hay GPU', () => {
    expect(validatePlatform({ ...base, vramGB: null })).toContain('colab: con GPU debe indicar vramGB');
  });

  it('rechaza tipos y links inválidos', () => {
    const errors = validatePlatform({ ...base, type: 'x', url: 'http://a' });
    expect(errors).toHaveLength(2);
  });

  it('detecta ids repetidos', () => {
    expect(validatePlatforms([base, base])).toContain('colab: id repetido');
  });
});

describe('cloudFit', () => {
  it('usa la GPU y la RAM de la capa gratuita', () => {
    expect(cloudFit(model(6, 8), base)).toBe('gpu');
    expect(cloudFit(model(20, 10), base)).toBe('cpu');
    expect(cloudFit(model(20, 30), base)).toBe('no');
  });

  it('no aplica a APIs', () => {
    const api = { ...base, type: 'api', gpu: null, vramGB: null, ramGB: null };
    expect(runsOwnWeights(api)).toBe(false);
    expect(cloudFit(model(6, 8), api)).toBeNull();
  });
});

describe('cloudOptionsFor', () => {
  it('lista primero las que corren en GPU', () => {
    const cpuOnly = { ...base, id: 'cpu', gpu: null, vramGB: null, ramGB: 24 };
    const options = cloudOptionsFor(model(6, 8), [cpuOnly, base]);
    expect(options.map((o) => [o.platform.id, o.fit])).toEqual([
      ['colab', 'gpu'],
      ['cpu', 'cpu'],
    ]);
  });

  it('omite las que no alcanzan', () => {
    expect(cloudOptionsFor(model(80, 128, false), [base])).toEqual([]);
  });
});
