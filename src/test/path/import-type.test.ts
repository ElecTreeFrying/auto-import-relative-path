import * as assert from 'assert';

import { determineImportType } from '../../path/import-type';

describe('determineImportType', () => {
  it('.js returns script', () => {
    assert.strictEqual(determineImportType('/project/src/app.js'), 'script');
  });

  it('.jsx returns script', () => {
    assert.strictEqual(determineImportType('/project/src/App.jsx'), 'script');
  });

  it('.ts returns script', () => {
    assert.strictEqual(determineImportType('/project/src/app.ts'), 'script');
  });

  it('.tsx returns script', () => {
    assert.strictEqual(determineImportType('/project/src/App.tsx'), 'script');
  });

  it('.vue returns script', () => {
    assert.strictEqual(determineImportType('/project/src/App.vue'), 'script');
  });

  it('.svelte returns script', () => {
    assert.strictEqual(determineImportType('/project/src/App.svelte'), 'script');
  });

  it('.astro returns script', () => {
    assert.strictEqual(determineImportType('/project/pages/home.astro'), 'script');
  });

  it('.css returns stylesheet', () => {
    assert.strictEqual(determineImportType('/project/styles/app.css'), 'stylesheet');
  });

  it('.scss returns null (SCSS-specific fallback)', () => {
    assert.strictEqual(determineImportType('/project/styles/theme.scss'), null);
  });

  it('.md returns markdown', () => {
    assert.strictEqual(determineImportType('/project/docs/readme.md'), 'markdown');
  });

  it('video extensions return video', () => {
    assert.strictEqual(determineImportType('/project/assets/clip.mp4'), 'video');
    assert.strictEqual(determineImportType('/project/assets/clip.webm'), 'video');
    assert.strictEqual(determineImportType('/project/assets/clip.mov'), 'video');
  });

  it('audio extensions return audio', () => {
    assert.strictEqual(determineImportType('/project/assets/track.mp3'), 'audio');
    assert.strictEqual(determineImportType('/project/assets/track.ogg'), 'audio');
    assert.strictEqual(determineImportType('/project/assets/track.wav'), 'audio');
    assert.strictEqual(determineImportType('/project/assets/track.m4a'), 'audio');
  });

  it('.vtt returns text-track', () => {
    assert.strictEqual(determineImportType('/project/assets/subs.vtt'), 'text-track');
  });

  it('.html returns null (defensive)', () => {
    assert.strictEqual(determineImportType('/project/pages/index.html'), null);
  });

  it('default catch-all returns image', () => {
    assert.strictEqual(determineImportType('/project/assets/logo.png'), 'image');
    assert.strictEqual(determineImportType('/project/data/config.json'), 'image');
    assert.strictEqual(determineImportType('/project/fonts/sans.woff'), 'image');
    assert.strictEqual(determineImportType('/project/docs/report.pdf'), 'image');
  });

  // LaTeX sources (.tex / .bib / .eps) all fall to the 'image' default — which is exactly why
  // snippets/languages/latex.ts dispatches on the raw extension instead of consulting ImportType.
  it('LaTeX source extensions fall to the image default (latex.ts branches on the raw extension)', () => {
    assert.strictEqual(determineImportType('/project/paper/intro.tex'), 'image');
    assert.strictEqual(determineImportType('/project/paper/refs.bib'), 'image');
    assert.strictEqual(determineImportType('/project/figures/diagram.eps'), 'image');
  });
});
