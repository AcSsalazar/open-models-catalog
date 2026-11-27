import { fitsHardware } from './hardware.js';

export const DEFAULT_FILTERS = { category: 'todas', query: '', onlyFits: false, sort: 'categoria' };

export const SORTS = {
  categoria: 'Categoría',
  nombre: 'Nombre',
  vram: 'VRAM mínima',
  params: 'Parámetros',
  fecha: 'Más recientes',
};

const normalize = (text) =>
  String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Texto en el que se busca: nombre, organización, tarea, licencia y versiones. */
function haystack(m) {
  return normalize([m.name, m.org, m.task, m.license, m.id, ...(m.versions ?? [])].join(' '));
}

// Los valores desconocidos van al final en cualquier orden.
const byNumber = (get) => (a, b) => (get(a) ?? Infinity) - (get(b) ?? Infinity);

const COMPARE = {
  categoria: () => 0,
  nombre: (a, b) => a.name.localeCompare(b.name),
  vram: byNumber((m) => m.requirements?.minVramGB),
  params: byNumber((m) => m.paramsB),
  fecha: (a, b) => (b.released ?? '').localeCompare(a.released ?? ''),
};

export function filterModels(models, filters = DEFAULT_FILTERS, hardware) {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);
  const result = models.filter((m) => {
    if (filters.category && filters.category !== 'todas' && m.category !== filters.category) return false;
    if (filters.onlyFits && hardware) {
      const fit = fitsHardware(m, hardware);
      if (fit !== 'gpu' && fit !== 'cpu') return false;
    }
    if (words.length) {
      const text = haystack(m);
      if (!words.every((w) => text.includes(w))) return false;
    }
    return true;
  });
  // sort es estable: con 'categoria' se mantiene el orden original.
  return result.sort(COMPARE[filters.sort] ?? COMPARE.categoria);
}

export function countByCategory(models) {
  const counts = {};
  for (const m of models) counts[m.category] = (counts[m.category] ?? 0) + 1;
  return counts;
}
