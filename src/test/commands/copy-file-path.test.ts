import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executeCopyFilePath } from '../../commands/copy-file-path';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

// executeCopyFilePath delegates to VS Code's built-in `copyFilePath`, then validates and re-writes the
// clipboard, returning a boolean that copy-paste.ts gates on. The success path is the testable part;
// it depends on the built-in populating the clipboard from the active editor in the test host.
describe('executeCopyFilePath', () => {
  afterEach(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  it('copies the active file path to the clipboard and returns true', async () => {
    const fixture = path.join(FIXTURE_ROOT, 'src/foo.ts');
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fixture));
    await vscode.window.showTextDocument(doc);
    // Pre-clear so we know the resulting clipboard value came from this run.
    await vscode.env.clipboard.writeText('');

    const ok = await executeCopyFilePath();

    assert.strictEqual(ok, true, 'expected success for an absolute path that has an extension');
    const clip = (await vscode.env.clipboard.readText()).trim();
    assert.strictEqual(clip, fixture, `clipboard should hold the active file path; got "${clip}"`);
    // The post-success toast carries Paste with Style / Paste Now buttons; its .then dispatch can't be
    // asserted here — showInformationMessage resolves undefined with no user click.
  });

  // With no active editor the built-in copyFilePath leaves the clipboard empty → reject with `false`.
  it('returns false when there is no active editor (empty-clipboard guard)', async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await vscode.env.clipboard.writeText('');
    const ok = await executeCopyFilePath();
    assert.strictEqual(ok, false, 'expected false when no file is available to copy');
  });

  // Copy is destination-agnostic: an extensionless file (Makefile, Dockerfile, LICENSE) is a valid
  // Markdown-link source, so the copy succeeds and the paste-time gate decides the destination.
  it('copies an extensionless active file and returns true', async () => {
    const uri = vscode.Uri.file(path.join(FIXTURE_ROOT, 'TempNoExtFixture'));
    await vscode.workspace.fs.writeFile(uri, Buffer.from('all:\n\techo hi\n', 'utf-8'));
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc);
      await vscode.env.clipboard.writeText('');
      const ok = await executeCopyFilePath();
      assert.strictEqual(ok, true, 'extensionless copy now succeeds (paste-time gating decides)');
      const clip = (await vscode.env.clipboard.readText()).trim();
      assert.strictEqual(clip, uri.fsPath, 'clipboard should hold the extensionless path');
    } finally {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
      try { await vscode.workspace.fs.delete(uri); } catch { /* ignore */ }
    }
  });
});
