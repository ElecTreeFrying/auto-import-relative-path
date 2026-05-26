import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildImportSnippet } from '../../snippets/dispatch';
import { getFilePathInfo } from '../../editor/file-path-info';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../qa/workspace');

async function openFixture(relativePath: string): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  await vscode.window.showTextDocument(doc);
}

async function closeEditor(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

describe('buildImportSnippet', () => {
  afterEach(async () => {
    await closeEditor();
  });

  it('.js destination produces JavaScript builder output', async () => {
    await openFixture('with-requires.js');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.js'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.ok(result.value.length > 0, 'expected non-empty snippet');
    assert.ok(result.value.includes('./src/bar'), `expected relative path in: ${result.value}`);
  });

  it('.ts destination produces TypeScript builder output', async () => {
    await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './bar';");
  });

  it('.jsx destination produces JSX builder output', async () => {
    await openFixture('src/badge.jsx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/util.js'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import $1 from './util';");
  });

  it('.tsx destination produces TSX builder output', async () => {
    await openFixture('unicode-paths/café-menu.tsx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'unicode-paths/widget.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './widget';");
  });

  it('.mdx destination routes to TSX builder (same case as .tsx)', async () => {
    await openFixture('docs/example.mdx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'docs/helper.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './helper';");
  });

  it('.css destination with .css source produces CSS builder output', async () => {
    await openFixture('styles/reset.css');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/global.css'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "@import './global.css';");
  });

  it('.scss destination with .scss source produces SCSS builder output', async () => {
    await openFixture('styles/tokens.scss');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/secondary.scss'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "@use './secondary';");
  });

  it('.html destination with .js source produces HTML script tag', async () => {
    await openFixture('pages/index.html');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'pages/app.js'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, '<script src="./app.js"></script>');
  });

  it('.md destination with .md source produces Markdown link', async () => {
    await openFixture('docs/guide.md');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'docs/architecture.md'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, '[${1:text}](./architecture.md)');
  });

  it('.vue destination produces framework-component builder output', async () => {
    await openFixture('src/App.vue');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './bar';");
  });

  it('.svelte destination produces framework-component builder output', async () => {
    await openFixture('src/App.svelte');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './bar';");
  });

  it('.astro destination produces framework-component builder output', async () => {
    await openFixture('src/App.astro');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './bar';");
  });

  it('unsupported destination extension produces empty SnippetString', async () => {
    await openFixture('unsupported/Main.java');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, '');
  });
});
