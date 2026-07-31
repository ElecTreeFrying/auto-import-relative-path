import * as assert from 'assert';
import { posix as nodePosix } from 'path';

import * as shim from '../../path/_browser';

/**
 * The web bundle swaps Node's `path` for `path/_browser.ts` (see esbuild.js). These
 * tests exist so that swap stays invisible: every member the extension calls must
 * behave identically to Node's own `path.posix`, or vscode.dev silently generates
 * different import paths than the desktop build does.
 *
 * The comparison is differential rather than golden — hard-coded expectations would
 * only re-state whatever the shim happens to do. Node is the oracle.
 */

/** Directories the extension realistically resolves against. */
const DIRECTORIES = [
  '/repo',
  '/repo/src',
  '/repo/src/components',
  '/repo/src/components/ui',
  '/repo/a/b/c/d/e',
  '/repo/src/very/deep/nested/dir',
  '/x',
  '/',
];

/** Basenames chosen for their edge cases, not their realism. */
const BASENAMES = [
  'index.ts',
  'Button.tsx',
  'my-logo.v2.svg',
  'styles.module.scss',
  'a.b.c.d.ts',
  'LICENSE',          // extensionless — must survive whole
  'Dockerfile',       // extensionless
  'Makefile',         // extensionless
  '.gitignore',       // leading dot is a hidden file, NOT an extension
  'x.',               // trailing dot
  'noext',
  'café-menu.png',    // non-ASCII
  '404.png',          // leading digit
  'BaseCard.vue',
  'main.tex',
];

const PATHS: string[] = [];
for (const dir of DIRECTORIES) {
  for (const base of BASENAMES) {
    PATHS.push(dir === '/' ? `/${base}` : `${dir}/${base}`);
  }
}
// Shapes that are awkward rather than typical.
PATHS.push('/', '/repo/', '/repo//src//index.ts', '/repo/./src/index.ts', '/repo/src/../src/index.ts');

describe('path/_browser (web bundle shim)', () => {
  describe('agrees with Node path.posix', () => {
    it('basename', () => {
      for (const p of PATHS) {
        assert.strictEqual(shim.basename(p), nodePosix.basename(p), `basename(${p})`);
      }
    });

    it('extname', () => {
      for (const p of PATHS) {
        assert.strictEqual(shim.extname(p), nodePosix.extname(p), `extname(${p})`);
      }
    });

    it('dirname', () => {
      for (const p of PATHS) {
        assert.strictEqual(shim.dirname(p), nodePosix.dirname(p), `dirname(${p})`);
      }
    });

    it('isAbsolute', () => {
      for (const p of PATHS) {
        assert.strictEqual(shim.isAbsolute(p), nodePosix.isAbsolute(p), `isAbsolute(${p})`);
      }
    });

    it('parse', () => {
      for (const p of PATHS) {
        assert.deepStrictEqual(shim.parse(p), nodePosix.parse(p), `parse(${p})`);
      }
    });

    // The one that actually decides what gets written into the editor: every
    // destination directory against every source file, the shape computeRelative uses.
    it('relative, across every directory-to-file pair', () => {
      for (const from of PATHS) {
        const fromDir = nodePosix.dirname(from);
        for (const to of PATHS) {
          assert.strictEqual(
            shim.relative(fromDir, to),
            nodePosix.relative(fromDir, to),
            `relative(${fromDir}, ${to})`,
          );
        }
      }
    });
  });

  // These restate invariants the extension's own behaviour depends on, so a shim
  // change that broke them would fail here with a readable message rather than
  // surfacing as a wrong import path three layers up.
  describe('holds the invariants the import engine relies on', () => {
    it('treats a leading dot as a hidden file, not an extension', () => {
      assert.strictEqual(shim.extname('/repo/.gitignore'), '');
      assert.strictEqual(shim.parse('/repo/.gitignore').name, '.gitignore');
    });

    it('reports no extension for extensionless sources', () => {
      for (const name of [ 'LICENSE', 'Dockerfile', 'Makefile' ]) {
        assert.strictEqual(shim.extname(`/repo/${name}`), '', name);
      }
    });

    it('returns only the final extension of a compound filename', () => {
      assert.strictEqual(shim.extname('/repo/styles.module.scss'), '.scss');
      assert.strictEqual(shim.extname('/repo/my-logo.v2.svg'), '.svg');
    });

    it('returns a bare name for a same-directory target, so the ./ prefix rule applies', () => {
      assert.strictEqual(shim.relative('/repo/src', '/repo/src/Button.tsx'), 'Button.tsx');
    });

    it('walks up with .. for a parent-directory target', () => {
      assert.strictEqual(shim.relative('/repo/src/components', '/repo/src/index.ts'), '../index.ts');
      assert.strictEqual(shim.relative('/repo/a/b/c', '/repo/x.ts'), '../../../x.ts');
    });

    it('returns an empty string when source and destination directory coincide', () => {
      assert.strictEqual(shim.relative('/repo/src', '/repo/src'), '');
    });
  });
});
