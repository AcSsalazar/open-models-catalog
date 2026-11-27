import { describe, expect, it } from 'vitest';
import { renderPaper } from './Papers.js';
import PAPERS from '../data/papers.json';
import { MODELS } from '../data/index.js';

const names = Object.fromEntries(MODELS.map((m) => [m.id, m.name]));

describe('renderPaper', () => {
  it('enlaza los modelos del catálogo que usa', () => {
    for (const p of PAPERS) {
      const html = renderPaper(p, names);
      for (const id of p.models) expect(html, p.id).toContain(`data-model="${id}"`);
    }
  });

  it('escapa el texto', () => {
    const html = renderPaper({ ...PAPERS[0], title: '<img src=x>' }, names);
    expect(html).not.toContain('<img');
  });
});
