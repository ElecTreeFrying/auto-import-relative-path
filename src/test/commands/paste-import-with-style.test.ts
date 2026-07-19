import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executePasteImportWithStyle } from '../../commands/paste-import-with-style';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

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

    it('extensionless → .md inserts a link directly (single variant, the F3 accept path)', async () => {
      const editor = await openFixture('docs/guide.md');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'LICENSE'));
      const changed = await waitForDocumentChange(() => executePasteImportWithStyle(), 2000);
      assert.strictEqual(changed, true, 'expected a document change for the single extensionless-link variant');
      assert.ok(editor.document.getText().includes('](../LICENSE)'), 'expected the extensionless Markdown link in the document');
    });
  });

  // A multi-selection clipboard reduces to its first copyable non-destination member (the picker
  // flows are single-pair by design). The successful insertions double as the regression pin for
  // the old blob bug: pre-fork, a multi-line clipboard was stat'ed whole → source-not-found, no insert.
  describe('multi-path clipboard reduces to the primary member', () => {
    it('inserts the first member only (.md → .md single-variant link)', async () => {
      const editor = await openFixture('docs/architecture.md');
      const textBefore = editor.document.getText();
      assert.ok(!textBefore.includes('./guide.md'), 'fixture precondition: destination must not already link guide.md');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'docs/guide.md'),
        path.join(FIXTURE_ROOT, 'docs/api-reference.md'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImportWithStyle(), 2000);
      assert.strictEqual(changed, true, 'expected the primary member to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes('./guide.md'), 'primary member link expected');
      assert.ok(!allText.includes('./api-reference.md'), 'secondary member must not insert');
    });

    it('skips the destination itself when selecting the primary member', async () => {
      const editor = await openFixture('docs/architecture.md');
      const textBefore = editor.document.getText();
      assert.ok(!textBefore.includes('./guide.md'), 'fixture precondition: destination must not already link guide.md');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'docs/architecture.md'),
        path.join(FIXTURE_ROOT, 'docs/guide.md'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImportWithStyle(), 2000);
      assert.strictEqual(changed, true, 'expected the non-destination member to insert');
      assert.ok(editor.document.getText().includes('./guide.md'), 'non-destination member link expected');
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
