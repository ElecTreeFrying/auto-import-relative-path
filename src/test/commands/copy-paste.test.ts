import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executeCopyPaste } from '../../commands/copy-paste';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

// A true happy-path assertion is structurally impossible in isolation: executeCopyFilePath forces the
// clipboard to the active editor's OWN path, so the composed executePasteImport then sees
// source === destination and aborts via the same-file guard (no document change). So this is a smoke
// test of the sequential composition — it must run to completion without throwing (commands never
// throw; every failure path returns void) and leave the document untouched on the self-import. The
// copy→paste gating contract itself is covered elsewhere: executeCopyFilePath's boolean return in
// copy-file-path.test.ts, and the executePasteImport rejection suite in paste-import.test.ts.
describe('executeCopyPaste', () => {
  afterEach(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  it('runs the copy→paste composition without throwing (self-import is a no-op)', async () => {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, 'src/foo.ts')));
    const editor = await vscode.window.showTextDocument(doc);
    const before = editor.document.getText();

    await assert.doesNotReject(executeCopyPaste());

    assert.strictEqual(editor.document.getText(), before, 'self-import should not modify the document');
  });

  // With the extensionless-source feature, an extensionless active file now COPIES successfully
  // (copy is destination-agnostic — no longer rejected for a missing extension). The composed paste
  // therefore runs, but Alt+D always targets the active file, so it is a same-file no-op — the
  // document is left untouched for that reason, not because copy short-circuits it.
  it('extensionless active file: copy succeeds, the composed self-import paste is a no-op', async () => {
    const uri = vscode.Uri.file(path.join(FIXTURE_ROOT, 'TempNoExtCopyPaste'));
    await vscode.workspace.fs.writeFile(uri, Buffer.from('plain text, no extension\n', 'utf-8'));
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);
      const before = editor.document.getText();
      await vscode.env.clipboard.writeText('');
      await assert.doesNotReject(executeCopyPaste());
      assert.strictEqual(editor.document.getText(), before, 'the self-import composite must leave the document unchanged');
    } finally {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
      try { await vscode.workspace.fs.delete(uri); } catch { /* ignore */ }
    }
  });
});
