import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executePasteImport } from '../../commands/paste-import';
import { setAutoImportSetting } from '../../config/settings';
import { AutoImportOnDropProvider } from '../../drop/provider';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');
const provider = new AutoImportOnDropProvider();

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

/** Builds a DataTransfer carrying a single `text/uri-list` entry for the given absolute path. */
function dataTransferFor(absPath: string): vscode.DataTransfer {
  const transfer = new vscode.DataTransfer();
  transfer.set('text/uri-list', new vscode.DataTransferItem(vscode.Uri.file(absPath).toString()));
  return transfer;
}

/**
 * Writes a throwaway destination, drops the source onto it, applies the resulting edit, and returns
 * the document text (the provider.test.ts `textAfterDrop` precedent — an `additionalEdit`'s content
 * is invisible through `WorkspaceEdit` accessors, so the edit must be applied and read back).
 */
async function textAfterDrop(tempName: string, content: string, sourceRel: string, line = 0, column = 0): Promise<string> {
  const tempUri = vscode.Uri.file(path.join(FIXTURE_ROOT, tempName));
  await vscode.workspace.fs.writeFile(tempUri, Buffer.from(content, 'utf-8'));
  try {
    const doc = await vscode.workspace.openTextDocument(tempUri);
    await vscode.window.showTextDocument(doc);
    const token = new vscode.CancellationTokenSource().token;
    const result = await provider.provideDocumentDropEdits(
      doc, new vscode.Position(line, column), dataTransferFor(path.join(FIXTURE_ROOT, sourceRel)), token);
    assert.ok(result, 'expected a drop edit');
    if (result.additionalEdit instanceof vscode.WorkspaceEdit) {
      assert.strictEqual(await vscode.workspace.applyEdit(result.additionalEdit), true, 'applyEdit must succeed');
    } else {
      // The insertText path (framework-component source into a script destination) — not exercised
      // here, but appended defensively so a routing change fails loudly rather than silently.
      assert.ok((result.insertText as vscode.SnippetString).value.length > 0, 'expected a non-empty insertText');
    }
    return doc.getText();
  } finally {
    await closeAll();
    await vscode.workspace.fs.delete(tempUri);
  }
}

// preserveScriptFileExtension had ZERO automated coverage — the widest gap in the audit. These
// tests pin both gesture channels: the paste path (general.md §7.5/§7.6) and the drop path (the
// §9.9-family rows across the script/framework checklists), plus the two invariants the toggle must
// NOT affect (asset extensions, derived identifiers).
describe('general.md §7.5/§7.6 — preserveScriptFileExtension on the paste path', () => {
  afterEach(async () => {
    await setAutoImportSetting('script', 'preserve', undefined);
    await closeAll();
  });

  it("§7.5 — default false strips the extension: from './bar'", async () => {
    await setAutoImportSetting('script', 'preserve', false);
    const editor = await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'expected the import to insert');
    const allText = editor.document.getText();
    assert.ok(allText.includes("from './bar'"), `expected the stripped path, got: ${allText.slice(0, 200)}`);
    assert.ok(!allText.includes('./bar.ts'), 'the .ts extension must be stripped with the toggle off');
  });

  it("§7.6 — true keeps it: from './bar.ts'", async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const editor = await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'expected the import to insert');
    assert.ok(editor.document.getText().includes("from './bar.ts'"),
      `expected the preserved path, got: ${editor.document.getText().slice(0, 200)}`);
  });
});

describe('general.md §7.7 — non-script sources keep their extension regardless of the toggle', () => {
  afterEach(async () => {
    await setAutoImportSetting('script', 'preserve', undefined);
    await closeAll();
  });

  for (const enabled of [false, true]) {
    it(`§7.7 — .png → .tsx keeps .png with the toggle ${enabled ? 'on' : 'off'}`, async () => {
      await setAutoImportSetting('script', 'preserve', enabled);
      const editor = await openFixture('src/widget.tsx');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'assets/logo.png'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the asset import to insert');
      assert.ok(editor.document.getText().includes('../assets/logo.png'),
        `the asset path must always carry .png, got: ${editor.document.getText().slice(0, 200)}`);
    });
  }
});

describe('tsx.md §5.9 — identifier stability across the toggle (Angular path derivation)', () => {
  afterEach(async () => {
    await setAutoImportSetting('script', 'preserve', undefined);
    await closeAll();
  });

  it("§5.9 — off: import { AppRootComponent } from './components/app-root.component'", async () => {
    await setAutoImportSetting('script', 'preserve', false);
    const editor = await openFixture('src/widget.tsx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/components/app-root.component.ts'));
    const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'expected the Angular-named import to insert');
    const allText = editor.document.getText();
    assert.ok(allText.includes('AppRootComponent'), `expected the PascalCase identifier, got: ${allText.slice(0, 200)}`);
    assert.ok(allText.includes("from './components/app-root.component'"), 'the path must be extension-stripped');
  });

  it('§5.9 — on: identical identifier, path gains .ts — never AppRootComponentTs', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const editor = await openFixture('src/widget.tsx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/components/app-root.component.ts'));
    const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
    assert.strictEqual(changed, true, 'expected the Angular-named import to insert');
    const allText = editor.document.getText();
    assert.ok(allText.includes('AppRootComponent'), 'the identifier must be unchanged by the toggle');
    assert.ok(!allText.includes('AppRootComponentTs'),
      'the extension must be stripped before the name is derived — never a Ts-suffixed identifier');
    assert.ok(allText.includes("from './components/app-root.component.ts'"), 'the path must keep .ts');
  });
});

// The drop provider reads the same setting through the same builders — pinned per destination
// because each checklist carries its own §9.9-family row and the routing differs per builder
// (typescript/javascript direct, _react primary+fallback, framework-component script arm).
describe('drop path — the provider honors preserveScriptFileExtension (§9.9 family)', () => {
  afterEach(async () => {
    await setAutoImportSetting('script', 'preserve', undefined);
    await closeAll();
  });

  it('[typescript.md §9.9] .ts into .ts keeps .ts when enabled', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.ts', '', 'src/bar.ts');
    assert.ok(text.includes("from './src/bar.ts'"), `got: ${text}`);
  });

  it('[typescript.md §9.9] control: toggle off strips the extension on drop', async () => {
    await setAutoImportSetting('script', 'preserve', false);
    const text = await textAfterDrop('_qa_preserve.ts', '', 'src/bar.ts');
    assert.ok(text.includes("from './src/bar'"), `got: ${text}`);
    assert.ok(!text.includes('./src/bar.ts'), 'the extension must be stripped on drop with the toggle off');
  });

  it('[javascript.md §9.7] .js into .js keeps .js when enabled', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.js', '', 'src/sibling.js');
    assert.ok(text.includes("from './src/sibling.js'"), `got: ${text}`);
  });

  it('[jsx.md §9.8] .jsx into .jsx keeps .jsx when enabled', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.jsx', '', 'src/badge.jsx');
    assert.ok(text.includes("from './src/badge.jsx'"), `got: ${text}`);
  });

  it('[tsx.md §9.9] .tsx into .tsx keeps .tsx when enabled', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.tsx', '', 'src/widget.tsx');
    assert.ok(text.includes("from './src/widget.tsx'"), `got: ${text}`);
  });

  it('[mdx.md §9.9] .tsx into .mdx keeps .tsx when enabled', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.mdx', '', 'src/widget.tsx');
    assert.ok(text.includes("from './src/widget.tsx'"), `got: ${text}`);
  });

  it('[vue.md §9.9] .tsx into .vue keeps .tsx when enabled (script arm)', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.vue', '<script>\n</script>\n', 'src/widget.tsx');
    assert.ok(text.includes("from './src/widget.tsx'"), `got: ${text}`);
  });

  it('[svelte.md §9.9] .tsx into .svelte keeps .tsx when enabled', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.svelte', '<script>\n</script>\n', 'src/widget.tsx');
    assert.ok(text.includes("from './src/widget.tsx'"), `got: ${text}`);
  });

  it('[astro.md §9.9] .tsx into .astro keeps .tsx when enabled', async () => {
    await setAutoImportSetting('script', 'preserve', true);
    const text = await textAfterDrop('_qa_preserve.astro', '---\n---\n', 'src/widget.tsx');
    assert.ok(text.includes("from './src/widget.tsx'"), `got: ${text}`);
  });
});

describe('vue/svelte/astro §9.9 — asset drops ignore the toggle', () => {
  afterEach(async () => {
    await setAutoImportSetting('script', 'preserve', undefined);
    await closeAll();
  });

  const sfcScaffolds: ReadonlyArray<{ anchor: string; tempName: string; content: string }> = [
    { anchor: 'vue.md §9.9', tempName: '_qa_asset.vue', content: '<script>\n</script>\n' },
    { anchor: 'svelte.md §9.9', tempName: '_qa_asset.svelte', content: '<script>\n</script>\n' },
    { anchor: 'astro.md §9.9', tempName: '_qa_asset.astro', content: '---\n---\n' },
  ];

  for (const { anchor, tempName, content } of sfcScaffolds) {
    it(`[${anchor}] .png drop still carries .png with the toggle on`, async () => {
      await setAutoImportSetting('script', 'preserve', true);
      const text = await textAfterDrop(tempName, content, 'assets/logo.png');
      assert.ok(text.includes('./assets/logo.png'), `the asset extension must survive the toggle, got: ${text}`);
    });
  }
});
