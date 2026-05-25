import * as assert from 'assert';

import { buildCssImportSnippetByStyle, buildCssImageImportSnippet } from '../../../snippets/languages/css';

const PATH = './styles/theme';

describe('css', () => {
  describe('buildCssImportSnippetByStyle', () => {
    it('index 0: @import with quoted path', () => {
      const result = buildCssImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `@import '${PATH}';`);
    });

    it('index 1: @import with url() function', () => {
      const result = buildCssImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `@import url('${PATH}');`);
    });

    it('undefined falls back to default (same as index 0)', () => {
      const result = buildCssImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, `@import '${PATH}';`);
    });
  });

  describe('buildCssImageImportSnippet', () => {
    it('produces url() with full .png extension preserved', () => {
      const result = buildCssImageImportSnippet('./assets/logo.png');
      assert.strictEqual(result.value, "url('./assets/logo.png')");
    });

    it('produces url() with full .svg extension preserved', () => {
      const result = buildCssImageImportSnippet('./assets/icon.svg');
      assert.strictEqual(result.value, "url('./assets/icon.svg')");
    });
  });
});
