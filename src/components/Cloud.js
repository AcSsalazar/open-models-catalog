import styles from './Cloud.module.css';
import { PLATFORM_TYPES, cloudFit, runsOwnWeights } from '../lib/cloud.js';
import { formatGB } from '../lib/hardware.js';
import { escapeHtml } from '../lib/html.js';

function link(url, label) {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function hardwareCell(p) {
  if (!runsOwnWeights(p)) return '-';
  const gpu = p.gpu ? `${escapeHtml(p.gpu)}, ${formatGB(p.vramGB)}` : 'Sin GPU';
  return p.ramGB != null ? `${gpu}<br /><span class="${styles.muted}">RAM ${formatGB(p.ramGB)}</span>` : gpu;
}

function fitCount(p, models) {
  if (!runsOwnWeights(p)) return '-';
  const fits = models.filter((m) => ['gpu', 'cpu'].includes(cloudFit(m, p))).length;
  return `${fits} de ${models.length}`;
}

/**
 * Sección "Nube gratuita": plataformas con capa gratis, agrupadas por tipo.
 * onUse(platform) se llama al elegir "Usar en el catálogo".
 */
export function createCloud(container, { platforms, models, onUse } = {}) {
  const root = document.createElement('section');
  root.className = styles.cloud;

  const groups = Object.entries(PLATFORM_TYPES)
    .map(([type, label]) => [label, platforms.filter((p) => p.type === type)])
    .filter(([, list]) => list.length);

  root.innerHTML = `
    <h2 class="${styles.title}">3 Nube gratuita</h2>
    <p class="${styles.lead}">
      Si tu equipo no alcanza, estas plataformas tienen una capa gratuita para probar modelos abiertos. Los notebooks y las máquinas
      virtuales cargan los pesos como en local; la columna <em>Caben</em> cuenta cuántos modelos del catálogo corren en su capa gratis.
      Las APIs no cargan pesos propios, pero dan acceso gratuito a varios modelos abiertos ya instalados.
    </p>
    <div class="${styles.scroll}">
      <table class="${styles.table}">
        <thead>
          <tr>
            <th>Plataforma</th>
            <th>Qué es gratis</th>
            <th>GPU y memoria</th>
            <th class="${styles.num}">Caben</th>
          </tr>
        </thead>
        ${groups
          .map(
            ([label, list]) => `
          <tbody>
            <tr class="${styles.group}"><th colspan="4">${label}</th></tr>
            ${list
              .map(
                (p) => `
              <tr data-id="${escapeHtml(p.id)}">
                <td>
                  <span class="${styles.name}">${link(p.url, p.name)}</span>
                  <span class="${styles.muted}">${escapeHtml(p.provider)}</span>
                </td>
                <td>
                  ${escapeHtml(p.free)}
                  <span class="${styles.small}">${escapeHtml(p.limits)}${p.requiresCard ? ' Pide tarjeta.' : ''}</span>
                  ${p.students ? `<span class="${styles.small}"><em>Estudiantes:</em> ${escapeHtml(p.students)}</span>` : ''}
                  ${p.notes ? `<span class="${styles.small}">${escapeHtml(p.notes)}</span>` : ''}
                  <span class="${styles.small}">Fuente: ${link(p.source, new URL(p.source).hostname.replace(/^www\./, ''))}</span>
                </td>
                <td>${hardwareCell(p)}</td>
                <td class="${styles.num}">
                  ${fitCount(p, models)}
                  ${runsOwnWeights(p) && onUse ? `<button type="button" class="${styles.use}" data-use="${escapeHtml(p.id)}">Usar en el catálogo</button>` : ''}
                </td>
              </tr>`,
              )
              .join('')}
          </tbody>`,
          )
          .join('')}
      </table>
    </div>
    <p class="${styles.small}">Las capas gratuitas cambian seguido: revisa la página de cada plataforma antes de depender de ella.</p>
  `;
  container.append(root);

  root.addEventListener('click', (e) => {
    const id = e.target.closest('[data-use]')?.dataset.use;
    const platform = id && platforms.find((p) => p.id === id);
    if (platform) onUse?.(platform);
  });

  return { root };
}
