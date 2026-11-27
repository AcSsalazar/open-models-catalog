// Cálculos de hardware: si un modelo cabe en un equipo y estimaciones de memoria.

/** Bytes por parámetro según la precisión de los pesos. */
export const BYTES_PER_PARAM = { fp32: 4, bf16: 2, fp16: 2, int8: 1, q4: 0.56 };

/**
 * Memoria aproximada para cargar un modelo: pesos × 1.2 (activaciones y
 * caché de contexto). Devuelve GB redondeados a un decimal.
 */
export function estimateMemoryGB(paramsB, precision = 'bf16') {
  if (paramsB == null) return null;
  const weights = paramsB * BYTES_PER_PARAM[precision];
  return Math.round(weights * 1.2 * 10) / 10;
}

/**
 * Dice cómo podría correr un modelo en un equipo dado.
 * 'gpu': cabe en la VRAM; 'cpu': no cabe en VRAM pero sí en RAM y el modelo
 * admite CPU; 'no': no alcanza. Sin datos de requisitos devuelve 'desconocido'.
 */
export function fitsHardware(model, { ramGB = 0, vramGB = 0 } = {}) {
  const r = model.requirements ?? {};
  if (r.minVramGB == null && r.minRamGB == null) return 'desconocido';
  if (r.minVramGB != null && vramGB >= r.minVramGB) return 'gpu';
  if (r.cpuOk && r.minRamGB != null && ramGB >= r.minRamGB) return 'cpu';
  return 'no';
}

export function formatGB(gb) {
  if (gb == null) return '-';
  if (gb < 1) return `${Math.round(gb * 1024)} MB`;
  return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
}

export function formatParams(paramsB) {
  if (paramsB == null) return '-';
  if (paramsB < 1) return `${Math.round(paramsB * 1000)}M`;
  return `${Number.isInteger(paramsB) ? paramsB : paramsB.toFixed(1)}B`;
}
