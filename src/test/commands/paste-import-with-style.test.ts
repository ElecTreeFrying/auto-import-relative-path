import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executePasteImportWithStyle } from '../../commands/paste-import-with-style';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../qa/workspace');

async function openFixture(relativePath: string): Promise<vscode.TextEditor> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  return vscode.window.showTextDocument(doc);
}

function waitForDocumentChange(fn: () => Promise<void>, timeoutMs = 500): Promise<boolean> {
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

// Rejection paths mirror paste-import.ts (shared eleven-clause gating). Single-variant destinations
// insert directly with no picker — that path is fully testable. The >=2-variant QuickPick is the
// manual-QA boundary (no Sinon to answer the picker; a stray picker would hang the suite).
describe('executePasteImportWithStyle', () => {
  afterEach(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  describe('rejections (no document change)', () => {
    const reject = (label: string, dest: string, clip: string) =>
      it(label, async () => {
        await openFixture(dest);
        await vscode.env.clipboard.writeText(clip.startsWith('/') ? clip : path.join(FIXTURE_ROOT, clip));
        const changed = await waitForDocumentChange(() => executePasteImportWithStyle());
        assert.strictEqual(changed, false, `expected no document change: ${label}`);
      });

    reject('empty clipboard', 'pages/index.html', '/');
    reject('non-absolute path', 'pages/index.html', 'relative/styles.css');
    reject('path without extension', 'pages/index.html', '/usr/local/bin/Makefile');
    reject('same-file', 'pages/index.html', 'pages/index.html');
    reject('source not found', 'pages/index.html', 'styles/does-not-exist.css');
    reject('unsupported pair (.scss → .html)', 'pages/index.html', 'styles/main.scss');
  });

  describe('single-variant destinations insert directly (no picker)', () => {
    it('.css → .html inserts a <link> tag', async () => {
      const editor = await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/global.css'));
      const changed = await waitForDocumentChange(() => executePasteImportWithStyle(), 2000);
      assert.strictEqual(changed, true, 'expected a document change for the single stylesheet variant');
      assert.ok(editor.document.getText().includes('<link'), 'expected a <link> tag in the document');
    });

    it('.png → .jsx inserts a named default import', async () => {
      const editor = await openFixture('src/badge.jsx');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'assets/logo.png'));
      const changed = await waitForDocumentChange(() => executePasteImportWithStyle(), 2000);
      assert.strictEqual(changed, true, 'expected a document change for the single image variant');
      assert.ok(editor.document.getText().includes('logo.png'), 'expected the image import in the document');
    });
  });

  describe('no active editor', () => {
    it('returns without inserting and does not throw when no editor is open', async () => {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      await assert.doesNotReject(executePasteImportWithStyle());
    });
  });
});
