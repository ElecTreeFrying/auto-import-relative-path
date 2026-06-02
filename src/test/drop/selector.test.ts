import * as assert from 'assert';
import * as vscode from 'vscode';

import { DROP_LANGUAGE_SELECTORS } from '../../drop/selector';

// The drop provider must register for every supported destination language. This is step 8 of the
// "adding a destination language" checklist (snippets/CLAUDE.md) — a list that lives apart from the
// four-site extension sync because selectors are keyed on VS Code language IDs, not file extensions.
// Pin it so a new language can't ship drag-and-drop support without a matching selector entry.
const EXPECTED_LANGUAGES = [
  'javascript', 'javascriptreact', 'typescript', 'typescriptreact',
  'css', 'scss', 'html', 'markdown', 'vue', 'svelte', 'astro', 'mdx',
];

describe('drop/selector', () => {
  const selectors = DROP_LANGUAGE_SELECTORS as ReadonlyArray<vscode.DocumentFilter>;

  it('registers exactly the 12 supported destination languages', () => {
    assert.strictEqual(selectors.length, 12);
    assert.deepStrictEqual(
      selectors.map(s => s.language).sort(),
      [ ...EXPECTED_LANGUAGES ].sort(),
    );
  });

  it('restricts every selector to on-disk files (scheme: file)', () => {
    for (const s of selectors) {
      assert.strictEqual(s.scheme, 'file', `language ${s.language} should be scheme:'file'`);
    }
  });
});
