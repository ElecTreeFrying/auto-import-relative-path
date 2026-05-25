import * as assert from 'assert';

import {
  resolveStyleIndex,
  JAVASCRIPT_IMPORT_OPTIONS,
  TYPESCRIPT_IMPORT_OPTIONS,
  CSS_IMPORT_OPTIONS,
  CSS_IMAGE_IMPORT_OPTIONS,
  SCSS_IMPORT_OPTIONS,
  HTML_SCRIPT_IMPORT_OPTIONS,
  HTML_IMAGE_IMPORT_OPTIONS,
  HTML_VIDEO_IMPORT_OPTIONS,
  HTML_AUDIO_IMPORT_OPTIONS,
  HTML_STYLESHEET_IMPORT_OPTIONS,
  MARKDOWN_IMPORT_OPTIONS,
  MARKDOWN_IMAGE_IMPORT_OPTIONS,
} from '../../snippets/_styles';

describe('snippets/styles', () => {
  describe('table lengths', () => {
    it('JAVASCRIPT_IMPORT_OPTIONS has 7 entries', () => {
      assert.strictEqual(JAVASCRIPT_IMPORT_OPTIONS.length, 7);
    });

    it('TYPESCRIPT_IMPORT_OPTIONS has 7 entries', () => {
      assert.strictEqual(TYPESCRIPT_IMPORT_OPTIONS.length, 7);
    });

    it('CSS_IMPORT_OPTIONS has 2 entries', () => {
      assert.strictEqual(CSS_IMPORT_OPTIONS.length, 2);
    });

    it('CSS_IMAGE_IMPORT_OPTIONS has 1 entry (single-shape)', () => {
      assert.strictEqual(CSS_IMAGE_IMPORT_OPTIONS.length, 1);
    });

    it('SCSS_IMPORT_OPTIONS has 5 entries', () => {
      assert.strictEqual(SCSS_IMPORT_OPTIONS.length, 5);
    });

    it('HTML_SCRIPT_IMPORT_OPTIONS has 5 entries', () => {
      assert.strictEqual(HTML_SCRIPT_IMPORT_OPTIONS.length, 5);
    });

    it('HTML_IMAGE_IMPORT_OPTIONS has 3 entries', () => {
      assert.strictEqual(HTML_IMAGE_IMPORT_OPTIONS.length, 3);
    });

    it('HTML_VIDEO_IMPORT_OPTIONS has 4 entries', () => {
      assert.strictEqual(HTML_VIDEO_IMPORT_OPTIONS.length, 4);
    });

    it('HTML_AUDIO_IMPORT_OPTIONS has 2 entries', () => {
      assert.strictEqual(HTML_AUDIO_IMPORT_OPTIONS.length, 2);
    });

    it('HTML_STYLESHEET_IMPORT_OPTIONS has 1 entry (single-shape)', () => {
      assert.strictEqual(HTML_STYLESHEET_IMPORT_OPTIONS.length, 1);
    });

    it('MARKDOWN_IMPORT_OPTIONS has 1 entry (single-shape)', () => {
      assert.strictEqual(MARKDOWN_IMPORT_OPTIONS.length, 1);
    });

    it('MARKDOWN_IMAGE_IMPORT_OPTIONS has 3 entries', () => {
      assert.strictEqual(MARKDOWN_IMAGE_IMPORT_OPTIONS.length, 3);
    });
  });

  describe('resolveStyleIndex', () => {
    it('returns correct index for first entry', () => {
      const result = resolveStyleIndex(
        JAVASCRIPT_IMPORT_OPTIONS,
        JAVASCRIPT_IMPORT_OPTIONS[0].description
      );
      assert.strictEqual(result, 0);
    });

    it('returns correct index for middle entry', () => {
      const result = resolveStyleIndex(
        JAVASCRIPT_IMPORT_OPTIONS,
        JAVASCRIPT_IMPORT_OPTIONS[3].description
      );
      assert.strictEqual(result, 3);
    });

    it('returns correct index for last entry', () => {
      const result = resolveStyleIndex(
        JAVASCRIPT_IMPORT_OPTIONS,
        JAVASCRIPT_IMPORT_OPTIONS[6].description
      );
      assert.strictEqual(result, 6);
    });

    it('returns undefined for undefined input', () => {
      const result = resolveStyleIndex(JAVASCRIPT_IMPORT_OPTIONS, undefined);
      assert.strictEqual(result, undefined);
    });

    it('returns undefined for unrecognized string', () => {
      const result = resolveStyleIndex(JAVASCRIPT_IMPORT_OPTIONS, 'not a real description');
      assert.strictEqual(result, undefined);
    });
  });

  describe('default descriptions byte-match package.json', () => {
    it('JS default matches index 0 description', () => {
      assert.strictEqual(
        JAVASCRIPT_IMPORT_OPTIONS[0].description,
        "import name from '_relativePath_';"
      );
    });

    it('TS default matches index 0 description', () => {
      assert.strictEqual(
        TYPESCRIPT_IMPORT_OPTIONS[0].description,
        "import { name } from '_relativePath_';"
      );
    });

    it('SCSS default matches index 0 description', () => {
      assert.strictEqual(
        SCSS_IMPORT_OPTIONS[0].description,
        "@use '_relativePath_';"
      );
    });
  });
});
