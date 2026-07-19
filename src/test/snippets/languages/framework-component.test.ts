import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildSnippet } from '../../../snippets/languages/framework-component';
import { getFilePathInfo } from '../../../editor/file-path-info';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../../src/test/fixtures');
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

  it('image source produces a name import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('logo.png'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:logo} from './logo.png';");
  });

  it('.json source produces a name import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('config.json'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:config} from './config.json';");
  });

  it('media source produces a url import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('clip.mp4'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:clip} from './clip.mp4';");
  });

  it('text-track source produces a url import with the basename-derived binding', async () => {
    await vscode.env.clipboard.writeText(source('subs.vtt'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:subs} from './subs.vtt';");
  });

  // Framework SFCs (.vue/.svelte/.astro) pre-fill the binding with the PascalCase component name
  // derived from the source basename (`deriveComponentName`).
  it('.vue self-import derives a PascalCase component binding', async () => {
    await vscode.env.clipboard.writeText(source('App.vue'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:App} from './App.vue';");
  });

  it('.svelte self-import derives a PascalCase component binding', async () => {
    await vscode.env.clipboard.writeText(source('Widget.svelte'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:Widget} from './Widget.svelte';");
  });

  it('.astro self-import derives a PascalCase component binding', async () => {
    await vscode.env.clipboard.writeText(source('App.astro'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:App} from './App.astro';");
  });

  it('kebab-case SFC basename PascalCases (my-button.vue → MyButton)', async () => {
    await vscode.env.clipboard.writeText(source('my-button.vue'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:MyButton} from './my-button.vue';");
  });

  it('snake_case SFC basename PascalCases (my_widget.svelte → MyWidget)', async () => {
    await vscode.env.clipboard.writeText(source('my_widget.svelte'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:MyWidget} from './my_widget.svelte';");
  });

  it('dotted SFC basename keeps interior segments (button.spec.vue → ButtonSpec)', async () => {
    await vscode.env.clipboard.writeText(source('button.spec.vue'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:ButtonSpec} from './button.spec.vue';");
  });

  it('SFC basename with no legal identifier falls back to the generic name (2fa-widget.vue)', async () => {
    await vscode.env.clipboard.writeText(source('2fa-widget.vue'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:name} from './2fa-widget.vue';");
  });

  // Markdown/MDX sources stay on the generic `name` even into a framework destination — the shipped
  // PascalCase pathway is scoped to framework SFCs (docs/import-statements/future/framework-roadmap.md).
  it('.md source keeps the generic name binding (not an SFC)', async () => {
    await vscode.env.clipboard.writeText(source('intro.md'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import ${1:name} from './intro.md';");
  });

  it('Angular .component source gets PascalCase at index 0 (no class detection)', async () => {
    await vscode.env.clipboard.writeText(source('app-root.component.ts'));
    const info = await getFilePathInfo();
    const result = buildSnippet(info);
    assert.strictEqual(result.value, "import { ${1:AppRootComponent} } from './app-root.component';");
  });
});
