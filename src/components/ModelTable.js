import styles from './ModelTable.module.css';
import { CATEGORIES } from '../lib/schema.js';
import { fitsHardware, formatGB, formatParams } from '../lib/hardware.js';
import { escapeHtml } from '../lib/html.js';

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
        <tr class="${styles.row}" data-id="${escapeHtml(m.id)}">
          <td><span class="${styles.name}">${escapeHtml(m.name)}</span><span class="${styles.org}">${escapeHtml(m.org)}</span></td>
          <td>${CATEGORIES[m.category]}. ${escapeHtml(m.task)}</td>
          <td class="${styles.num}">${formatParams(m.paramsB)}</td>
          <td class="${styles.num}">${weightsCell(m.weights)}</td>
          <td class="${styles.num}">${r.minVramGB === 0 ? 'No usa' : formatGB(r.minVramGB)}</td>
          <td class="${styles.num}">${formatGB(r.minRamGB)}</td>
          <td class="${styles.license}">${escapeHtml(m.license)}</td>
          <td class="${styles[fit] ?? ''}">${FIT_LABEL[fit]}</td>
        </tr>`;
      })
      .join('');
  }

  tbody.addEventListener('click', (e) => {
    const row = e.target.closest('[data-id]');
    if (row) onSelect?.(row.dataset.id, row);
  });

  return { root, render, slot: (name) => root.querySelector(`[data-slot="${name}"]`) };
}
