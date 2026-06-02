import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { AutoImportOnDropProvider } from '../../drop/provider';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../qa/workspace');

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

describe('AutoImportOnDropProvider.provideDocumentDropEdits', () => {
  it('returns null when the source/destination pair fails gating (.ts → .css)', async () => {
    const doc = await destDocument('styles/reset.css');
    const result = await drop(doc, 'src/bar.ts');
    assert.strictEqual(result, null);
  });

  it('returns null when the dragged file is the destination itself (same-file)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'src/foo.ts');
    assert.strictEqual(result, null);
  });

  it('returns null when gating passes but the snippet is empty (.ts → .jsx backstop)', async () => {
    const doc = await destDocument('src/badge.jsx');
    const result = await drop(doc, 'src/bar.ts');
    assert.strictEqual(result, null);
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
