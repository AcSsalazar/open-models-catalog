# Catálogo de modelos abiertos

Página con modelos de machine learning y deep learning de pesos abiertos, pensada para saber cuáles se pueden correr en un equipo propio.

## Qué incluye

- 70 modelos en ocho categorías: texto, código, multimodal, imagen, video, visión, audio y embeddings.
- Por modelo: organización, tarea, parámetros, fecha, licencia, versiones de la familia, tamaño de los pesos (completo y cuantizado a 4 bits), VRAM y RAM mínimas estimadas, si corre en CPU y benchmarks publicados con su fuente.
- Links a Hugging Face, Kaggle, GitHub, Ollama y al paper cuando existen.
- Sección "Tu equipo": indicas tu RAM y VRAM y la tabla muestra qué modelos corren en GPU, en CPU o no alcanzan.
- Filtros por categoría, búsqueda, "solo los que corren en mi equipo" y orden por nombre, VRAM, parámetros o fecha.
- Sección "Nube gratuita": 17 plataformas con capa gratis (notebooks, Spaces, VM, créditos y APIs), con límites, beneficios para estudiantes y cuántos modelos caben en cada una. El botón "Usar en el catálogo" carga su GPU y RAM como tu equipo.
- Cada ficha indica en qué notebook o VM gratis cabe el modelo.
- Sección "Papers destacados": 26 papers que aplican estos modelos (voz, emociones faciales, salud, agro, accesibilidad y más), con resumen y enlace a los modelos del catálogo.
- Guía para estimar memoria según parámetros y precisión, con calculadora y un paso a paso para Colab o Kaggle.

## Sobre los datos

Los datos se verificaron en noviembre de 2026 en las fichas oficiales (Hugging Face, GitHub, documentación de cada proyecto):

- Tamaños de pesos: API de Hugging Face; los cuantizados, del archivo GGUF Q4_K_M.
- Benchmarks: solo cifras publicadas por la fuente oficial, cada una con su link. Si la fuente no publica cifras, la lista queda vacía.
- Requisitos de VRAM y RAM: estimaciones (pesos × 1.2 más margen de contexto). Cada ficha explica de dónde salen.
- Plataformas en la nube: cifras de la página oficial de cada una. Google no publica la GPU ni la RAM de Colab gratis; se usan los valores típicos (T4 de 15 GB, 12 GB de RAM) y se aclara en la nota.
- Papers: cada uno revisado en arXiv, ACL Anthology, ISCA, PMC o la editorial. Muchos usan una versión anterior del modelo (por ejemplo Whisper large-v2 o SAM 1); se indica en el texto.

Los modelos cambian rápido: antes de descargar uno, revisa su ficha y su licencia (varias son no comerciales).

## Desarrollo

```bash
npm install
npm run dev     # servidor local
npm test        # pruebas (incluye la validación de todos los datos)
npm run build   # compilación en dist/
```

## Estructura

```
src/
  components/   Interfaz, cada componente con su .module.css
  data/         Modelos por grupo en JSON e índice; cloud.json y papers.json
  lib/          Esquemas, filtros, cálculos de hardware y de nube
```

Para agregar un modelo, súmalo al JSON de su grupo en `src/data/` siguiendo el esquema de `src/lib/schema.js`. Las pruebas avisan si falta un campo o un dato no cuadra.

## Licencia

Código bajo MIT. La tipografía Computer Modern se distribuye bajo SIL OFL (ver `src/assets/fonts/OFL.txt`).
