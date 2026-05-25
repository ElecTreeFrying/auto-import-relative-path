import * as assert from 'assert';

import {
  buildMarkdownImportSnippet,
  buildMarkdownImageImportSnippetByStyle,
} from '../../../snippets/languages/markdown';

describe('markdown', () => {
  describe('buildMarkdownImportSnippet', () => {
    it('produces link with pre-filled text placeholder', () => {
      const result = buildMarkdownImportSnippet('./docs/readme.md');
      assert.strictEqual(result.value, '[${1:text}](./docs/readme.md)');
    });

    it('preserves full .md extension on path', () => {
      const result = buildMarkdownImportSnippet('./notes/changelog.md');
      assert.ok(result.value.includes('.md'), 'expected .md extension preserved');
    });
  });

  describe('buildMarkdownImageImportSnippetByStyle', () => {
    const PATH = './assets/logo.png';

    it('index 0: bare inline image with alt-text placeholder', () => {
      const result = buildMarkdownImageImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `![\${1:alt-text}](${PATH})`);
    });

    it('index 1: inline image with hover-text title placeholder', () => {
      const result = buildMarkdownImageImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `![\${1:alt-text}](${PATH} "\${2:Hover text}")`);
    });

    it('index 2: HTML img embed with alt, width, height tab stops', () => {
      const result = buildMarkdownImageImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `<img src="${PATH}" alt="$1" width="$2" height="$3">`);
    });

    it('undefined falls back to default (same as index 0)', () => {
      const result = buildMarkdownImageImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, `![\${1:alt-text}](${PATH})`);
    });

    it('preserves full extension on image path', () => {
      const result = buildMarkdownImageImportSnippetByStyle(0, './assets/photo.jpeg');
      assert.ok(result.value.includes('.jpeg'), 'expected .jpeg extension preserved');
    });
  });
});
