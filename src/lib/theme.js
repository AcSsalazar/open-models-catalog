const KEY = 'open-models:theme';

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Botón para alternar claro/oscuro. Sin preferencia guardada sigue al sistema. */
export function createThemeToggle(container) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  container.append(button);

  let theme = read() ?? systemTheme();

  function apply() {
    document.documentElement.dataset.theme = theme;
    button.textContent = theme === 'dark' ? 'modo claro' : 'modo oscuro';
  }

  button.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // Sin almacenamiento: el tema dura solo esta visita.
    }
    apply();
  });

  apply();
  return { get theme() { return theme; } };
}
