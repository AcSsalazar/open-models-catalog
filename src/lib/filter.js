import { fitsHardware } from './hardware.js';

export const DEFAULT_FILTERS = { category: 'todas', query: '' };

const normalize = (text) =>
  String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Texto en el que se busca: nombre, organización, tarea, licencia y versiones. */
function haystack(m) {
  return normalize([m.name, m.org, m.task, m.license, m.id, ...(m.versions ?? [])].join(' '));
}

export function filterModels(models, filters = DEFAULT_FILTERS, hardware) {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);
  return models.filter((m) => {
    if (filters.category && filters.category !== 'todas' && m.category !== filters.category) return false;
    if (words.length) {
      const text = haystack(m);
      if (!words.every((w) => text.includes(w))) return false;
    }
    return true;
  });
}

export function countByCategory(models) {
  const counts = {};
  for (const m of models) counts[m.category] = (counts[m.category] ?? 0) + 1;
  return counts;
}

export { fitsHardware };
