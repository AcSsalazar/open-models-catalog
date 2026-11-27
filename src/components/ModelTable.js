import styles from './ModelTable.module.css';
import { CATEGORIES } from '../lib/schema.js';
import { fitsHardware, formatGB, formatParams } from '../lib/hardware.js';
import { escapeHtml } from '../lib/html.js';
import { toggleDetail } from './ModelDetail.js';

const FIT_LABEL = {
  gpu: 'Sí, en GPU',
  cpu: 'Sí, en CPU',
  no: 'No alcanza',
  desconocido: 'Sin datos',
};

function weightsCell(w = {}) {
  if (w.q4GB != null) return `${formatGB(w.fullGB)} / ${formatGB(w.q4GB)}`;
  return formatGB(w.fullGB);
}

/** Tabla del catálogo. render(models, hardware) la vuelve a dibujar. */
export function createModelTable(container, { onSelect } = {}) {
  let current = [];
  const root = document.createElement('section');
  root.className = styles.section;
  root.innerHTML = `
    <h2 class="${styles.title}">2 Catálogo</h2>
    <div data-slot="filters"></div>
    <p class="${styles.count}" data-role="count"></p>
    <div class="${styles.scroll}">
      <table class="${styles.table}">
        <thead>
          <tr>
            <th>Modelo</th>
            <th>Categoría y tarea</th>
            <th class="${styles.num}">Parám.</th>
            <th class="${styles.num}" title="Tamaño completo / cuantizado a 4 bits">Pesos</th>
            <th class="${styles.num}">VRAM mín.</th>
            <th class="${styles.num}">RAM mín.</th>
            <th>Licencia</th>
            <th>¿Corre en tu equipo?</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;
  container.append(root);
  const tbody = root.querySelector('tbody');

  function render(models, hardware) {
    current = models;
    root.querySelector('[data-role="count"]').textContent =
      `${models.length} ${models.length === 1 ? 'modelo' : 'modelos'}. Pesos: tamaño completo / cuantizado a 4 bits.`;

    if (!models.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="${styles.empty}">Ningún modelo cumple los filtros.</td></tr>`;
      return;
    }

    tbody.innerHTML = models
      .map((m) => {
        const fit = fitsHardware(m, hardware);
        const r = m.requirements ?? {};
        return `
        <tr class="${styles.row}" data-id="${escapeHtml(m.id)}" aria-expanded="false" title="Ver ficha">
          <td><span class="${styles.name}">${escapeHtml(m.name)}</span><span class="${styles.org}">${escapeHtml(m.org)}</span></td>
          <td>${CATEGORIES[m.category]}. ${escapeHtml(m.task)}</td>
          <td class="${styles.num}">${formatParams(m.paramsB)}</td>
          <td class="${styles.num}">${weightsCell(m.weights)}</td>
          <td class="${styles.num}">${r.minVramGB === 0 ? 'No requiere' : formatGB(r.minVramGB)}</td>
          <td class="${styles.num}">${formatGB(r.minRamGB)}</td>
          <td class="${styles.license}">${escapeHtml(m.license)}</td>
          <td class="${styles[fit] ?? ''}">${FIT_LABEL[fit]}</td>
        </tr>`;
      })
      .join('');
  }

  tbody.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    const row = e.target.closest('[data-id]');
    if (!row) return;
    const model = current.find((m) => m.id === row.dataset.id);
    if (model) toggleDetail(row, model, 8);
    onSelect?.(row.dataset.id, row);
  });

  /** Abre la ficha del modelo (si está visible) y la lleva a la vista. */
  function open(id) {
    const row = tbody.querySelector(`[data-id="${CSS.escape(id)}"]`);
    const model = current.find((m) => m.id === id);
    if (!row || !model) return false;
    if (row.getAttribute('aria-expanded') !== 'true') toggleDetail(row, model, 8);
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  return { root, render, open, slot: (name) => root.querySelector(`[data-slot="${name}"]`) };
}
