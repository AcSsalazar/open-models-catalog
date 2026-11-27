import styles from './HardwareForm.module.css';

const KEY = 'open-models:hardware';

export const PRESETS = [
  { label: 'Laptop sin GPU (16 GB)', ramGB: 16, vramGB: 0 },
  { label: 'PC con GPU de 8 GB', ramGB: 16, vramGB: 8 },
  { label: 'GPU de 12 GB', ramGB: 32, vramGB: 12 },
  { label: 'GPU de 24 GB', ramGB: 64, vramGB: 24 },
];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Number.isFinite(saved.ramGB) && Number.isFinite(saved.vramGB)) return saved;
  } catch {
    // Sin almacenamiento o dato dañado: se usan los valores por defecto.
  }
  return { ramGB: 16, vramGB: 8 };
}

function save(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // El valor dura solo esta visita.
  }
}

/** Formulario "Tu equipo": RAM y VRAM disponibles. */
export function createHardwareForm(container, { onChange } = {}) {
  let value = load();

  const root = document.createElement('section');
  root.className = styles.form;
  root.innerHTML = `
    <h2 class="${styles.title}">1 Tu equipo</h2>
    <p class="${styles.lead}">Indica la memoria de tu computador para ver qué modelos puedes correr.</p>
    <div class="${styles.fields}">
      <label class="${styles.field}">RAM <input type="number" min="0" max="2048" step="1" data-key="ramGB" /> GB</label>
      <label class="${styles.field}">VRAM (GPU) <input type="number" min="0" max="1024" step="1" data-key="vramGB" /> GB</label>
    </div>
    <div class="${styles.presets}">
      Ejemplos:
      ${PRESETS.map((p, i) => `<button type="button" class="${styles.preset}" data-preset="${i}">${p.label}</button>`).join('')}
    </div>
  `;
  container.append(root);

  const inputs = root.querySelectorAll('input');

  function paint() {
    inputs.forEach((input) => (input.value = value[input.dataset.key]));
  }

  function set(next) {
    value = { ...value, ...next };
    save(value);
    paint();
    onChange?.(value);
  }

  inputs.forEach((input) =>
    input.addEventListener('input', () => {
      const n = Number(input.value);
      if (Number.isFinite(n) && n >= 0) {
        value = { ...value, [input.dataset.key]: n };
        save(value);
        onChange?.(value);
      }
    }),
  );

  root.addEventListener('click', (e) => {
    const i = e.target.closest('[data-preset]')?.dataset.preset;
    if (i == null) return;
    const { ramGB, vramGB } = PRESETS[i];
    set({ ramGB, vramGB });
  });

  paint();
  return {
    get value() {
      return value;
    },
  };
}
