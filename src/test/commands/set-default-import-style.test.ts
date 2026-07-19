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
  // F3 accept path: an extensionless source into a .md destination is a single hardcoded link variant,
  // so it lands in no-configurable-style — promptly, never the picker.
  earlyReturn('extensionless → .md → no-configurable-style (single-shape link)', 'docs/guide.md', 'LICENSE');
  // A multi-selection clipboard reduces to its first copyable non-destination member; the .md → .md
  // primary lands in no-configurable-style — promptly, never the pre-fork blob-stat source-not-found
  // and never the picker.
  earlyReturn(
    'multi-path clipboard reduces to the primary member (.md → .md → no-configurable-style)',
    'docs/architecture.md',
    [ path.join(FIXTURE_ROOT, 'docs/guide.md'), path.join(FIXTURE_ROOT, 'docs/api-reference.md') ].join('\n'),
  );

  // A stylesheet source in a framework SFC's script region is a single fixed side-effect variant →
  // no-configurable-style (default cursor 0,0 in styled.vue is the <script setup> line).
  earlyReturn('.css into a .vue script region → no-configurable-style (side-effect single-shape)', 'src/styled.vue', 'styles/global.css');

  // Inside a <style> block the same source exposes >=2 configurable CSS styles, so the command
  // reaches the persist picker instead of early-returning (the picker is the manual-QA boundary here;
  // completesPromptly is false precisely because the blocking QuickPick opened — dismissed in afterEach).
  it('.css into a .vue <style> block reaches the configurable picker (does not early-return)', async () => {
    await openFixture('src/styled.vue');
    const editor = vscode.window.activeTextEditor!;
    const pos = new vscode.Position(9, 0); // inside the <style scoped> block
    editor.selection = new vscode.Selection(pos, pos);
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/global.css'));
    assert.strictEqual(await completesPromptly(() => executeSetDefaultImportStyle()), false);
  });
});
