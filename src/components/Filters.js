import styles from './Filters.module.css';
import { CATEGORIES } from '../lib/schema.js';
import { countByCategory, DEFAULT_FILTERS } from '../lib/filter.js';

/** Filtros del catálogo: categoría y búsqueda. */
export function createFilters(container, { models, onChange }) {
  let value = { ...DEFAULT_FILTERS };
  const counts = countByCategory(models);
  const categories = [['todas', 'Todas', models.length], ...Object.entries(CATEGORIES).map(([id, label]) => [id, label, counts[id] ?? 0])].filter(
    ([, , n]) => n > 0,
  );

  const root = document.createElement('div');
  root.className = styles.filters;
  root.innerHTML = `
    <div class="${styles.categories}" role="radiogroup" aria-label="Categoría">
      ${categories
        .map(([id, label, n]) => `<button type="button" class="${styles.category}" data-category="${id}">${label}<sup>${n}</sup></button>`)
        .join('')}
    </div>
    <div class="${styles.row}" data-slot="row">
      <input type="search" class="${styles.search}" placeholder="Buscar por nombre, organización, tarea o licencia" aria-label="Buscar" />
    </div>
  `;
  container.append(root);

  function paint() {
    root.querySelectorAll('[data-category]').forEach((b) => {
      const on = b.dataset.category === value.category;
      b.classList.toggle(styles.active, on);
      b.setAttribute('aria-checked', String(on));
    });
  }

  function set(next) {
    value = { ...value, ...next };
    paint();
    onChange?.(value);
  }

  root.addEventListener('click', (e) => {
    const category = e.target.closest('[data-category]')?.dataset.category;
    if (category) set({ category });
  });
  root.querySelector('input[type="search"]').addEventListener('input', (e) => set({ query: e.target.value }));

  paint();
  return {
    root,
    styles,
    get value() {
      return value;
    },
    set,
    slot: (name) => root.querySelector(`[data-slot="${name}"]`),
  };
}
