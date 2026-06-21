import * as assert from 'assert';
import * as vscode from 'vscode';

import { DROP_LANGUAGE_SELECTORS } from '../../drop/selector';

// The drop provider must register for every supported destination. This is step 8 of the "adding a
// destination language" checklist (snippets/CLAUDE.md). Eleven destinations are matched by their VS Code
// language ID; `.mdx` and `.tex` are matched by file PATTERN — VS Code ships no `mdx`/LaTeX language we
// can rely on, so those files may open as plaintext, which a language-ID selector would miss (the drop
// would then fall back to VS Code's raw-path insert). The glob matches the file regardless of language,
// mirroring how the paste commands key off `path.extname`. Pin all three so a new destination can't ship
// drag-and-drop without a matching selector entry.
const EXPECTED_LANGUAGES = [
  'javascript', 'javascriptreact', 'typescript', 'typescriptreact',
  'css', 'scss', 'html', 'markdown', 'vue', 'svelte', 'astro',
];

describe('drop/selector', () => {
  const selectors = DROP_LANGUAGE_SELECTORS as ReadonlyArray<vscode.DocumentFilter>;

  it('registers all 13 destinations — 11 by language ID, `.mdx` and `.tex` by file pattern', () => {
    assert.strictEqual(selectors.length, 13);

    const languages = selectors.map(s => s.language).filter(Boolean).sort();
    assert.deepStrictEqual(languages, [ ...EXPECTED_LANGUAGES ].sort());

    const patterns = selectors.map(s => s.pattern).filter(Boolean);
    assert.deepStrictEqual(
      patterns,
      [ '**/*.mdx', '**/*.tex' ],
      '`.mdx` and `.tex` must be matched by file pattern, not language ID',
    );
  });

  it('restricts every selector to on-disk files (scheme: file)', () => {
    for (const s of selectors) {
      assert.strictEqual(s.scheme, 'file', `selector ${s.language ?? s.pattern} should be scheme:'file'`);
    }
  });
});
