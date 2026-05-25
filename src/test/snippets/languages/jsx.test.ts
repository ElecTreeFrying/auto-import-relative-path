import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildSnippet } from '../../../snippets/languages/jsx';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../../qa/workspace');
const DEST_DIR = path.join(FIXTURE_ROOT, 'src');
const DEST_FILE = path.join(DEST_DIR, 'foo.ts');

function source(name: string): string {
  return path.join(DEST_DIR, name);
}

describe('jsx', () => {
  before(async () => {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(DEST_FILE));
    await vscode.window.showTextDocument(doc);
  });

  after(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  it('.js source routes through JS import style (default)', async () => {
    await vscode.env.clipboard.writeText(source('bar.js'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import $1 from './bar';");
  });

  it('.jsx source routes through JS import style (primary match)', async () => {
    await vscode.env.clipboard.writeText(source('App.jsx'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import $1 from './App';");
  });

  it('CSS Module .module.css produces styles import', async () => {
    await vscode.env.clipboard.writeText(source('app.module.css'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:styles} from './app.module.css';");
  });

  it('image .png produces name import', async () => {
    await vscode.env.clipboard.writeText(source('logo.png'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:name} from './logo.png';");
  });

  it('data .json produces name import', async () => {
    await vscode.env.clipboard.writeText(source('config.json'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:name} from './config.json';");
  });

  it('media .mp4 produces url import', async () => {
    await vscode.env.clipboard.writeText(source('clip.mp4'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:url} from './clip.mp4';");
  });

  it('text track .vtt produces url import', async () => {
    await vscode.env.clipboard.writeText(source('subs.vtt'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import ${1:url} from './subs.vtt';");
  });

  it('non-module stylesheet .css produces side-effect import', async () => {
    await vscode.env.clipboard.writeText(source('styles.css'));
    const result = await buildSnippet();
    assert.strictEqual(result.value, "import './styles.css';");
  });
});
