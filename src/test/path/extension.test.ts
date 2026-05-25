import * as assert from 'assert';

import { extractFileExtension, removeFileExtension } from '../../path/extension';

describe('extractFileExtension', () => {
  it('returns the extension for common file types', () => {
    assert.strictEqual(extractFileExtension('/project/src/app.ts'), '.ts');
    assert.strictEqual(extractFileExtension('/project/src/app.js'), '.js');
    assert.strictEqual(extractFileExtension('/project/styles/main.css'), '.css');
    assert.strictEqual(extractFileExtension('/project/styles/main.scss'), '.scss');
    assert.strictEqual(extractFileExtension('/project/pages/index.html'), '.html');
    assert.strictEqual(extractFileExtension('/project/assets/logo.png'), '.png');
    assert.strictEqual(extractFileExtension('/project/src/App.vue'), '.vue');
    assert.strictEqual(extractFileExtension('/project/src/Layout.astro'), '.astro');
  });

  it('extracts only the last extension from compound filenames', () => {
    assert.strictEqual(extractFileExtension('/project/styles/foo.module.css'), '.css');
    assert.strictEqual(extractFileExtension('/project/styles/bar.module.scss'), '.scss');
  });

  it('returns empty string for paths without an extension', () => {
    assert.strictEqual(extractFileExtension('/project/Makefile'), '');
    assert.strictEqual(extractFileExtension('/project/src/noext'), '');
  });
});

describe('removeFileExtension', () => {
  it('strips the trailing extension from a full path', () => {
    assert.strictEqual(removeFileExtension('/project/src/app.ts'), '/project/src/app');
    assert.strictEqual(removeFileExtension('/project/styles/main.css'), '/project/styles/main');
  });

  it('preserves compound filename prefixes', () => {
    assert.strictEqual(
      removeFileExtension('/project/styles/foo.module.css'),
      '/project/styles/foo.module'
    );
  });

  it('returns empty string for no-extension path (slice(0, -0) quirk)', () => {
    assert.strictEqual(removeFileExtension('/project/Makefile'), '');
  });
});
