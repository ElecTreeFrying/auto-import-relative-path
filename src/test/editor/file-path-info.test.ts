import * as assert from 'assert';

import { filterCopyablePaths, getFilePathInfoFromPaths, parseClipboardPaths } from '../../editor/file-path-info';

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

  // The clipboard is the copy → paste data channel; VS Code's built-in `copyFilePath` newline-joins
  // an Explorer multi-selection into it. parseClipboardPaths is the shared line parser (copy, paste,
  // and the picker commands); filterCopyablePaths mirrors the single-path copy validation
  // (absolute + extensioned) member by member for the multi-select copy.
  describe('parseClipboardPaths (clipboard → path lines)', () => {
    it('returns a single trimmed line for a single-path clipboard', () => {
      assert.deepStrictEqual(parseClipboardPaths('/w/src/foo.ts'), [ '/w/src/foo.ts' ]);
      assert.deepStrictEqual(parseClipboardPaths('  /w/src/foo.ts \n'), [ '/w/src/foo.ts' ]);
    });

    it('splits a multi-select clipboard on \\n and \\r\\n', () => {
      assert.deepStrictEqual(
        parseClipboardPaths('/w/a.ts\n/w/b.ts\r\n/w/c.ts'),
        [ '/w/a.ts', '/w/b.ts', '/w/c.ts' ],
      );
    });

    it('drops blank lines between and around paths', () => {
      assert.deepStrictEqual(parseClipboardPaths('\n/w/a.ts\n\n/w/b.ts\n\n'), [ '/w/a.ts', '/w/b.ts' ]);
    });

    it('returns [] for an empty or whitespace-only clipboard', () => {
      assert.deepStrictEqual(parseClipboardPaths(''), []);
      assert.deepStrictEqual(parseClipboardPaths('  \n \r\n '), []);
    });
  });

  describe('filterCopyablePaths (copy-side member validation)', () => {
    it('keeps absolute paths that carry a file extension', () => {
      assert.deepStrictEqual(
        filterCopyablePaths([ '/w/a.ts', '/w/img/logo.svg' ]),
        [ '/w/a.ts', '/w/img/logo.svg' ],
      );
    });

    it('drops relative paths', () => {
      assert.deepStrictEqual(filterCopyablePaths([ 'src/a.ts', './b.ts', '/w/c.ts' ]), [ '/w/c.ts' ]);
    });

    it('drops extensionless members (LICENSE, Makefile) while keeping the rest', () => {
      assert.deepStrictEqual(
        filterCopyablePaths([ '/w/LICENSE', '/w/a.ts', '/w/Makefile' ]),
        [ '/w/a.ts' ],
      );
    });

    it('returns [] when no member is copyable', () => {
      assert.deepStrictEqual(filterCopyablePaths([ '/w/LICENSE', 'relative.ts' ]), []);
    });
  });
});
