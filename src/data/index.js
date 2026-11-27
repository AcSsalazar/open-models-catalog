import textoCodigo from './texto-codigo.json';
import imagenVideoVision from './imagen-video-vision.json';
import audio from './audio.json';
import multimodalEmbeddings from './multimodal-embeddings.json';
import { CATEGORIES } from '../lib/schema.js';

const order = Object.keys(CATEGORIES);

/** Todos los modelos, ordenados por categoría y luego por nombre. */
export const MODELS = [...textoCodigo, ...imagenVideoVision, ...audio, ...multimodalEmbeddings].sort(
  (a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.name.localeCompare(b.name),
);
