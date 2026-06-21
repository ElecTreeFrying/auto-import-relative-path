import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { AutoImportOnDropProvider } from '../../drop/provider';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

const provider = new AutoImportOnDropProvider();

/** Builds a DataTransfer carrying a single `text/uri-list` entry for the given absolute path. */
function dataTransferFor(absPath: string): vscode.DataTransfer {
  const transfer = new vscode.DataTransfer();
  transfer.set('text/uri-list', new vscode.DataTransferItem(vscode.Uri.file(absPath).toString()));
  return transfer;
}

async function destDocument(relativePath: string): Promise<vscode.TextDocument> {
  return vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
}

function dropWith(doc: vscode.TextDocument, transfer: vscode.DataTransfer) {
  const token = new vscode.CancellationTokenSource().token;
  return provider.provideDocumentDropEdits(doc, new vscode.Position(0, 0), transfer, token);
}

function drop(doc: vscode.TextDocument, sourceRel: string) {
  return dropWith(doc, dataTransferFor(path.join(FIXTURE_ROOT, sourceRel)));
}

/**
 * Asserts a *suppressed* drop: an empty `DocumentDropEdit` (empty `SnippetString`, no
 * `additionalEdit`) rather than `null`. The empty edit out-ranks VS Code's built-in
 * insert-relative-path default, resolving the drop to a no-op so nothing lands in the
 * document — whereas `null` would cede to that default and insert a stray raw path. The
 * empty `insertText` distinguishes it from an inline edit; the absent `additionalEdit`
 * from a placement edit. See `suppressDrop()` in drop/provider.ts and the
 * "`null` vs. `suppressDrop()`" section of src/drop/CLAUDE.md.
 */
function assertSuppressed(result: vscode.DocumentDropEdit | null) {
  assert.ok(result, 'expected a suppressing DocumentDropEdit, not null (null cedes to VS Code\'s raw-path default)');
  assert.strictEqual(result.title, 'Auto Import');
  assert.strictEqual((result.insertText as vscode.SnippetString).value, '', 'a suppressing edit must insert nothing');
  assert.strictEqual(result.additionalEdit, undefined, 'a suppressing edit must not carry a placement WorkspaceEdit');
}

describe('AutoImportOnDropProvider.provideDocumentDropEdits', () => {
  it('suppresses the drop (empty edit, not null) when the source/destination pair fails gating (.ts → .css)', async () => {
    const doc = await destDocument('styles/reset.css');
    const result = await drop(doc, 'src/bar.ts');
    assertSuppressed(result);
  });

  it('suppresses the drop (empty edit, not null) when the dragged file is the destination itself (same-file)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'src/foo.ts');
    assertSuppressed(result);
  });

  it('suppresses the drop (empty edit, not null) when gating passes but the snippet is empty (.ts → .jsx backstop)', async () => {
    const doc = await destDocument('src/badge.jsx');
    const result = await drop(doc, 'src/bar.ts');
    assertSuppressed(result);
  });

  it('returns a placement drop edit with an attached WorkspaceEdit for a supported pair (.ts → .ts)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'src/bar.ts');

    assert.ok(result, 'expected a DocumentDropEdit for a supported pair');
    assert.strictEqual(result.title, 'Auto Import');
    // Placement is delivered as a SnippetTextEdit on additionalEdit (VS Code's legacy
    // WorkspaceEdit accessors size/get don't surface snippet edits, so we only assert presence).
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'expected an attached WorkspaceEdit');
  });

  it('returns an inline drop edit whose insertText carries the url() snippet (.png → .css)', async () => {
    const doc = await destDocument('styles/reset.css');
    const result = await drop(doc, 'assets/logo.png');

    assert.ok(result, 'expected a DocumentDropEdit for an image into a stylesheet');
    assert.strictEqual(result.title, 'Auto Import');
    const inserted = String((result.insertText as vscode.SnippetString).value);
    assert.ok(
      inserted.includes("url(") && inserted.includes('logo.png'),
      `expected an inline url() snippet referencing the image, got: "${inserted}"`,
    );
  });
});

// resolveSourcePath prefers text/uri-list, falls back to an absolute text/plain, and otherwise
// yields null (no drop edit offered). The cases above all feed text/uri-list; these exercise the
// fallback and the give-up branches through the public provider.
describe('AutoImportOnDropProvider — source resolution fallbacks', () => {
  function plainTransfer(value: string): vscode.DataTransfer {
    const transfer = new vscode.DataTransfer();
    transfer.set('text/plain', new vscode.DataTransferItem(value));
    return transfer;
  }

  it('falls back to text/plain when it is an absolute path (no uri-list present)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropWith(doc, plainTransfer(path.join(FIXTURE_ROOT, 'src/bar.ts')));
    assert.ok(result, 'expected an edit from an absolute text/plain path');
  });

  it('returns null when text/plain is a relative path (not absolute)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropWith(doc, plainTransfer('src/bar.ts'));
    assert.strictEqual(result, null);
  });

  it('returns null when the DataTransfer carries no usable item', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropWith(doc, new vscode.DataTransfer());
    assert.strictEqual(result, null);
  });

  it('returns null when uri-list is blank and there is no text/plain', async () => {
    const doc = await destDocument('src/foo.ts');
    const transfer = new vscode.DataTransfer();
    transfer.set('text/uri-list', new vscode.DataTransferItem('   '));
    const result = await dropWith(doc, transfer);
    assert.strictEqual(result, null);
  });
});

// Drop placement through the Astro/SFC branches of computeImportPlacement — distinct from the script
// (.ts → .ts) and inline (.png → .css) paths above. The script-less .svelte case exercises the
// wrapperPrefix concatenation in provider.ts that fixtures with an existing block skip.
describe('AutoImportOnDropProvider — framework-destination placement', () => {
  it('drop .ts into .astro (with frontmatter) yields a placement WorkspaceEdit', async () => {
    const doc = await destDocument('src/App.astro');
    const result = await drop(doc, 'src/bar.ts');
    assert.ok(result, 'expected a DocumentDropEdit for .ts into .astro');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
  });

  it('drop .ts into .vue (with <script> block) yields a placement WorkspaceEdit', async () => {
    const doc = await destDocument('src/App.vue');
    const result = await drop(doc, 'src/bar.ts');
    assert.ok(result, 'expected a DocumentDropEdit for .ts into .vue');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
  });

  it('drop .ts into a script-less .svelte wraps the import (wrapperPrefix path)', async () => {
    const uri = vscode.Uri.file(path.join(FIXTURE_ROOT, '_temp_drop_no_script.svelte'));
    await vscode.workspace.fs.writeFile(uri, Buffer.from('<div>Hello</div>\n', 'utf-8'));
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      const result = await drop(doc, 'src/bar.ts');
      assert.ok(result, 'expected a DocumentDropEdit for .ts into a script-less .svelte');
      assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
    } finally {
      try { await vscode.workspace.fs.delete(uri); } catch { /* ignore */ }
    }
  });
});
