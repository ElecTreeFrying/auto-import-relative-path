import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildSnippet, buildJavaScriptImportSnippetByStyle } from '../../../snippets/languages/javascript';
import { getFilePathInfo } from '../../../editor/file-path-info';

const PATH = './utils/helper';
// The default-import positions pre-fill the binding with the camelCased source basename ('helper').
const NAME = '${1:helper}';

describe('buildJavaScriptImportSnippetByStyle', () => {
  it('index 0: ES module default import (basename-derived binding)', () => {
    const result = buildJavaScriptImportSnippetByStyle(0, PATH);
    assert.strictEqual(result.value, `import ${NAME} from '${PATH}';`);
  });

  it('index 1: ES module named import (not pre-filled)', () => {
    const result = buildJavaScriptImportSnippetByStyle(1, PATH);
    assert.strictEqual(result.value, `import { $1 } from '${PATH}';`);
  });

  it('index 2: ES module default + named import (default half pre-filled)', () => {
    const result = buildJavaScriptImportSnippetByStyle(2, PATH);
    assert.strictEqual(result.value, `import ${NAME}, { $2 } from '${PATH}';`);
  });

  it('index 3: ES module namespace import (basename-derived binding)', () => {
    const result = buildJavaScriptImportSnippetByStyle(3, PATH);
    assert.strictEqual(result.value, `import * as ${NAME} from '${PATH}';`);
  });

  it('index 4: ES module side-effect import (no binding)', () => {
    const result = buildJavaScriptImportSnippetByStyle(4, PATH);
    assert.strictEqual(result.value, `import '${PATH}';`);
  });

  it('index 5: CommonJS require (basename-derived binding)', () => {
    const result = buildJavaScriptImportSnippetByStyle(5, PATH);
    assert.strictEqual(result.value, `const ${NAME} = require('${PATH}');`);
  });

  it('index 6: dynamic import (basename-derived binding)', () => {
    const result = buildJavaScriptImportSnippetByStyle(6, PATH);
    assert.strictEqual(result.value, `const ${NAME} = await import('${PATH}');`);
  });

  it('undefined falls back to default (same as index 0)', () => {
    const result = buildJavaScriptImportSnippetByStyle(undefined, PATH);
    assert.strictEqual(result.value, `import ${NAME} from '${PATH}';`);
  });

  it('falls back to a bare $1 when the basename yields no legal identifier', () => {
    const result = buildJavaScriptImportSnippetByStyle(0, './assets/404');
    assert.strictEqual(result.value, "import $1 from './assets/404';");
  });
});

// A framework SFC (.vue/.svelte/.astro) source imported into a .js destination is a component
// default import via the shared asset switch — PascalCase-named, full extension kept — not the
// extension-stripping script path, and never the configured JavaScript style.
describe('buildSnippet — framework-component sources into .js', () => {
  const FIXTURE_ROOT = path.resolve(__dirname, '../../../../src/test/fixtures');
  const DEST_DIR = path.join(FIXTURE_ROOT, 'src');

  before(async () => {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(DEST_DIR, 'sibling.js')));
    await vscode.window.showTextDocument(doc);
  });

  after(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  async function snippetFor(sourceName: string): Promise<string> {
    await vscode.env.clipboard.writeText(path.join(DEST_DIR, sourceName));
    const info = await getFilePathInfo();
    return buildSnippet(info).value;
  }

  it('.vue source derives a PascalCase component default import (extension kept)', async () => {
    assert.strictEqual(await snippetFor('App.vue'), "import ${1:App} from './App.vue';");
  });

  it('.svelte source derives a PascalCase component default import', async () => {
    assert.strictEqual(await snippetFor('Widget.svelte'), "import ${1:Widget} from './Widget.svelte';");
  });

  it('.astro source derives a PascalCase component default import', async () => {
    assert.strictEqual(await snippetFor('App.astro'), "import ${1:App} from './App.astro';");
  });
});
