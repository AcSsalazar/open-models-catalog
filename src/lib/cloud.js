// Plataformas en la nube con capa gratuita y si un modelo cabe en ellas.
import { fitsHardware } from './hardware.js';

export const PLATFORM_TYPES = {
  notebook: 'Notebook',
  app: 'Apps y demos',
  vm: 'Máquina virtual',
  creditos: 'Créditos',
  api: 'API de inferencia',
};

const isUrl = (v) => typeof v === 'string' && /^https:\/\/\S+$/.test(v);
const isNumOrNull = (v) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0);
const isTextOrNull = (v) => v === null || (typeof v === 'string' && v.length > 0);

/** Devuelve la lista de problemas de la plataforma (vacía si es válida). */
export function validatePlatform(p) {
  const errors = [];
  const req = (cond, msg) => {
    if (!cond) errors.push(`${p?.id ?? '?'}: ${msg}`);
  };
  req(typeof p.id === 'string' && /^[a-z0-9][a-z0-9.-]*$/.test(p.id), 'id inválido');
  req(typeof p.name === 'string' && p.name.length > 0, 'falta name');
  req(typeof p.provider === 'string' && p.provider.length > 0, 'falta provider');
  req(p.type in PLATFORM_TYPES, `tipo desconocido: ${p.type}`);
  req(typeof p.free === 'string' && p.free.length > 0, 'falta free');
  req(isTextOrNull(p.students ?? null), 'students inválido');
  req(isTextOrNull(p.gpu ?? null), 'gpu inválido');
  req(isNumOrNull(p.vramGB ?? null), 'vramGB inválido');
  req(isNumOrNull(p.ramGB ?? null), 'ramGB inválido');
  req(p.vramGB == null || p.gpu != null, 'con vramGB debe indicar la GPU');
  req(typeof p.limits === 'string' && p.limits.length > 0, 'falta limits');
  req(p.requiresCard === null || typeof p.requiresCard === 'boolean', 'requiresCard inválido');
  req(isUrl(p.url), 'url inválida');
  req(isUrl(p.source), 'source inválida');
  return errors;
}

export function validatePlatforms(list) {
  const errors = list.flatMap(validatePlatform);
  const seen = new Set();
  for (const p of list) {
    if (seen.has(p.id)) errors.push(`${p.id}: id repetido`);
    seen.add(p.id);
  }
  return errors;
}

/** True si en la plataforma se pueden cargar pesos propios (no es solo una API). */
export const runsOwnWeights = (p) => p.type !== 'api' && p.type !== 'creditos' && (p.vramGB != null || p.ramGB != null);

/**
 * Cómo correría el modelo en la capa gratuita de la plataforma:
 * 'gpu', 'cpu', 'no', 'desconocido', o null si la plataforma no carga pesos propios.
 */
export function cloudFit(model, platform) {
  if (!runsOwnWeights(platform)) return null;
  return fitsHardware(model, { ramGB: platform.ramGB ?? 0, vramGB: platform.vramGB ?? 0 });
}

/** Plataformas gratuitas donde el modelo cabe, primero las que lo corren en GPU. */
export function cloudOptionsFor(model, platforms) {
  return platforms
    .map((platform) => ({ platform, fit: cloudFit(model, platform) }))
    .filter(({ fit }) => fit === 'gpu' || fit === 'cpu')
    .sort((a, b) => (a.fit === b.fit ? 0 : a.fit === 'gpu' ? -1 : 1));
}
