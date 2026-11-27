import styles from './Contents.module.css';

const slug = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^\d+\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Índice tipo \tableofcontents a partir de los h2 de las secciones. */
export function createContents(container, sectionsRoot) {
  const headings = [...sectionsRoot.querySelectorAll('section h2')];
  const items = headings.map((h) => {
    h.id ||= slug(h.textContent);
    const [, num = '', title = h.textContent] = h.textContent.match(/^(\d+)\s+(.*)$/) ?? [];
    return { id: h.id, num, title };
  });

  const nav = document.createElement('nav');
  nav.className = styles.contents;
  nav.setAttribute('aria-label', 'Contenido');
  nav.innerHTML = `
    <p class="${styles.title}">Contenido</p>
    <ol class="${styles.list}">
      ${items.map((i) => `<li><a href="#${i.id}"><span class="${styles.num}">${i.num}</span>${i.title}</a></li>`).join('')}
    </ol>
  `;
  container.prepend(nav);
  return { root: nav, items };
}
