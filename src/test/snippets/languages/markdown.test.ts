import * as assert from 'assert';
import * as path from 'path';

import {
  buildSnippet,
  buildMarkdownImportSnippet,
  buildMarkdownImageImportSnippetByStyle,
} from '../../../snippets/languages/markdown';
import { FilePathInfo } from '../../../editor/file-path-info';
import { FileExtension } from '../../../types/file-extension';

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

  // buildSnippet's source-type switch: a .md source becomes a [text](link); an image source becomes an
  // image embed. The *ByStyle renderer above is covered in isolation, but these dispatch arms were not.
  describe('buildSnippet (source-type dispatch)', () => {
    const info = (sourceFile: string): FilePathInfo => ({
      relativePath: './asset',
      sourceFilePath: `/w/${sourceFile}`,
      destinationFilePath: '/w/guide.md',
      sourceFileExt: path.extname(sourceFile) as FileExtension,
      destinationFileExt: '.md' as FileExtension,
    });

    it('markdown source → [text](link)', () => {
      assert.ok(buildSnippet(info('readme.md')).value.startsWith('['));
    });
    it('image source → image embed', () => {
      const value = buildSnippet(info('logo.png')).value;
      assert.ok(value.startsWith('![') || value.startsWith('<img'), `got "${value}"`);
    });
  });
});
