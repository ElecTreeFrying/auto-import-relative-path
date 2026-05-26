import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildSnippet } from '../../../snippets/languages/framework-component';
import { getFilePathInfo } from '../../../editor/file-path-info';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../../qa/workspace');
const DEST_DIR = path.join(FIXTURE_ROOT, 'src');
const DEST_FILE = path.join(DEST_DIR, 'foo.ts');

function source(name: string): string {
  return path.join(DEST_DIR, name);
}

describe('framework-component', () => {
  before(async () => {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(DEST_FILE));
    await vscode.window.showTextDocument(doc);
  });

  after(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  it('.ts source uses TS import style with extension stripped', async () => {
    await vscode.env.clipboard.writeText(source('bar.ts'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './bar';");
  });

  it('.js source routes through TS builder (not JS)', async () => {
    await vscode.env.clipboard.writeText(source('util.js'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './util';");
  });

  it('.jsx source routes through TS builder', async () => {
    await vscode.env.clipboard.writeText(source('App.jsx'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './App';");
  });

  it('image source preserves full extension', async () => {
    await vscode.env.clipboard.writeText(source('logo.png'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './logo.png';");
  });

  it('.json source preserves full extension', async () => {
    await vscode.env.clipboard.writeText(source('config.json'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './config.json';");
  });

  it('.vue self-import preserves .vue extension', async () => {
    await vscode.env.clipboard.writeText(source('App.vue'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './App.vue';");
  });

  it('.svelte self-import preserves .svelte extension', async () => {
    await vscode.env.clipboard.writeText(source('Widget.svelte'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './Widget.svelte';");
  });

  it('Angular .component source gets PascalCase at index 0 (no class detection)', async () => {
    await vscode.env.clipboard.writeText(source('app-root.component.ts'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { AppRootComponent } from './app-root.component';");
  });
});
