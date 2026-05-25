import * as assert from 'assert';

import { buildScssImportSnippetByStyle, prepareScssImportPath } from '../../../snippets/languages/scss';
import { buildCssImageImportSnippet } from '../../../snippets/languages/css';

const PATH = './styles/theme';

describe('scss', () => {
  describe('buildScssImportSnippetByStyle', () => {
    it('index 0: @use with quoted path', () => {
      const result = buildScssImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `@use '${PATH}';`);
    });

    it('index 1: @use with wildcard alias', () => {
      const result = buildScssImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `@use '${PATH}' as \${1:*};`);
    });

    it('index 2: @use with named alias', () => {
      const result = buildScssImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `@use '${PATH}' as $1;`);
    });

    it('index 3: @forward', () => {
      const result = buildScssImportSnippetByStyle(3, PATH);
      assert.strictEqual(result.value, `@forward '${PATH}';`);
    });

    it('index 4: legacy @import', () => {
      const result = buildScssImportSnippetByStyle(4, PATH);
      assert.strictEqual(result.value, `@import '${PATH}';`);
    });

    it('undefined falls back to default (same as index 0)', () => {
      const result = buildScssImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, `@use '${PATH}';`);
    });
  });

  describe('prepareScssImportPath', () => {
    it('strips leading _ from last path segment (partial normalization)', () => {
      const result = prepareScssImportPath('/project/styles/_variables.scss', './styles/_variables');
      assert.strictEqual(result, './styles/variables');
    });

    it('strips _ only from last segment, not intermediate segments', () => {
      const result = prepareScssImportPath('/project/components/_buttons/_base.scss', './components/_buttons/_base');
      assert.strictEqual(result, './components/_buttons/base');
    });

    it('.css source always preserves .css extension', () => {
      const result = prepareScssImportPath('/project/styles/reset.css', './styles/reset');
      assert.strictEqual(result, './styles/reset.css');
    });

    it('.scss source with default preserve=false strips extension', () => {
      const result = prepareScssImportPath('/project/styles/theme.scss', './styles/theme');
      assert.strictEqual(result, './styles/theme');
    });
  });

  describe('image source reuses buildCssImageImportSnippet', () => {
    it('produces url() with .png extension preserved', () => {
      const result = buildCssImageImportSnippet('./assets/logo.png');
      assert.strictEqual(result.value, "url('./assets/logo.png')");
    });

    it('produces url() with .svg extension preserved', () => {
      const result = buildCssImageImportSnippet('./assets/icon.svg');
      assert.strictEqual(result.value, "url('./assets/icon.svg')");
    });
  });
});
