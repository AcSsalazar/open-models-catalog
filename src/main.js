import './styles/global.css';
import { createHardwareForm } from './components/HardwareForm.js';
import { createModelTable } from './components/ModelTable.js';
import { MODELS } from './data/index.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="app-header">
    <h1>Catálogo de modelos abiertos</h1>
    <p>Modelos de ML y deep learning con pesos abiertos, y qué hace falta para correrlos en local</p>
  </header>
  <main class="app-main" id="content"></main>
`;

const content = document.querySelector('#content');

const hardware = createHardwareForm(content, {
  onChange: () => update(),
});

const table = createModelTable(content);

function update() {
  table.render(MODELS, hardware.value);
}

update();
