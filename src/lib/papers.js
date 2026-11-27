// Papers que aplican modelos abiertos: esquema, filtros y relación con el catálogo.

export const PAPER_AREAS = {
  voz: 'Voz',
  emociones: 'Emociones',
  salud: 'Salud',
  'agro-ecologia': 'Agro y ecología',
  vision: 'Visión',
  lenguaje: 'Lenguaje',
  accesibilidad: 'Accesibilidad',
  generacion: 'Generación',
};

const isUrl = (v) => typeof v === 'string' && /^https:\/\/\S+$/.test(v);

/** Problemas del paper (vacío si es válido). modelIds: ids que existen en el catálogo. */
export function validatePaper(p, modelIds = null) {
  const errors = [];
  const req = (cond, msg) => {
    if (!cond) errors.push(`${p?.id ?? '?'}: ${msg}`);
  };
  req(typeof p.id === 'string' && /^[a-z0-9][a-z0-9.-]*$/.test(p.id), 'id inválido');
  req(typeof p.title === 'string' && p.title.length > 0, 'falta title');
  req(typeof p.authors === 'string' && p.authors.length > 0, 'falta authors');
  req(Number.isInteger(p.year) && p.year >= 2017 && p.year <= 2030, 'year inválido');
  req(typeof p.venue === 'string' && p.venue.length > 0, 'falta venue');
  req(p.area in PAPER_AREAS, `área desconocida: ${p.area}`);
  req(Array.isArray(p.models), 'models debe ser lista');
  for (const id of p.models ?? []) {
    req(!modelIds || modelIds.has(id), `modelo que no está en el catálogo: ${id}`);
  }
  req(typeof p.modelsText === 'string' && p.modelsText.length > 0, 'falta modelsText');
  req(typeof p.summary === 'string' && p.summary.length > 0, 'falta summary');
  req(isUrl(p.url), 'url inválida');
  req(p.code == null || isUrl(p.code), 'code inválido');
  return errors;
}

export function validatePapers(list, modelIds = null) {
  const errors = list.flatMap((p) => validatePaper(p, modelIds));
  const seen = new Set();
  for (const p of list) {
    if (seen.has(p.id)) errors.push(`${p.id}: id repetido`);
    seen.add(p.id);
  }
  return errors;
}

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Filtra por área y texto; los más recientes primero. */
export function filterPapers(papers, { area = 'todas', query = '' } = {}) {
  const q = normalize(query.trim());
  return papers
    .filter((p) => area === 'todas' || p.area === area)
    .filter((p) => !q || normalize(`${p.title} ${p.authors} ${p.venue} ${p.modelsText} ${p.summary}`).includes(q))
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

/** Papers que usan un modelo del catálogo. */
export function papersForModel(modelId, papers) {
  return filterPapers(papers.filter((p) => p.models.includes(modelId)));
}

export function countByArea(papers) {
  const counts = {};
  for (const p of papers) counts[p.area] = (counts[p.area] ?? 0) + 1;
  return counts;
}
