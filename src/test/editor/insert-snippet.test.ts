import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { insertImportSnippet } from '../../editor/insert-snippet';
import { getFilePathInfo, FilePathInfo } from '../../editor/file-path-info';
import { setAutoImportSetting } from '../../config/settings';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');
const SNIPPET_TEXT = "import { test } from './test';";

async function openFixture(relativePath: string): Promise<vscode.TextEditor> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  return vscode.window.showTextDocument(doc);
}

async function revertAndClose(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

async function insertAndWait(snippet: vscode.SnippetString, info: FilePathInfo, insideStyleBlock = false): Promise<void> {
  const changed = new Promise<void>(resolve => {
    const disposable = vscode.workspace.onDidChangeTextDocument(() => {
      disposable.dispose();
      resolve();
    });
  });
  insertImportSnippet(snippet, info, insideStyleBlock);
  await changed;
}

async function setCursor(editor: vscode.TextEditor, line: number, column = 0): Promise<void> {
  const pos = new vscode.Position(line, column);
  editor.selection = new vscode.Selection(pos, pos);
}

async function setClipboard(sourcePath: string): Promise<FilePathInfo> {
  await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, sourcePath));
  return getFilePathInfo();
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
      const info = await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
      assert.ok(
        editor.document.lineAt(3).text.includes("import { test } from './test';"),
        `expected snippet at line 3 (after 3 import lines), got: "${editor.document.lineAt(3).text}"`
      );
    });

    it('skips comment lines containing import indicators', async () => {
      const editor = await openFixture('comments-only.ts');
      const info = await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
      assert.ok(
        editor.document.lineAt(0).text.includes("import { test } from './test';"),
        `expected snippet at line 0 (comments skipped), got: "${editor.document.lineAt(0).text}"`
      );
    });

    it('falls back to line 0 when no indicators found', async () => {
      const editor = await openFixture('empty-file.ts');
      const info = await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
      assert.ok(
        editor.document.lineAt(0).text.includes("import { test } from './test';"),
        `expected snippet at line 0, got: "${editor.document.lineAt(0).text}"`
      );
    });
  });

  describe('HTML/MD/LaTeX forced cursor', () => {
    it('HTML destination inserts at cursor line regardless of placement setting', async () => {
      const editor = await openFixture('pages/index.html');
      const info = await setClipboard('pages/app.js');
      await setCursor(editor, 5);
      await insertAndWait(new vscode.SnippetString('<script src="./app.js"></script>'), info);
      assert.ok(
        editor.document.lineAt(5).text.includes('<script src="./app.js"></script>'),
        `expected snippet at cursor line 5, got: "${editor.document.lineAt(5).text}"`
      );
    });

    it('Markdown destination inserts at cursor line', async () => {
      const editor = await openFixture('docs/guide.md');
      const info = await setClipboard('docs/architecture.md');
      await setCursor(editor, 3);
      await insertAndWait(new vscode.SnippetString('[text](./architecture.md)'), info);
      assert.ok(
        editor.document.lineAt(3).text.includes('[text](./architecture.md)'),
        `expected snippet at cursor line 3, got: "${editor.document.lineAt(3).text}"`
      );
    });

    // The figure float is the extension's only multi-line snippet; forced-cursor must keep it in the
    // document body (line 0 is the LaTeX preamble). Snippet text is representative — generation is
    // covered in snippets/languages/latex.test.ts; this test exercises the real editor insertion.
    it('LaTeX destination inserts the multi-line figure at the cursor body line, not the preamble', async () => {
      const editor = await openFixture('paper/main.tex');
      const info = await setClipboard('assets/logo.png');
      await setCursor(editor, 5); // \section{Introduction} — document body
      const figure = [
        '\\begin{figure}[htbp]',
        '  \\centering',
        '  \\includegraphics[width=0.5\\textwidth]{./assets/logo.png}',
        '  \\caption{}',
        '  \\label{fig:}',
        '\\end{figure}',
      ].join('\n');
      await insertAndWait(new vscode.SnippetString(figure), info);
      assert.ok(
        editor.document.lineAt(5).text.includes('\\begin{figure}'),
        `expected figure at cursor line 5, got: "${editor.document.lineAt(5).text}"`
      );
      assert.ok(
        editor.document.lineAt(0).text.includes('\\documentclass'),
        `expected the preamble untouched at line 0, got: "${editor.document.lineAt(0).text}"`
      );
    });

    it('LaTeX destination inserts a single-line \\input at the cursor line', async () => {
      const editor = await openFixture('paper/main.tex');
      const info = await setClipboard('assets/logo.png');
      await setCursor(editor, 5);
      await insertAndWait(new vscode.SnippetString('\\input{./chapters/intro}'), info);
      assert.ok(
        editor.document.lineAt(5).text.includes('\\input{./chapters/intro}'),
        `expected \\input at cursor line 5, got: "${editor.document.lineAt(5).text}"`
      );
    });
  });

  describe('inline snippet', () => {
    it('non-stylesheet source into .css destination inserts at exact cursor without trailing newline', async () => {
      const editor = await openFixture('styles/reset.css');
      const info = await setClipboard('assets/logo.png');
      await setCursor(editor, 3, 16);
      await insertAndWait(new vscode.SnippetString("url('./logo.png')"), info);
      assert.ok(
        editor.document.lineAt(3).text.includes("url('./logo.png')"),
        `expected inline snippet at line 3, got: "${editor.document.lineAt(3).text}"`
      );
    });
  });

  describe('Astro frontmatter', () => {
    it('Bottom inserts after opening --- fence', async () => {
      const editor = await openFixture('src/App.astro');
      const info = await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
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
        const info = await setClipboard('src/bar.ts');
        await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
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
      const info = await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
      assert.ok(
        editor.document.lineAt(1).text.includes("import { test } from './test';"),
        `expected snippet at line 1 (after <script setup>), got: "${editor.document.lineAt(1).text}"`
      );
    });

    it('Svelte inserts after opening <script> tag', async () => {
      const editor = await openFixture('src/App.svelte');
      const info = await setClipboard('src/bar.ts');
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
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
        const info = await setClipboard('src/bar.ts');
        await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
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
      const info = await setClipboard('src/bar.ts');
      await setCursor(editor, 0, 5);
      await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
      const insertedLine = editor.document.lineAt(0).text;
      assert.ok(
        insertedLine.startsWith("import { test }"),
        `expected insertion at column 0, got: "${insertedLine}"`
      );
    });

    it('HTML destination uses cursor column', async () => {
      const editor = await openFixture('pages/index.html');
      const info = await setClipboard('pages/app.js');
      await setCursor(editor, 8, 2);
      await insertAndWait(new vscode.SnippetString('<script src="./app.js"></script>'), info);
      const insertedLine = editor.document.lineAt(8).text;
      assert.ok(
        insertedLine.startsWith('  <script src'),
        `expected insertion at column 2, got: "${insertedLine}"`
      );
    });

    it('LaTeX destination uses cursor column', async () => {
      const editor = await openFixture('paper/main.tex');
      const info = await setClipboard('assets/logo.png');
      await setCursor(editor, 6, 2); // the body paragraph is indented two spaces
      await insertAndWait(new vscode.SnippetString('\\input{./chapters/intro}'), info);
      const insertedLine = editor.document.lineAt(6).text;
      assert.ok(
        insertedLine.startsWith('  \\input'),
        `expected insertion at column 2, got: "${insertedLine}"`
      );
    });
  });

  // Cursor placement INSIDE an Astro frontmatter / SFC <script> block lands the import at the cursor
  // line (insert-snippet.ts Astro/SFC Cursor branches). The committed App.astro/App.vue fixtures have
  // EMPTY blocks (no line strictly between the fences/tags), so these use temp fixtures with a body line.
  describe('Cursor placement inside an Astro frontmatter / SFC script block', () => {
    it('Astro: Cursor inside the frontmatter inserts at the cursor line', async () => {
      await setAutoImportSetting('preferences', 'placement', 'Cursor');
      const uri = await writeTempFile('_temp_astro_cursor.astro', '---\nconst existing = 1;\n---\n<html></html>\n');
      try {
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        const info = await setClipboard('src/bar.ts');
        await setCursor(editor, 1, 0);
        await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
        assert.ok(
          editor.document.lineAt(1).text.includes("import { test } from './test';"),
          `expected snippet at cursor line 1, got: "${editor.document.lineAt(1).text}"`,
        );
      } finally {
        await setAutoImportSetting('preferences', 'placement', undefined);
        await revertAndClose();
        await deleteTempFile(uri);
      }
    });

    it('Vue: Cursor inside the <script setup> block inserts at the cursor line', async () => {
      await setAutoImportSetting('preferences', 'placement', 'Cursor');
      const uri = await writeTempFile('_temp_vue_cursor.vue', '<script setup>\nconst existing = 1;\n</script>\n<template></template>\n');
      try {
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        const info = await setClipboard('src/bar.ts');
        await setCursor(editor, 1, 0);
        await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
        assert.ok(
          editor.document.lineAt(1).text.includes("import { test } from './test';"),
          `expected snippet at cursor line 1, got: "${editor.document.lineAt(1).text}"`,
        );
      } finally {
        await setAutoImportSetting('preferences', 'placement', undefined);
        await revertAndClose();
        await deleteTempFile(uri);
      }
    });
  });

  // Stylesheet source into an SFC <style> block (insideStyleBlock = true) lands the import inside the
  // <style> block, not the <script> block. styled.vue has a populated <style scoped> at lines 7–11.
  describe('SFC <style> block (stylesheet source)', () => {
    it('Bottom lands the import just after the opening <style> tag (line 8), not in the script block', async () => {
      const editor = await openFixture('src/styled.vue');
      const info = await setClipboard('src/theme.css');
      await setCursor(editor, 9); // inside the <style> block
      await insertAndWait(new vscode.SnippetString("@import './theme.css';"), info, true);
      assert.ok(
        editor.document.lineAt(8).text.includes("@import './theme.css';"),
        `expected the @import inside the <style> block at line 8, got: "${editor.document.lineAt(8).text}"`,
      );
      assert.ok(
        !editor.document.lineAt(1).text.includes('@import'),
        'the import must NOT land in the <script> block',
      );
    });

    it('Cursor lands the import at the cursor line inside the <style> block', async () => {
      await setAutoImportSetting('preferences', 'placement', 'Cursor');
      try {
        const editor = await openFixture('src/styled.vue');
        const info = await setClipboard('src/base.scss');
        await setCursor(editor, 9);
        await insertAndWait(new vscode.SnippetString("@use './base';"), info, true);
        assert.ok(
          editor.document.lineAt(9).text.includes("@use './base';"),
          `expected the @use at cursor line 9, got: "${editor.document.lineAt(9).text}"`,
        );
      } finally {
        await setAutoImportSetting('preferences', 'placement', undefined);
      }
    });

    it('without the flag, a stylesheet source lands in the <script> block (side-effect import)', async () => {
      const editor = await openFixture('src/styled.vue');
      const info = await setClipboard('src/theme.css');
      await setCursor(editor, 9);
      await insertAndWait(new vscode.SnippetString("import './theme.css';"), info, false);
      assert.ok(
        editor.document.lineAt(1).text.includes("import './theme.css';"),
        `expected the side-effect import in the <script> block at line 1, got: "${editor.document.lineAt(1).text}"`,
      );
    });
  });

  describe('placement fallback', () => {
    it('falls back to Bottom for an unrecognized placement setting', async () => {
      await setAutoImportSetting('preferences', 'placement', 'Nonsense');
      try {
        const editor = await openFixture('with-imports.ts');
        const info = await setClipboard('src/bar.ts');
        await insertAndWait(new vscode.SnippetString(SNIPPET_TEXT), info);
        assert.ok(
          editor.document.lineAt(3).text.includes("import { test } from './test';"),
          `expected default→Bottom at line 3, got: "${editor.document.lineAt(3).text}"`,
        );
      } finally {
        await setAutoImportSetting('preferences', 'placement', undefined);
      }
    });
  });
});
