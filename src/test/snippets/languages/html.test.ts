import * as assert from 'assert';
import * as path from 'path';

import {
  buildSnippet,
  buildHtmlScriptImportSnippetByStyle,
  buildHtmlImageImportSnippetByStyle,
  buildHtmlVideoImportSnippetByStyle,
  buildHtmlAudioImportSnippetByStyle,
  buildHtmlStylesheetImportSnippet,
  buildHtmlTextTrackImportSnippet,
} from '../../../snippets/languages/html';
import { FilePathInfo } from '../../../editor/file-path-info';
import { FileExtension } from '../../../types/file-extension';

describe('html', () => {
  describe('buildHtmlScriptImportSnippetByStyle', () => {
    const PATH = './scripts/app.js';

    it('index 0: modern minimal (no type attribute)', () => {
      const result = buildHtmlScriptImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `<script src="${PATH}"></script>`);
    });

    it('index 1: deferred execution', () => {
      const result = buildHtmlScriptImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `<script src="${PATH}" defer></script>`);
    });

    it('index 2: ES module', () => {
      const result = buildHtmlScriptImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `<script type="module" src="${PATH}"></script>`);
    });

    it('index 3: async execution', () => {
      const result = buildHtmlScriptImportSnippetByStyle(3, PATH);
      assert.strictEqual(result.value, `<script src="${PATH}" async></script>`);
    });

    it('index 4: legacy with type="text/javascript"', () => {
      const result = buildHtmlScriptImportSnippetByStyle(4, PATH);
      assert.strictEqual(result.value, `<script type="text/javascript" src="${PATH}"></script>`);
    });

    it('undefined falls back to default (same as index 0)', () => {
      const result = buildHtmlScriptImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, `<script src="${PATH}"></script>`);
    });
  });

  describe('buildHtmlImageImportSnippetByStyle', () => {
    const PATH = './assets/logo.png';

    it('index 0: literal alt="sample" (no tab stop)', () => {
      const result = buildHtmlImageImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `<img src="${PATH}" alt="sample">`);
    });

    it('index 1: alt tab stop with lazy loading', () => {
      const result = buildHtmlImageImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `<img src="${PATH}" alt="$1" loading="lazy">`);
    });

    it('index 2: alt, width, height tab stops', () => {
      const result = buildHtmlImageImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `<img src="${PATH}" alt="$1" width="$2" height="$3">`);
    });

    it('undefined falls back to default (same as index 0)', () => {
      const result = buildHtmlImageImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, `<img src="${PATH}" alt="sample">`);
    });
  });

  describe('buildHtmlVideoImportSnippetByStyle', () => {
    const PATH = './assets/clip.mp4';

    it('index 0: controls', () => {
      const result = buildHtmlVideoImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `<video src="${PATH}" controls></video>`);
    });

    it('index 1: silent autoplay (background video)', () => {
      const result = buildHtmlVideoImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `<video src="${PATH}" autoplay muted loop playsinline></video>`);
    });

    it('index 2: controls + poster tab stop', () => {
      const result = buildHtmlVideoImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `<video src="${PATH}" controls poster="$1"></video>`);
    });

    it('index 3: controls + preload metadata', () => {
      const result = buildHtmlVideoImportSnippetByStyle(3, PATH);
      assert.strictEqual(result.value, `<video src="${PATH}" controls preload="metadata"></video>`);
    });

    it('undefined falls back to default (same as index 0)', () => {
      const result = buildHtmlVideoImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, `<video src="${PATH}" controls></video>`);
    });
  });

  describe('buildHtmlAudioImportSnippetByStyle', () => {
    const PATH = './assets/track.mp3';

    it('index 0: controls', () => {
      const result = buildHtmlAudioImportSnippetByStyle(0, PATH);
      assert.strictEqual(result.value, `<audio src="${PATH}" controls></audio>`);
    });

    it('index 1: controls + preload metadata', () => {
      const result = buildHtmlAudioImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `<audio src="${PATH}" controls preload="metadata"></audio>`);
    });

    it('undefined falls back to default (same as index 0)', () => {
      const result = buildHtmlAudioImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, `<audio src="${PATH}" controls></audio>`);
    });
  });

  describe('buildHtmlStylesheetImportSnippet', () => {
    it('produces <link> with rel="stylesheet"', () => {
      const result = buildHtmlStylesheetImportSnippet('./styles/main.css');
      assert.strictEqual(result.value, '<link href="./styles/main.css" rel="stylesheet">');
    });
  });

  describe('buildHtmlTextTrackImportSnippet', () => {
    it('produces <track> with pre-filled srclang and label placeholders', () => {
      const result = buildHtmlTextTrackImportSnippet('./assets/captions.vtt');
      assert.strictEqual(
        result.value,
        '<track src="./assets/captions.vtt" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>'
      );
    });
  });

  // buildSnippet's source-type switch picks WHICH tag from a real source. The *ByStyle renderers above
  // are fully covered in isolation, but nothing drove the dispatch arms (image→<img>, video→<video>,
  // audio→<audio>, text-track→<track>, stylesheet→<link>). A deleted arm would silently emit the wrong
  // tag — or nothing — and no test above would notice.
  describe('buildSnippet (source-type dispatch)', () => {
    const info = (sourceFile: string): FilePathInfo => ({
      relativePath: './asset',
      sourceFilePath: `/w/${sourceFile}`,
      destinationFilePath: '/w/index.html',
      sourceFileExt: path.extname(sourceFile) as FileExtension,
      destinationFileExt: '.html' as FileExtension,
    });

    it('script source → <script> tag', () => {
      assert.ok(buildSnippet(info('app.js')).value.includes('<script'));
    });
    it('image source → <img> tag', () => {
      assert.ok(buildSnippet(info('logo.png')).value.includes('<img'));
    });
    it('video source → <video> tag', () => {
      assert.ok(buildSnippet(info('clip.mp4')).value.includes('<video'));
    });
    it('audio source → <audio> tag', () => {
      assert.ok(buildSnippet(info('song.mp3')).value.includes('<audio'));
    });
    it('text-track source → <track> tag', () => {
      assert.ok(buildSnippet(info('captions.vtt')).value.includes('<track'));
    });
    it('stylesheet source → <link> tag', () => {
      assert.ok(buildSnippet(info('main.css')).value.includes('<link'));
    });
  });
});
