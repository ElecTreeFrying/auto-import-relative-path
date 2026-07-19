import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildSnippet } from '../../../snippets/languages/jsx';
import { getFilePathInfo } from '../../../editor/file-path-info';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../../src/test/fixtures');
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

  it('.js source routes through JS import style (default, basename-derived binding)', async () => {
    await vscode.env.clipboard.writeText(source('bar.js'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:bar} from './bar';");
  });

  it('.jsx source routes through JS import style (primary match; component case preserved)', async () => {
    await vscode.env.clipboard.writeText(source('App.jsx'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:App} from './App';");
  });

  it('CSS Module .module.css produces styles import', async () => {
    await vscode.env.clipboard.writeText(source('app.module.css'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:styles} from './app.module.css';");
  });

  it('image .png produces a name import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('logo.png'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:logo} from './logo.png';");
  });

  it('data .json produces a name import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('config.json'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:config} from './config.json';");
  });

  it('media .mp4 produces a url import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('clip.mp4'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:clip} from './clip.mp4';");
  });

  it('text track .vtt produces a url import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('subs.vtt'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:subs} from './subs.vtt';");
  });

  it('non-module stylesheet .css produces side-effect import', async () => {
    await vscode.env.clipboard.writeText(source('styles.css'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import './styles.css';");
  });
});
