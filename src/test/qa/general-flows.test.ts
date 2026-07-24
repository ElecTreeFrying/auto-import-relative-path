import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executePasteImport } from '../../commands/paste-import';
import { setAutoImportSetting } from '../../config/settings';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

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

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('general.md §3.2 — same-file rejection is case-insensitive', () => {
  let warningMessages: string[] = [];
  let originalShowWarningMessage: typeof vscode.window.showWarningMessage;

  beforeEach(() => {
    warningMessages = [];
    originalShowWarningMessage = vscode.window.showWarningMessage;
    (vscode.window as { showWarningMessage: unknown }).showWarningMessage = (message: string) => {
      warningMessages.push(message);
      return Promise.resolve(undefined);
    };
  });

  afterEach(async () => {
    (vscode.window as { showWarningMessage: unknown }).showWarningMessage = originalShowWarningMessage;
    await closeAll();
  });

  it('§3.2 — a case-flipped clipboard path still rejects as same-file (exact toast, no change)', async () => {
    // The guard compares lower-cased paths BEFORE fs.stat, so the flipped path needs no real file —
    // portable to case-sensitive filesystems.
    const editor = await openFixture('src/foo.ts');
    const flipped = path.join(FIXTURE_ROOT, 'src/FOO.TS');
    await vscode.env.clipboard.writeText(flipped);
    const changed = await waitForDocumentChange(() => executePasteImport());
    assert.strictEqual(changed, false, 'a case-flipped self-import must not insert');
    assert.ok(warningMessages.includes('Auto Import: A file cannot import itself.'),
      `got: ${JSON.stringify(warningMessages)}`);
    assert.ok(!editor.document.getText().includes('FOO'), 'nothing may land in the document');
  });
});

describe('general.md §6.1/§6.2 — rapid pastes stack; the clipboard retains the path', () => {
  afterEach(async () => {
    await closeAll();
  });

  it('§6.1 — three pastes of the same source each land, stacking to three imports', async () => {
    // A snippet insertion emits more than one change event, so counting events would double-fire;
    // instead each round polls the document until its import has actually landed.
    const editor = await openFixture('src/foo.ts');
    const sourcePath = path.join(FIXTURE_ROOT, 'src/bar.ts');
    await vscode.env.clipboard.writeText(sourcePath);
    for (let round = 1; round <= 3; round++) {
      await executePasteImport();
      const deadline = Date.now() + 2000;
      while (countOccurrences(editor.document.getText(), "from './bar'") < round && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      assert.strictEqual(countOccurrences(editor.document.getText(), "from './bar'"), round,
        `paste ${round} must stack to ${round} imports, got: ${editor.document.getText().slice(0, 300)}`);
    }
  });

  it('§6.2 — one copy pastes into three destinations; the clipboard still holds the path afterward', async () => {
    const sourcePath = path.join(FIXTURE_ROOT, 'src/bar.ts');
    await vscode.env.clipboard.writeText(sourcePath);
    for (const destination of ['src/foo.ts', 'src/helpers.ts', 'unicode-paths/日本語.ts']) {
      const editor = await openFixture(destination);
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, `paste into ${destination} must insert`);
      assert.ok(editor.document.getText().includes('/bar'),
        `expected the bar import in ${destination}, got: ${editor.document.getText().slice(0, 200)}`);
      await closeAll();
    }
    assert.strictEqual(await vscode.env.clipboard.readText(), sourcePath,
      'the clipboard must retain the copied path across pastes');
  });
});

// The extension reads settings fresh on every operation — no caching. Each flow performs an
// operation, changes the setting mid-session, repeats the operation, and asserts the new behavior.
describe('general.md §11 — settings are read fresh on every paste (no caching)', () => {
  afterEach(async () => {
    await Promise.all([
      setAutoImportSetting('script', 'typescript', undefined),
      setAutoImportSetting('preferences', 'placement', undefined),
      setAutoImportSetting('script', 'preserve', undefined),
    ]);
    await closeAll();
  });

  it('§11.1 — typescriptImportStyle switched between pastes: the second insert uses the new style', async () => {
    const editor = await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    let changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'the first paste must insert');
    assert.ok(editor.document.getText().includes('import {'),
      `the first paste must use the default named style, got: ${editor.document.getText().slice(0, 200)}`);

    await setAutoImportSetting('script', 'typescript', "import * as name from '_relativePath_';");
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/api-client.ts'));
    changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'the second paste must insert');
    const allText = editor.document.getText();
    assert.ok(allText.includes('import * as'), `the second paste must use the namespace style, got: ${allText.slice(0, 300)}`);
    assert.ok(allText.includes("from './api-client'"), 'the namespace import must target the second source');
  });

  it('§11.2 — placement Bottom then Top: the second import lands on the first line', async () => {
    const editor = await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    let changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'the Bottom-mode paste must insert');

    await setAutoImportSetting('preferences', 'placement', 'Top');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/api-client.ts'));
    changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'the Top-mode paste must insert');
    assert.ok(editor.document.lineAt(0).text.includes('./api-client'),
      `Top mode must land the import on the first line, got: ${editor.document.lineAt(0).text}`);
  });

  it('§11.3 — preserve false then true: the second path carries .ts', async () => {
    const editor = await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    let changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'the first paste must insert');
    assert.ok(editor.document.getText().includes("from './bar'"), 'the first path must be stripped');

    await setAutoImportSetting('script', 'preserve', true);
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/api-client.ts'));
    changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'the second paste must insert');
    assert.ok(editor.document.getText().includes("from './api-client.ts'"),
      `the second path must keep .ts, got: ${editor.document.getText().slice(0, 300)}`);
  });
});
