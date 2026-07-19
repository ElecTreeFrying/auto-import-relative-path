import * as assert from 'assert';

import { extractFileExtension, removeFileExtension } from '../../path/extension';

describe('extension', () => {
  describe('extractFileExtension', () => {
    it('extracts common file extensions', () => {
      assert.strictEqual(extractFileExtension('/project/src/foo.ts'), '.ts');
      assert.strictEqual(extractFileExtension('/project/src/bar.js'), '.js');
      assert.strictEqual(extractFileExtension('/project/styles/app.css'), '.css');
      assert.strictEqual(extractFileExtension('/project/styles/theme.scss'), '.scss');
      assert.strictEqual(extractFileExtension('/project/pages/index.html'), '.html');
      assert.strictEqual(extractFileExtension('/project/assets/logo.png'), '.png');
      assert.strictEqual(extractFileExtension('/project/components/App.vue'), '.vue');
      assert.strictEqual(extractFileExtension('/project/pages/home.astro'), '.astro');
    });

    it('extracts only the last extension from compound filenames', () => {
      assert.strictEqual(extractFileExtension('/project/styles/foo.module.css'), '.css');
    });

    it('returns empty string for extensionless path', () => {
      assert.strictEqual(extractFileExtension('Makefile'), '');
    });
  });

  describe('removeFileExtension', () => {
    it('strips trailing extension from full path', () => {
      assert.strictEqual(removeFileExtension('/project/src/foo.ts'), '/project/src/foo');
    });

    it('preserves path up to last dot for compound filenames', () => {
      assert.strictEqual(removeFileExtension('/project/styles/app.module.css'), '/project/styles/app.module');
    });

    it('keeps the whole name for an extensionless path (guarded against the slice(0,-0) quirk)', () => {
      assert.strictEqual(removeFileExtension('Makefile'), 'Makefile');
      assert.strictEqual(removeFileExtension('/repo/LICENSE'), '/repo/LICENSE');
    });
  });
});
