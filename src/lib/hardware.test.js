import { describe, expect, it } from 'vitest';
import { estimateMemoryGB, fitsHardware, formatGB, formatParams } from './hardware.js';

const model = (requirements) => ({ requirements });

describe('estimateMemoryGB', () => {
  it('estima 8B en bf16 y en Q4', () => {
    expect(estimateMemoryGB(8, 'bf16')).toBe(19.2);
    expect(estimateMemoryGB(8, 'q4')).toBe(5.4);
  });

  it('devuelve null sin parámetros', () => {
    expect(estimateMemoryGB(null)).toBeNull();
  });
});

describe('fitsHardware', () => {
  const m = model({ minVramGB: 6, minRamGB: 8, cpuOk: true });

  it('prefiere la GPU si alcanza la VRAM', () => {
    expect(fitsHardware(m, { ramGB: 16, vramGB: 8 })).toBe('gpu');
  });

  it('cae a CPU si la RAM alcanza', () => {
    expect(fitsHardware(m, { ramGB: 16, vramGB: 4 })).toBe('cpu');
  });

  it('no corre en CPU si el modelo no lo admite', () => {
    expect(fitsHardware(model({ minVramGB: 24, minRamGB: 32, cpuOk: false }), { ramGB: 64, vramGB: 8 })).toBe('no');
  });

  it('sin requisitos es desconocido', () => {
    expect(fitsHardware(model({ cpuOk: true }), { ramGB: 64 })).toBe('desconocido');
  });
});

describe('formatos', () => {
  it('formatea GB y parámetros', () => {
    expect(formatGB(0.5)).toBe('512 MB');
    expect(formatGB(4.94)).toBe('4.9 GB');
    expect(formatGB(140.2)).toBe('140 GB');
    expect(formatParams(0.082)).toBe('82M');
    expect(formatParams(8)).toBe('8B');
    expect(formatParams(30.5)).toBe('30.5B');
  });
});
