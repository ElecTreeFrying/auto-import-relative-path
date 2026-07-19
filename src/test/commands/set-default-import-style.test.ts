import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executeSetDefaultImportStyle } from '../../commands/set-default-import-style';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

async function openFixture(relativePath: string): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  await vscode.window.showTextDocument(doc);
}

// set-default-import-style persists config or shows a toast — it never edits the document. The
// observable here is therefore "the command returns without opening the blocking QuickPick." Every
// scenario below takes an early-return branch (a rejection, or the no-configurable-style branch for a
// single-shape destination); the >=2-variant picker→persist path is the manual-QA boundary.
// completesPromptly resolving true proves no picker was shown (those branches return synchronously).
function completesPromptly(fn: () => Promise<void>, timeoutMs = 1500): Promise<boolean> {
  return Promise.race([
    fn().then(() => true),
    new Promise<boolean>(resolve => setTimeout(() => resolve(false), timeoutMs)),
  ]);
}

describe('executeSetDefaultImportStyle (branches up to the picker)', () => {
  afterEach(async () => {
    // Defensive: dismiss a picker if a branch ever unexpectedly reaches one, so it can't leak.
    await vscode.commands.executeCommand('workbench.action.closeQuickOpen');
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  it('no active editor returns immediately', async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    assert.strictEqual(await completesPromptly(() => executeSetDefaultImportStyle()), true);
  });

  const earlyReturn = (label: string, dest: string, clip: string) =>
    it(label, async () => {
      await openFixture(dest);
      await vscode.env.clipboard.writeText(clip.startsWith('/') ? clip : path.join(FIXTURE_ROOT, clip));
      assert.strictEqual(await completesPromptly(() => executeSetDefaultImportStyle()), true, label);
    });

  earlyReturn('empty clipboard', 'src/foo.ts', '/');
  earlyReturn('non-absolute path', 'src/foo.ts', 'relative/bar.ts');
  earlyReturn('path without extension', 'src/foo.ts', '/usr/local/bin/Makefile');
  earlyReturn('same-file', 'src/foo.ts', 'src/foo.ts');
  earlyReturn('source not found', 'src/foo.ts', 'src/does-not-exist.ts');
  earlyReturn('unsupported pair (.ts → .css)', 'styles/reset.css', 'src/bar.ts');
  // Single-shape destination: exactly one hardcoded variant → no-configurable-style branch, not the picker.
  earlyReturn('single-shape destination → no-configurable-style (.css → .html)', 'pages/index.html', 'styles/global.css');
  // A multi-selection clipboard reduces to its first copyable non-destination member; the .md → .md
  // primary lands in no-configurable-style — promptly, never the pre-fork blob-stat source-not-found
  // and never the picker.
  earlyReturn(
    'multi-path clipboard reduces to the primary member (.md → .md → no-configurable-style)',
    'docs/architecture.md',
    [ path.join(FIXTURE_ROOT, 'docs/guide.md'), path.join(FIXTURE_ROOT, 'docs/api-reference.md') ].join('\n'),
  );
});
