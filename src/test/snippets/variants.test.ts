import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildImportSnippetVariants } from '../../snippets/variants';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../qa/workspace');

async function openAndQuery(destFixture: string, sourceName: string) {
  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.file(path.join(FIXTURE_ROOT, destFixture))
  );
  await vscode.window.showTextDocument(doc);
  await vscode.env.clipboard.writeText(
    path.join(FIXTURE_ROOT, path.dirname(destFixture), sourceName)
  );
  return buildImportSnippetVariants();
}

async function closeEditor(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

describe('buildImportSnippetVariants', () => {
  afterEach(async () => {
    await closeEditor();
  });

  it('.js into .js: 7 styled variants', async () => {
    const variants = await openAndQuery('with-requires.js', 'src/bar.js');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.ts into .ts: 7 styled variants', async () => {
    const variants = await openAndQuery('src/foo.ts', 'bar.ts');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.css into .css: 2 styled variants', async () => {
    const variants = await openAndQuery('styles/reset.css', 'global.css');
    assert.strictEqual(variants.length, 2);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.scss into .scss: 5 styled variants', async () => {
    const variants = await openAndQuery('styles/tokens.scss', 'secondary.scss');
    assert.strictEqual(variants.length, 5);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.js into .html: 5 styled variants (script)', async () => {
    const variants = await openAndQuery('pages/index.html', 'app.js');
    assert.strictEqual(variants.length, 5);
    assert.ok(variants[0].setting, 'styled variant should have setting');
    assert.strictEqual(variants[0].setting.namespace, 'markup');
    assert.strictEqual(variants[0].setting.key, 'htmlScript');
  });

  it('.png into .html: 3 styled variants (image)', async () => {
    const variants = await openAndQuery('pages/index.html', 'logo.png');
    assert.strictEqual(variants.length, 3);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.mp4 into .html: 4 styled variants (video)', async () => {
    const variants = await openAndQuery('pages/index.html', 'clip.mp4');
    assert.strictEqual(variants.length, 4);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.mp3 into .html: 2 styled variants (audio)', async () => {
    const variants = await openAndQuery('pages/index.html', 'track.mp3');
    assert.strictEqual(variants.length, 2);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.css into .html: 1 hardcoded variant (stylesheet)', async () => {
    const variants = await openAndQuery('pages/index.html', 'styles.css');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'hardcoded variant should omit setting');
  });

  it('.md into .md: 1 hardcoded variant (link)', async () => {
    const variants = await openAndQuery('docs/guide.md', 'architecture.md');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'hardcoded variant should omit setting');
  });

  it('.png into .md: 3 styled variants (markdown image)', async () => {
    const variants = await openAndQuery('docs/guide.md', 'logo.png');
    assert.strictEqual(variants.length, 3);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.ts into .tsx: 7 styled variants (TS)', async () => {
    const variants = await openAndQuery('unicode-paths/café-menu.tsx', 'widget.ts');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
    assert.strictEqual(variants[0].setting.key, 'typescript');
  });

  it('.png into .jsx: 1 hardcoded variant', async () => {
    const variants = await openAndQuery('src/badge.jsx', 'logo.png');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'hardcoded variant should omit setting');
  });

  it('.ts into .vue: 7 styled variants (TS)', async () => {
    const variants = await openAndQuery('src/App.vue', 'bar.ts');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
    assert.strictEqual(variants[0].setting.key, 'typescript');
  });
});
