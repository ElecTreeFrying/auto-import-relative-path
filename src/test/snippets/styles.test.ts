import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import {
  ImportStyle,
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
  TEX_GRAPHICS_IMPORT_OPTIONS,
  TEX_INPUT_IMPORT_OPTIONS,
  TEX_BIBLIOGRAPHY_IMPORT_OPTIONS,
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

    it('TEX_GRAPHICS_IMPORT_OPTIONS has 3 entries', () => {
      assert.strictEqual(TEX_GRAPHICS_IMPORT_OPTIONS.length, 3);
    });

    it('TEX_INPUT_IMPORT_OPTIONS has 2 entries', () => {
      assert.strictEqual(TEX_INPUT_IMPORT_OPTIONS.length, 2);
    });

    it('TEX_BIBLIOGRAPHY_IMPORT_OPTIONS has 2 entries', () => {
      assert.strictEqual(TEX_BIBLIOGRAPHY_IMPORT_OPTIONS.length, 2);
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

  // The load-bearing three-site sync contract: ImportStyle.description strings must be
  // byte-identical to the package.json enum, since resolveStyleIndex matches by string equality.
  // (The previous block only self-compared 3 hardcoded strings; a real enum drift passed silently.)
  describe('package.json enum ↔ _styles.ts byte-equality (all styled settings)', () => {
    interface PackageSetting {
      type: string;
      default?: unknown;
      enum?: string[];
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf-8')
    ) as { contributes: { configuration: Array<{ properties: Record<string, PackageSetting> }> } };

    const properties = pkg.contributes.configuration[0].properties;

    // SCSS image reuses the CSS image table (no SCSS_IMAGE_IMPORT_OPTIONS exists) — see snippets/CLAUDE.md.
    const CASES: Array<{ setting: string; table: ImportStyle[] }> = [
      { setting: 'auto-import.importStatement.script.javascriptImportStyle', table: JAVASCRIPT_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.script.typescriptImportStyle', table: TYPESCRIPT_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.styleSheet.cssImportStyle', table: CSS_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.styleSheet.cssImageImportStyle', table: CSS_IMAGE_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.styleSheet.scssImportStyle', table: SCSS_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.styleSheet.scssImageImportStyle', table: CSS_IMAGE_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.markup.htmlScriptImportStyle', table: HTML_SCRIPT_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.markup.htmlImageImportStyle', table: HTML_IMAGE_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.markup.htmlVideoImportStyle', table: HTML_VIDEO_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.markup.htmlAudioImportStyle', table: HTML_AUDIO_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.markup.htmlStyleSheetImportStyle', table: HTML_STYLESHEET_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.markup.markdownImportStyle', table: MARKDOWN_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.markup.markdownImageImportStyle', table: MARKDOWN_IMAGE_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.latex.graphicsImportStyle', table: TEX_GRAPHICS_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.latex.inputImportStyle', table: TEX_INPUT_IMPORT_OPTIONS },
      { setting: 'auto-import.importStatement.latex.bibliographyImportStyle', table: TEX_BIBLIOGRAPHY_IMPORT_OPTIONS },
    ];

    for (const { setting, table } of CASES) {
      it(`${setting} enum equals table descriptions`, () => {
        const property = properties[setting];
        assert.ok(property, `package.json is missing setting ${setting}`);
        assert.deepStrictEqual(
          table.map(option => option.description),
          property.enum,
          `enum drift between package.json and _styles.ts for ${setting}`
        );
      });

      it(`${setting} default is one of the table descriptions`, () => {
        const property = properties[setting];
        assert.ok(
          table.some(option => option.description === property.default),
          `package.json default "${String(property.default)}" not found in ${setting} table`
        );
      });
    }
  });
});
