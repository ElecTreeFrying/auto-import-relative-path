import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildImportSnippet } from '../../snippets/dispatch';
import { getFilePathInfo } from '../../editor/file-path-info';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

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

  it('.tsx destination skips class detection for source with export class', async () => {
    await openFixture('src/widget.tsx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/lib/event-bus.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, "import { $1 } from './lib/event-bus';");
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

  // The 13th destination. latex.buildSnippet is exhaustively unit-tested in
  // snippets/languages/latex.test.ts; this pins the dispatch.ts wire (case '.tex') that routes to it —
  // the parity guard in dispatch-variants-parity.test.ts only checks the case label exists, not that it
  // reaches the right builder. \includegraphics is unique to the LaTeX graphics arm and present in all
  // three graphics styles, so the assertion survives any ambient style/preserve config a sibling left.
  it('.tex destination produces LaTeX builder output', async () => {
    await openFixture('paper/main.tex');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'assets/logo.png'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.ok(
      result.value.includes('\\includegraphics'),
      `expected LaTeX graphics output through dispatch, got: "${result.value}"`,
    );
  });

  it('unsupported destination extension produces empty SnippetString', async () => {
    await openFixture('unsupported/Main.java');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, '');
  });

  // .jsx passes gating (cross-import destination) but the JSX builder has no .ts/.tsx branch —
  // the empty snippet is what the clause 10/11 backstop relies on.
  it('.ts source into .jsx destination produces empty SnippetString (gating-passes backstop)', async () => {
    await openFixture('src/badge.jsx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, '');
  });

  it('.tsx source into .jsx destination produces empty SnippetString (gating-passes backstop)', async () => {
    await openFixture('src/badge.jsx');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/widget.tsx'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, '');
  });

  // Same-extension pair passes gating (clause 1) but the dispatch switch has no .json case,
  // so it falls to the default empty-snippet backstop.
  it('.json into .json produces empty SnippetString (same-ext non-dispatch backstop)', async () => {
    await openFixture('data/config.json');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'data/feature-flags.json'));
    const info = await getFilePathInfo();
    const result = await buildImportSnippet(info);
    assert.strictEqual(result.value, '');
  });
});
