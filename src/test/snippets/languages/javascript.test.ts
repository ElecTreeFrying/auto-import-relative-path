import * as assert from 'assert';

import { buildJavaScriptImportSnippetByStyle } from '../../../snippets/languages/javascript';

const PATH = './utils/helper';

describe('buildJavaScriptImportSnippetByStyle', () => {
  it('index 0: ES module default import', () => {
    const result = buildJavaScriptImportSnippetByStyle(0, PATH);
    assert.strictEqual(result.value, `import $1 from '${PATH}';`);
  });

  it('index 1: ES module named import', () => {
    const result = buildJavaScriptImportSnippetByStyle(1, PATH);
    assert.strictEqual(result.value, `import { $1 } from '${PATH}';`);
  });

  it('index 2: ES module default + named import', () => {
    const result = buildJavaScriptImportSnippetByStyle(2, PATH);
    assert.strictEqual(result.value, `import $1, { $2 } from '${PATH}';`);
  });

  it('index 3: ES module namespace import', () => {
    const result = buildJavaScriptImportSnippetByStyle(3, PATH);
    assert.strictEqual(result.value, `import * as $1 from '${PATH}';`);
  });

  it('index 4: ES module side-effect import', () => {
    const result = buildJavaScriptImportSnippetByStyle(4, PATH);
    assert.strictEqual(result.value, `import '${PATH}';`);
  });

  it('index 5: CommonJS require', () => {
    const result = buildJavaScriptImportSnippetByStyle(5, PATH);
    assert.strictEqual(result.value, `const $1 = require('${PATH}');`);
  });

  it('index 6: dynamic import', () => {
    const result = buildJavaScriptImportSnippetByStyle(6, PATH);
    assert.strictEqual(result.value, `const $1 = await import('${PATH}');`);
  });

  it('undefined falls back to default (same as index 0)', () => {
    const result = buildJavaScriptImportSnippetByStyle(undefined, PATH);
    assert.strictEqual(result.value, `import $1 from '${PATH}';`);
  });
});
