import * as assert from 'assert';

import { getFilePathInfoFromPaths } from '../../editor/file-path-info';

// getFilePathInfoFromPaths is the sync, no-clipboard entry point used by the drop provider. It is a
// pure composition of computeRelative + extractFileExtension (both tested under test/path/), so this
// just pins the composition: the './' prefix rule, '../' preservation, extension stripping from the
// path, and the separately-reported source/destination extensions. The async getFilePathInfo variant
// (clipboard + active editor) is left to the command/dispatch tests that exercise it transitively.
describe('editor/file-path-info', () => {
  describe('getFilePathInfoFromPaths (pure, drop-flow entry point)', () => {
    const cases = [
      {
        name: 'same-directory sibling gets the ./ prefix',
        source: '/w/src/bar.ts', dest: '/w/src/foo.ts',
        relativePath: './bar', sourceExt: '.ts', destExt: '.ts',
      },
      {
        name: 'parent-directory source keeps ../ without a redundant ./',
        source: '/w/bar.ts', dest: '/w/src/foo.ts',
        relativePath: '../bar', sourceExt: '.ts', destExt: '.ts',
      },
      {
        name: 'nested-down source keeps the subdirectory',
        source: '/w/src/lib/bar.ts', dest: '/w/src/foo.ts',
        relativePath: './lib/bar', sourceExt: '.ts', destExt: '.ts',
      },
      {
        name: 'extension is stripped from the path but reported on both ends',
        source: '/w/src/logo.png', dest: '/w/src/App.tsx',
        relativePath: './logo', sourceExt: '.png', destExt: '.tsx',
      },
    ];

    for (const c of cases) {
      it(c.name, () => {
        const info = getFilePathInfoFromPaths(c.source, c.dest);
        assert.strictEqual(info.relativePath, c.relativePath);
        assert.strictEqual(info.sourceFileExt, c.sourceExt);
        assert.strictEqual(info.destinationFileExt, c.destExt);
        assert.strictEqual(info.sourceFilePath, c.source);
        assert.strictEqual(info.destinationFilePath, c.dest);
      });
    }
  });
});
