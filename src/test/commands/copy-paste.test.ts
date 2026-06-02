import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executeCopyPaste } from '../../commands/copy-paste';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../qa/workspace');

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
});
