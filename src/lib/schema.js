// Esquema de cada modelo del catálogo y su validación.

export const CATEGORIES = {
  texto: 'Texto',
  codigo: 'Código',
  multimodal: 'Multimodal',
  imagen: 'Imagen',
  video: 'Video',
  vision: 'Visión',
  audio: 'Audio',
  embeddings: 'Embeddings',
};

export const LOCAL_LEVELS = {
  facil: 'Laptop o GPU de 8 GB',
  gpu: 'GPU de 12 a 24 GB',
  dificil: 'Más de 24 GB o varias GPUs',
};

const LINK_KEYS = ['huggingface', 'kaggle', 'github', 'ollama', 'paper'];

const isUrl = (v) => typeof v === 'string' && /^https:\/\/\S+$/.test(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isNumOrNull = (v) => v === null || isNum(v);

/** Devuelve la lista de problemas del modelo (vacía si es válido). */
export function validateModel(m) {
  const errors = [];
  const req = (cond, msg) => {
    if (!cond) errors.push(`${m?.id ?? '?'}: ${msg}`);
  };

  req(typeof m.id === 'string' && /^[a-z0-9][a-z0-9.-]*$/.test(m.id), 'id inválido');
  req(typeof m.name === 'string' && m.name.length > 0, 'falta name');
  req(typeof m.org === 'string' && m.org.length > 0, 'falta org');
  req(m.category in CATEGORIES, `categoría desconocida: ${m.category}`);
  req(typeof m.task === 'string' && m.task.length > 0, 'falta task');
  req(isNumOrNull(m.paramsB), 'paramsB debe ser número o null');
  req(m.released === null || /^\d{4}-\d{2}$/.test(m.released), 'released debe ser AAAA-MM');
  req(typeof m.license === 'string' && m.license.length > 0, 'falta license');
  req(Array.isArray(m.versions), 'versions debe ser lista');
  req(m.local in LOCAL_LEVELS, `local desconocido: ${m.local}`);
  req(typeof m.description === 'string' && m.description.length > 0, 'falta description');

  const links = m.links ?? {};
  req(LINK_KEYS.some((k) => links[k]), 'necesita al menos un link');
  for (const k of LINK_KEYS) {
    req(links[k] == null || isUrl(links[k]), `link ${k} inválido`);
  }

  const w = m.weights ?? {};
  req(isNumOrNull(w.fullGB ?? null), 'weights.fullGB inválido');
  req(isNumOrNull(w.q4GB ?? null), 'weights.q4GB inválido');

  const r = m.requirements ?? {};
  req(isNumOrNull(r.minVramGB ?? null), 'requirements.minVramGB inválido');
  req(isNumOrNull(r.minRamGB ?? null), 'requirements.minRamGB inválido');
  req(typeof r.cpuOk === 'boolean', 'requirements.cpuOk debe ser booleano');

  req(Array.isArray(m.benchmarks), 'benchmarks debe ser lista');
  for (const b of m.benchmarks ?? []) {
    req(b.name && b.score != null && isUrl(b.source), `benchmark incompleto: ${b.name}`);
  }
  return errors;
}

export function validateCatalog(models) {
  const errors = models.flatMap(validateModel);
  const seen = new Set();
  for (const m of models) {
    if (seen.has(m.id)) errors.push(`${m.id}: id repetido`);
    seen.add(m.id);
  }
  return errors;
}
