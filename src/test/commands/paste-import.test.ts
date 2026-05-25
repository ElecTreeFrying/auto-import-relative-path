import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executePasteImport } from '../../commands/paste-import';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/manual-qa-workspace');

async function openFixture(relativePath: string): Promise<vscode.TextEditor> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  return vscode.window.showTextDocument(doc);
}

async function closeAll(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
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

describe('executePasteImport', () => {
  afterEach(async () => {
    await closeAll();
  });

  describe('rejection: clipboard validation', () => {
    it('empty clipboard triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText('');
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for empty clipboard');
    });

    it('non-absolute path triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText('relative/path.ts');
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for non-absolute path');
    });

    it('path without extension triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText('/usr/local/bin/Makefile');
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for extensionless path');
    });
  });

  describe('rejection: same-file', () => {
    it('clipboard equals destination path triggers warning (no document change)', async () => {
      const destPath = path.join(FIXTURE_ROOT, 'src/foo.ts');
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(destPath);
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for same-file');
    });
  });

  describe('rejection: source not found', () => {
    it('nonexistent source file triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/nonexistent-file.ts'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for missing source');
    });
  });

  describe('rejection: unsupported pairs', () => {
    it('.html into .html triggers not-supported (no document change)', async () => {
      await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'pages/about.html'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .html into .html');
    });

    it('.ts into .html triggers not-supported (no document change)', async () => {
      await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .ts into .html');
    });
  });

  describe('successful insertion', () => {
    it('.ts into .ts inserts import snippet', async () => {
      const editor = await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      const textBefore = editor.document.getText();
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for valid .ts into .ts');
      assert.notStrictEqual(editor.document.getText(), textBefore, 'document should differ after insertion');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), `expected import path in document, got: ${allText.slice(0, 200)}`);
    });

    it('.js into .html inserts <script> tag', async () => {
      const editor = await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'with-requires.js'));
      const textBefore = editor.document.getText();
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for valid .js into .html');
      assert.notStrictEqual(editor.document.getText(), textBefore, 'document should differ after insertion');
      const allText = editor.document.getText();
      assert.ok(allText.includes('<script src='), `expected <script> tag in document, got: ${allText.slice(0, 200)}`);
    });
  });
});
