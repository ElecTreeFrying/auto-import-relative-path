import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { computeImportPlacement, isCommentLine } from '../../editor/placement';
import { executePasteImport } from '../../commands/paste-import';
import { FileExtension } from '../../types/file-extension';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

async function closeAll(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

function waitForDocumentChange(fn: () => Promise<void>, timeoutMs = 2000): Promise<boolean> {
  return new Promise(resolve => {
    const timeout = setTimeout(() => { disposable.dispose(); resolve(false); }, timeoutMs);
    const disposable = vscode.workspace.onDidChangeTextDocument(() => {
      clearTimeout(timeout);
      disposable.dispose();
      resolve(true);
    });
    fn();
  });
}

// latex.md §10 — the comment-marker mismatch edge, pinned as CURRENT behavior: the placement
// helpers recognize `//`, `/*`, and `*` but NOT LaTeX's `%`, so a gesture on a `%` line treats it
// as content — the import lands AT that line (pushing it down), never hopped above it the way a
// `//` group is. If `%` support is ever added, these pins flip deliberately.
describe('latex.md §10 — LaTeX % marker is not a comment (pinned current behavior)', () => {
  afterEach(async () => {
    await closeAll();
  });

  it('§10 — isCommentLine treats a % line as content (contrast: // is a comment)', () => {
    assert.strictEqual(isCommentLine('% a latex comment'), false, '% must not be a comment marker');
    assert.strictEqual(isCommentLine('   % indented latex comment'), false);
    assert.strictEqual(isCommentLine('// a script comment'), true, 'sanity: // stays a comment marker');
  });

  it('§10 — computeImportPlacement for .tex keeps the drop on the % line (no comment hop)', () => {
    const documentText = [
      '\\documentclass{article}',
      '\\begin{document}',
      '% a latex comment',
      '\\end{document}',
    ].join('\n');
    const placement = computeImportPlacement(
      documentText, '.tex' as FileExtension, '.png' as FileExtension, 2, 0);
    assert.strictEqual(placement.line, 2, 'the forced-cursor drop must stay AT the % line, not hop above it');
  });

  it('§10 — pasting with the cursor on a % line inserts at that line; the % line is pushed down intact', async () => {
    const tempUri = vscode.Uri.file(path.join(FIXTURE_ROOT, '_qa_percent.tex'));
    const content = [
      '\\documentclass{article}',
      '\\begin{document}',
      'Hello',
      '% marker comment',
      '\\end{document}',
      '',
    ].join('\n');
    await vscode.workspace.fs.writeFile(tempUri, Buffer.from(content, 'utf-8'));
    try {
      const doc = await vscode.workspace.openTextDocument(tempUri);
      const editor = await vscode.window.showTextDocument(doc);
      const pos = new vscode.Position(3, 0); // the % line
      editor.selection = new vscode.Selection(pos, pos);
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'paper/main.tex'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, true, 'the \\input must insert');
      const lines = doc.getText().split('\n');
      assert.ok(/\\(input|include)\{/.test(lines[3]), `the import must land AT the % line's position, got line 3: ${lines[3]}`);
      assert.strictEqual(lines[4], '% marker comment', 'the % line must be pushed down intact, not hopped above');
    } finally {
      await closeAll();
      await vscode.workspace.fs.delete(tempUri);
    }
  });
});
