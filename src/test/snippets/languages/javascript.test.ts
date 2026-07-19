import * as assert from 'assert';

import { buildJavaScriptImportSnippetByStyle } from '../../../snippets/languages/javascript';

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
