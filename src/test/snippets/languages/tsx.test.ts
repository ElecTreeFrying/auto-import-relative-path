import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildSnippet } from '../../../snippets/languages/tsx';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../../qa/workspace');
const DEST_DIR = path.join(FIXTURE_ROOT, 'src');
const DEST_FILE = path.join(DEST_DIR, 'foo.ts');

function source(name: string): string {
  return path.join(DEST_DIR, name);
}

describe('tsx', () => {
  before(async () => {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(DEST_FILE));
    await vscode.window.showTextDocument(doc);
  });

  after(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  it('.ts source routes through TS import style (default)', async () => {
    await vscode.env.clipboard.writeText(source('bar.ts'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import { $1 } from './bar';");
  });

  it('.tsx source routes through TS import style (primary match)', async () => {
    await vscode.env.clipboard.writeText(source('App.tsx'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import { $1 } from './App';");
  });

  it('.js source routes through JS import style (fallback)', async () => {
    await vscode.env.clipboard.writeText(source('util.js'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import $1 from './util';");
  });

  it('CSS Module .module.scss produces styles import', async () => {
    await vscode.env.clipboard.writeText(source('app.module.scss'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:styles} from './app.module.scss';");
  });

  it('image .png produces name import', async () => {
    await vscode.env.clipboard.writeText(source('logo.png'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:name} from './logo.png';");
  });

  it('media .mp4 produces url import', async () => {
    await vscode.env.clipboard.writeText(source('clip.mp4'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:url} from './clip.mp4';");
  });

  it('font .woff produces side-effect import', async () => {
    await vscode.env.clipboard.writeText(source('font.woff'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import './font.woff';");
  });

  it('non-module stylesheet .css produces side-effect import', async () => {
    await vscode.env.clipboard.writeText(source('styles.css'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import './styles.css';");
  });
});
