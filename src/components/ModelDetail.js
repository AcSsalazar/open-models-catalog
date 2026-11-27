import styles from './ModelDetail.module.css';
import { escapeHtml } from '../lib/html.js';
import { formatGB } from '../lib/hardware.js';
import { LOCAL_LEVELS } from '../lib/schema.js';

const LINK_LABELS = {
  huggingface: 'Hugging Face',
  kaggle: 'Kaggle',
  github: 'GitHub',
  ollama: 'Ollama',
  paper: 'Paper',
};

function link(url, label) {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'fuente';
  }
}

/** HTML de la ficha completa de un modelo (va dentro de una fila de la tabla). */
export function renderDetail(m) {
  const w = m.weights ?? {};
  const r = m.requirements ?? {};
  const links = Object.entries(LINK_LABELS)
    .filter(([key]) => m.links?.[key])
    .map(([key, label]) => link(m.links[key], label))
    .join('');

  const benchmarks = m.benchmarks?.length
    ? `<table class="${styles.bench}">
        <thead><tr><th>Benchmark</th><th>Resultado</th><th>Fuente</th></tr></thead>
        <tbody>
          ${m.benchmarks
            .map((b) => `<tr><td>${escapeHtml(b.name)}</td><td>${escapeHtml(b.score)}</td><td>${link(b.source, hostOf(b.source))}</td></tr>`)
            .join('')}
        </tbody>
      </table>`
    : `<p class="${styles.note}">La fuente oficial no publica benchmarks comparables.</p>`;

  return `
    <div class="${styles.grid}">
      <div>
        <p class="${styles.description}">${escapeHtml(m.description)}</p>
        <p class="${styles.subtitle}">Requisitos</p>
        <p class="${styles.note}">${escapeHtml(r.note || 'Sin notas.')}</p>
      </div>
      <dl class="${styles.meta}">
        <dt>Publicado</dt><dd>${escapeHtml(m.released ?? '-')}</dd>
        <dt>Parámetros</dt><dd>${escapeHtml(m.params ?? '-')}</dd>
        <dt>Pesos</dt><dd>${formatGB(w.fullGB)}${w.fullPrecision ? ` (${escapeHtml(w.fullPrecision)})` : ''}${w.q4GB != null ? `, ${formatGB(w.q4GB)} en 4 bits` : ''}</dd>
        <dt>Formatos</dt><dd>${escapeHtml((w.formats ?? []).join(', ') || '-')}</dd>
        <dt>En CPU</dt><dd>${r.cpuOk ? 'Sí' : 'No es práctico'}</dd>
        <dt>Nivel</dt><dd>${LOCAL_LEVELS[m.local]}</dd>
        <dt>Licencia</dt><dd>${escapeHtml(m.license)}</dd>
        ${m.versions?.length ? `<dt>Versiones</dt><dd>${escapeHtml(m.versions.join(', '))}</dd>` : ''}
      </dl>
      <div class="${styles.full}">
        <div class="${styles.links}">${links}</div>
        <p class="${styles.subtitle}">Benchmarks</p>
        ${benchmarks}
      </div>
    </div>
  `;
}

/** Abre o cierra la ficha debajo de la fila de la tabla. */
export function toggleDetail(row, model, columns) {
  const next = row.nextElementSibling;
  if (next?.dataset.detailOf === model.id) {
    next.remove();
    row.setAttribute('aria-expanded', 'false');
    return false;
  }
  const tr = document.createElement('tr');
  tr.className = styles.detail;
  tr.dataset.detailOf = model.id;
  tr.innerHTML = `<td colspan="${columns}">${renderDetail(model)}</td>`;
  row.after(tr);
  row.setAttribute('aria-expanded', 'true');
  return true;
}
