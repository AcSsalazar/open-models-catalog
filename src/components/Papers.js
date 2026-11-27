import styles from './Papers.module.css';
import { PAPER_AREAS, countByArea, filterPapers } from '../lib/papers.js';
import { escapeHtml } from '../lib/html.js';

function link(url, label) {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

/** Una entrada de bibliografía con resumen y modelos usados. */
export function renderPaper(p, modelNames = {}) {
  const models = p.models
    .filter((id) => modelNames[id])
    .map((id) => `<button type="button" class="${styles.model}" data-model="${escapeHtml(id)}">${escapeHtml(modelNames[id])}</button>`)
    .join(', ');
  return `
    <li class="${styles.entry}">
      <p class="${styles.ref}">
        ${escapeHtml(p.authors)}. <span class="${styles.paperTitle}">${escapeHtml(p.title)}</span>.
        <em>${escapeHtml(p.venue)}</em>, ${p.year}.
        ${link(p.url, 'Paper')}${p.code ? ` · ${link(p.code, 'Código')}` : ''}
      </p>
      <p class="${styles.summary}">${escapeHtml(p.summary)}</p>
      <p class="${styles.models}">
        <span class="${styles.area}">${PAPER_AREAS[p.area]}</span>
        ${escapeHtml(p.modelsText)}${models ? `. En el catálogo: ${models}` : ''}
      </p>
    </li>`;
}

/**
 * Sección "Papers destacados". onModel(id) se llama al elegir un modelo citado.
 */
export function createPapers(container, { papers, models = [], onModel } = {}) {
  let value = { area: 'todas', query: '' };
  const modelNames = Object.fromEntries(models.map((m) => [m.id, m.name]));
  const counts = countByArea(papers);
  const areas = [['todas', 'Todas', papers.length], ...Object.entries(PAPER_AREAS).map(([id, label]) => [id, label, counts[id] ?? 0])].filter(
    ([, , n]) => n > 0,
  );

  const root = document.createElement('section');
  root.className = styles.papers;
  root.innerHTML = `
    <h2 class="${styles.title}">3 Papers destacados</h2>
    <p class="${styles.lead}">
      Trabajos publicados que aplican modelos abiertos a problemas concretos: reconocimiento de voz, emociones faciales, salud,
      agricultura y más. Cada entrada resume el problema y el resultado, y enlaza los modelos que están en el catálogo.
    </p>
    <div class="${styles.areas}" role="radiogroup" aria-label="Área">
      ${areas.map(([id, label, n]) => `<button type="button" class="${styles.areaBtn}" data-area="${id}">${label}<sup>${n}</sup></button>`).join('')}
    </div>
    <input type="search" class="${styles.search}" placeholder="Buscar por título, autor, modelo o tema" aria-label="Buscar papers" />
    <ol class="${styles.list}"></ol>
  `;
  container.append(root);
  const list = root.querySelector('ol');

  function render() {
    root.querySelectorAll('[data-area]').forEach((b) => {
      const on = b.dataset.area === value.area;
      b.classList.toggle(styles.active, on);
      b.setAttribute('aria-checked', String(on));
    });
    const visible = filterPapers(papers, value);
    list.innerHTML = visible.length
      ? visible.map((p) => renderPaper(p, modelNames)).join('')
      : `<li class="${styles.empty}">Ningún paper coincide con la búsqueda.</li>`;
  }

  root.addEventListener('click', (e) => {
    const area = e.target.closest('[data-area]')?.dataset.area;
    if (area) {
      value = { ...value, area };
      render();
    }
    const model = e.target.closest('[data-model]')?.dataset.model;
    if (model) onModel?.(model);
  });
  root.querySelector('input').addEventListener('input', (e) => {
    value = { ...value, query: e.target.value };
    render();
  });

  render();
  return { root };
}
