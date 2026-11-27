import styles from './Guide.module.css';
import { BYTES_PER_PARAM, estimateMemoryGB, formatGB } from '../lib/hardware.js';

const PRECISIONS = [
  ['bf16', 'bf16 / fp16 (completo)'],
  ['int8', '8 bits'],
  ['q4', '4 bits (Q4_K_M)'],
];

const EXAMPLES = [1, 3, 8, 14, 32, 70];

const TOOLS = [
  ['Ollama', 'https://ollama.com', 'la forma más simple de correr LLMs y VLMs cuantizados.'],
  ['llama.cpp', 'https://github.com/ggml-org/llama.cpp', 'motor en C/C++ que corre modelos GGUF en CPU y GPU.'],
  ['LM Studio', 'https://lmstudio.ai', 'aplicación de escritorio para probar LLMs sin programar.'],
  ['Diffusers', 'https://huggingface.co/docs/diffusers', 'librería de Hugging Face para imagen y video, con offload a CPU.'],
  ['ComfyUI', 'https://github.com/comfyanonymous/ComfyUI', 'interfaz por nodos para flujos de imagen y video.'],
  ['Transformers', 'https://huggingface.co/docs/transformers', 'librería base para casi todos los modelos del catálogo.'],
];

/** Sección 3: cómo se estiman los requisitos, con una calculadora. */
export function createGuide(container) {
  const root = document.createElement('section');
  root.className = styles.guide;
  root.innerHTML = `
    <h2 class="${styles.title}">4 Cómo leer los requisitos</h2>
    <p>
      La memoria que necesita un modelo depende casi solo de cuántos parámetros tiene y de con cuántos bits se guarda cada uno.
      A eso se suma un margen para las activaciones y, en los modelos de lenguaje, para la caché del contexto. Una regla útil es:
    </p>
    <div class="${styles.equation}">
      <span><em>M</em> &asymp; 1.2 &times; <em>P</em> &times; <em>b</em></span>
      <span class="${styles.number}">(1)</span>
    </div>
    <p>
      donde <em>M</em> es la memoria en GB, <em>P</em> la cantidad de parámetros en miles de millones y <em>b</em> los bytes por parámetro:
      ${BYTES_PER_PARAM.bf16} en bf16, ${BYTES_PER_PARAM.int8} en 8 bits y cerca de ${BYTES_PER_PARAM.q4} con cuantización de 4 bits.
      La tabla 1 aplica la ecuación (1) a tamaños comunes.
    </p>
    <table class="${styles.table}">
      <thead><tr><th>Parámetros</th><th>bf16</th><th>8 bits</th><th>4 bits</th></tr></thead>
      <tbody>
        ${EXAMPLES.map(
          (p) => `<tr><td>${p}B</td><td>${formatGB(estimateMemoryGB(p, 'bf16'))}</td><td>${formatGB(estimateMemoryGB(p, 'int8'))}</td><td>${formatGB(estimateMemoryGB(p, 'q4'))}</td></tr>`,
        ).join('')}
      </tbody>
    </table>
    <p><small>Tabla 1: memoria aproximada según la ecuación (1). Contextos largos pueden sumar varios GB.</small></p>

    <h3 class="${styles.subtitle}">Calculadora</h3>
    <div class="${styles.calc}">
      <label>Parámetros <input type="number" min="0" step="0.1" value="8" data-role="params" /> B</label>
      <label>Precisión
        <select data-role="precision">
          ${PRECISIONS.map(([id, label]) => `<option value="${id}" ${id === 'q4' ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </label>
      <span>Memoria: <span class="${styles.result}" data-role="result"></span></span>
    </div>

    <h3 class="${styles.subtitle}">GPU o CPU</h3>
    <p>
      Si el modelo cabe en la VRAM de la GPU, corre rápido. Si no cabe pero sí en la RAM, muchos modelos de lenguaje funcionan en CPU,
      aunque varias veces más lento. Los modelos de imagen y video casi siempre necesitan GPU; con <em>offload</em> pueden usar menos VRAM
      a cambio de tardar más. Los valores del catálogo son estimaciones razonables, no garantías: cada ficha explica de dónde salen.
    </p>

    <h3 class="${styles.subtitle}">Herramientas para correrlos</h3>
    <ul class="${styles.tools}">
      ${TOOLS.map(([name, url, text]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>: ${text}</li>`).join('')}
    </ul>
  `;
  container.append(root);

  const params = root.querySelector('[data-role="params"]');
  const precision = root.querySelector('[data-role="precision"]');
  const result = root.querySelector('[data-role="result"]');

  function calc() {
    const p = Number(params.value);
    result.textContent = Number.isFinite(p) && p > 0 ? formatGB(estimateMemoryGB(p, precision.value)) : '-';
  }

  params.addEventListener('input', calc);
  precision.addEventListener('change', calc);
  calc();
  return { root };
}
