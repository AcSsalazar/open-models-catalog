import './styles/global.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="app-header">
    <h1>Catálogo de modelos abiertos</h1>
    <p>Modelos de ML y deep learning con pesos abiertos, y qué hace falta para correrlos en local</p>
  </header>
  <main class="app-main" id="content"></main>
`;
