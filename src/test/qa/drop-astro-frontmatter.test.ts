import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { AutoImportOnDropProvider } from '../../drop/provider';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');
const provider = new AutoImportOnDropProvider();

async function closeAll(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

/** Builds a DataTransfer carrying a single `text/uri-list` entry for the given absolute path. */
function dataTransferFor(absPath: string): vscode.DataTransfer {
  const transfer = new vscode.DataTransfer();
  transfer.set('text/uri-list', new vscode.DataTransferItem(vscode.Uri.file(absPath).toString()));
  return transfer;
}

/** Drops onto a throwaway destination, applies the edit, and returns the resulting text. */
async function textAfterDrop(tempName: string, content: string, sourceRel: string): Promise<string> {
  const tempUri = vscode.Uri.file(path.join(FIXTURE_ROOT, tempName));
  await vscode.workspace.fs.writeFile(tempUri, Buffer.from(content, 'utf-8'));
  try {
    const doc = await vscode.workspace.openTextDocument(tempUri);
    await vscode.window.showTextDocument(doc);
    const token = new vscode.CancellationTokenSource().token;
    const result = await provider.provideDocumentDropEdits(
      doc, new vscode.Position(0, 0), dataTransferFor(path.join(FIXTURE_ROOT, sourceRel)), token);
    assert.ok(result, 'expected a drop edit');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'a fence-less .astro drop must carry a placement edit');
    assert.strictEqual(await vscode.workspace.applyEdit(result.additionalEdit), true, 'applyEdit must succeed');
    return doc.getText();
  } finally {
    await closeAll();
    await vscode.workspace.fs.delete(tempUri);
  }
}

// astro.md §9.10 — the command layer's create-if-missing wrapper was pinned; the DROP layer's was
// not. A drop into a fence-less .astro must create the `---` frontmatter fences around the import
// (computeAstroPlacement's no-bounds branch → wrapperPrefix/wrapperSuffix), never land it bare in
// the template region.
describe('astro.md §9.10 — drop into a fence-less .astro creates the frontmatter wrapper', () => {
  afterEach(async () => {
    await closeAll();
  });

  it('§9.10 — a dropped .tsx lands inside newly created --- fences (template line survives below)', async () => {
    const text = await textAfterDrop('_qa_fenceless.astro', '<h1>Hello</h1>\n', 'src/widget.tsx');
    const lines = text.split('\n');
    assert.strictEqual(lines[0], '---', `the opening fence must be created at the top, got: ${JSON.stringify(lines.slice(0, 4))}`);
    assert.ok(text.includes("from './src/widget'"), `the import must land inside the fences, got: ${text}`);
    const closingFence = lines.indexOf('---', 1);
    assert.ok(closingFence > 0, 'the closing fence must be created');
    const importLine = lines.findIndex(line => line.includes("from './src/widget'"));
    assert.ok(importLine > 0 && importLine < closingFence, 'the import must sit between the fences');
    const templateLine = lines.findIndex(line => line.includes('<h1>Hello</h1>'));
    assert.ok(templateLine > closingFence, 'the template markup must survive below the closing fence');
  });

  it('§9.10 — a dropped .png creates the wrapper around the asset import (path keeps .png)', async () => {
    const text = await textAfterDrop('_qa_fenceless_asset.astro', '<h1>Hello</h1>\n', 'assets/logo.png');
    const lines = text.split('\n');
    assert.strictEqual(lines[0], '---', 'the opening fence must be created at the top');
    assert.ok(text.includes('./assets/logo.png'), `the asset path must keep .png, got: ${text}`);
    const closingFence = lines.indexOf('---', 1);
    const importLine = lines.findIndex(line => line.includes('./assets/logo.png'));
    assert.ok(importLine > 0 && importLine < closingFence, 'the asset import must sit between the fences');
  });
});
