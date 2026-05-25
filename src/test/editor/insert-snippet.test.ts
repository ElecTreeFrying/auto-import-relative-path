import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { insertImportSnippet } from '../../editor/insert-snippet';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../qa/workspace');
const SNIPPET_TEXT = "import { test } from './test';";

async function openFixture(relativePath: string): Promise<vscode.TextEditor> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  return vscode.window.showTextDocument(doc);
}

async function revertAndClose(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

async function insertAndWait(snippet: vscode.SnippetString): Promise<void> {
  const changed = new Promise<void>(resolve => {
    const disposable = vscode.workspace.onDidChangeTextDocument(() => {
      disposable.dispose();
      resolve();
    });
  });
  insertImportSnippet(snippet);
  await changed;
}

async function setCursor(editor: vscode.TextEditor, line: number, column = 0): Promise<void> {
  const pos = new vscode.Position(line, column);
  editor.selection = new vscode.Selection(pos, pos);
}

function setClipboard(sourcePath: string): Thenable<void> {
  return vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, sourcePath));
}

async function writeTempFile(relativePath: string, content: string): Promise<vscode.Uri> {
  const uri = vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath));
  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
  return uri;
}

async function deleteTempFile(uri: vscode.Uri): Promise<void> {
  try { await vscode.workspace.fs.delete(uri); } catch { /* ignore */ }
}

describe('insertImportSnippet', () => {
  afterEach(async () => {
    await revertAndClose();
  });

  describe('Bottom placement (default)', () => {
    it('inserts after the last import indicator line', async () => {
      const editor = await openFixture('with-imports.ts');
      await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
      assert.ok(
        editor.document.lineAt(3).text.includes("import { test } from './test';"),
        `expected snippet at line 3 (after 3 import lines), got: "${editor.document.lineAt(3).text}"`
      );
    });

    it('skips comment lines containing import indicators', async () => {
      const editor = await openFixture('comments-only.ts');
      await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
      assert.ok(
        editor.document.lineAt(0).text.includes("import { test } from './test';"),
        `expected snippet at line 0 (comments skipped), got: "${editor.document.lineAt(0).text}"`
      );
    });

    it('falls back to line 0 when no indicators found', async () => {
      const editor = await openFixture('empty-file.ts');
      await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
      assert.ok(
        editor.document.lineAt(0).text.includes("import { test } from './test';"),
        `expected snippet at line 0, got: "${editor.document.lineAt(0).text}"`
      );
    });
  });

  describe('HTML/MD forced cursor', () => {
    it('HTML destination inserts at cursor line regardless of placement setting', async () => {
      const editor = await openFixture('pages/index.html');
      await setClipboard('pages/app.js');
      await setCursor(editor, 5);
      await insertAndWait(new vscode.SnippetString('<script src="./app.js"></script>'));
      assert.ok(
        editor.document.lineAt(5).text.includes('<script src="./app.js"></script>'),
        `expected snippet at cursor line 5, got: "${editor.document.lineAt(5).text}"`
      );
    });

    it('Markdown destination inserts at cursor line', async () => {
      const editor = await openFixture('docs/guide.md');
      await setClipboard('docs/architecture.md');
      await setCursor(editor, 3);
      await insertAndWait(new vscode.SnippetString('[text](./architecture.md)'));
      assert.ok(
        editor.document.lineAt(3).text.includes('[text](./architecture.md)'),
        `expected snippet at cursor line 3, got: "${editor.document.lineAt(3).text}"`
      );
    });
  });

  describe('inline snippet', () => {
    it('non-stylesheet source into .css destination inserts at exact cursor without trailing newline', async () => {
      const editor = await openFixture('styles/reset.css');
      await setClipboard('assets/logo.png');
      await setCursor(editor, 3, 16);
      await insertAndWait(new vscode.SnippetString("url('./logo.png')"));
      assert.ok(
        editor.document.lineAt(3).text.includes("url('./logo.png')"),
        `expected inline snippet at line 3, got: "${editor.document.lineAt(3).text}"`
      );
    });
  });

  describe('Astro frontmatter', () => {
    it('Bottom inserts after opening --- fence', async () => {
      const editor = await openFixture('src/App.astro');
      await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
      assert.ok(
        editor.document.lineAt(1).text.includes("import { test } from './test';"),
        `expected snippet at line 1 (after opening ---), got: "${editor.document.lineAt(1).text}"`
      );
    });

    it('no frontmatter creates --- block at line 0', async () => {
      const tempUri = await writeTempFile('_temp_no_fm.astro', '<html><body>Hello</body></html>\n');
      try {
        const doc = await vscode.workspace.openTextDocument(tempUri);
        await vscode.window.showTextDocument(doc);
        await setClipboard('src/bar.ts');
        await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
        assert.ok(
          doc.lineAt(0).text.includes('---'),
          `expected --- at line 0, got: "${doc.lineAt(0).text}"`
        );
        assert.ok(
          doc.lineAt(1).text.includes("import { test } from './test';"),
          `expected snippet at line 1, got: "${doc.lineAt(1).text}"`
        );
      } finally {
        await revertAndClose();
        await deleteTempFile(tempUri);
      }
    });
  });

  describe('SFC script block', () => {
    it('Vue prefers <script setup> over bare <script>', async () => {
      const editor = await openFixture('src/App.vue');
      await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
      assert.ok(
        editor.document.lineAt(1).text.includes("import { test } from './test';"),
        `expected snippet at line 1 (after <script setup>), got: "${editor.document.lineAt(1).text}"`
      );
    });

    it('Svelte inserts after opening <script> tag', async () => {
      const editor = await openFixture('src/App.svelte');
      await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
      assert.ok(
        editor.document.lineAt(1).text.includes("import { test } from './test';"),
        `expected snippet at line 1 (after <script>), got: "${editor.document.lineAt(1).text}"`
      );
    });

    it('no script block creates <script></script> wrapper at line 0', async () => {
      const tempUri = await writeTempFile('_temp_no_script.vue', '<template>\n  <div>Hello</div>\n</template>\n');
      try {
        const doc = await vscode.workspace.openTextDocument(tempUri);
        await vscode.window.showTextDocument(doc);
        await setClipboard('src/bar.ts');
        await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
        assert.ok(
          doc.lineAt(0).text.includes('<script>'),
          `expected <script> at line 0, got: "${doc.lineAt(0).text}"`
        );
        assert.ok(
          doc.lineAt(1).text.includes("import { test } from './test';"),
          `expected snippet at line 1, got: "${doc.lineAt(1).text}"`
        );
      } finally {
        await revertAndClose();
        await deleteTempFile(tempUri);
      }
    });
  });

  describe('insertion column', () => {
    it('script destination uses column 0', async () => {
      const editor = await openFixture('empty-file.ts');
      await setClipboard('src/bar.ts');
      await setCursor(editor, 0, 5);
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT));
      const insertedLine = editor.document.lineAt(0).text;
      assert.ok(
        insertedLine.startsWith("import { test }"),
        `expected insertion at column 0, got: "${insertedLine}"`
      );
    });

    it('HTML destination uses cursor column', async () => {
      const editor = await openFixture('pages/index.html');
      await setClipboard('pages/app.js');
      await setCursor(editor, 8, 2);
      await insertAndWait(new vscode.SnippetString('<script src="./app.js"></script>'));
      const insertedLine = editor.document.lineAt(8).text;
      assert.ok(
        insertedLine.startsWith('  <script src'),
        `expected insertion at column 2, got: "${insertedLine}"`
      );
    });
  });
});
