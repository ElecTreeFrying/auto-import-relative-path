import * as assert from 'assert';

import {
  buildSnippet,
  buildTexGraphicsImportSnippetByStyle,
  buildTexInputImportSnippetByStyle,
  buildTexBibliographyImportSnippetByStyle,
  isTexGraphicsSource,
  resolveGraphicsPath,
} from '../../../snippets/languages/latex';
import { buildImportSnippetVariants } from '../../../snippets/variants';
import { resolveStyleIndex, TEX_GRAPHICS_IMPORT_OPTIONS } from '../../../snippets/_styles';
import { setAutoImportSetting } from '../../../config/settings';
import { FilePathInfo } from '../../../editor/file-path-info';
import { FileExtension } from '../../../types/file-extension';

describe('latex', () => {
  describe('buildTexGraphicsImportSnippetByStyle', () => {
    const PATH = './figures/plot.png';

    it('index 0: full figure float (default) — exact multi-line block, \\caption before \\label', () => {
      const result = buildTexGraphicsImportSnippetByStyle(0, PATH);
      const expected =
        '\\begin{figure}[htbp]\n' +
        '    \\centering\n' +
        `    \\includegraphics[width=0.5\\textwidth]{${PATH}}\n` +
        '    \\caption{${1:caption}}\n' +
        '    \\label{fig:${2:label}}\n' +
        '\\end{figure}';
      assert.strictEqual(result.value, expected);
    });

    it('index 1: sized \\includegraphics with a width tab stop', () => {
      const result = buildTexGraphicsImportSnippetByStyle(1, PATH);
      assert.strictEqual(result.value, `\\includegraphics[width=\${1:0.5}\\textwidth]{${PATH}}`);
    });

    it('index 2: bare \\includegraphics', () => {
      const result = buildTexGraphicsImportSnippetByStyle(2, PATH);
      assert.strictEqual(result.value, `\\includegraphics{${PATH}}`);
    });

    it('undefined falls back to the default figure (same as index 0)', () => {
      const result = buildTexGraphicsImportSnippetByStyle(undefined, PATH);
      assert.strictEqual(result.value, buildTexGraphicsImportSnippetByStyle(0, PATH).value);
    });

    // LaTeX is backslash-dense; a doubled backslash in the rendered snippet would break compilation.
    it('renders single backslashes (no doubled \\\\ in the output)', () => {
      const result = buildTexGraphicsImportSnippetByStyle(0, PATH);
      assert.ok(!result.value.includes('\\\\'), `output must not contain doubled backslashes: "${result.value}"`);
      assert.ok(result.value.includes('\\includegraphics'), 'expected a literal \\includegraphics command');
    });
  });

  describe('buildTexInputImportSnippetByStyle', () => {
    const PATH = './chapters/intro';   // the .tex extension is dropped before this builder is reached

    it('index 0: \\input (default)', () => {
      assert.strictEqual(buildTexInputImportSnippetByStyle(0, PATH).value, `\\input{${PATH}}`);
    });

    it('index 1: \\include', () => {
      assert.strictEqual(buildTexInputImportSnippetByStyle(1, PATH).value, `\\include{${PATH}}`);
    });

    it('undefined falls back to \\input', () => {
      assert.strictEqual(buildTexInputImportSnippetByStyle(undefined, PATH).value, `\\input{${PATH}}`);
    });
  });

  describe('buildTexBibliographyImportSnippetByStyle', () => {
    const PATH = './refs';
    const EXT = '.bib' as FileExtension;

    it('index 0: \\addbibresource keeps the .bib extension (default — biblatex)', () => {
      assert.strictEqual(buildTexBibliographyImportSnippetByStyle(0, PATH, EXT).value, '\\addbibresource{./refs.bib}');
    });

    it('index 1: \\bibliography drops the .bib extension (BibTeX)', () => {
      assert.strictEqual(buildTexBibliographyImportSnippetByStyle(1, PATH, EXT).value, '\\bibliography{./refs}');
    });

    it('undefined falls back to \\addbibresource (with extension)', () => {
      assert.strictEqual(buildTexBibliographyImportSnippetByStyle(undefined, PATH, EXT).value, '\\addbibresource{./refs.bib}');
    });
  });

  describe('isTexGraphicsSource', () => {
    it('true for the LaTeX-renderable graphics formats', () => {
      for (const ext of [ '.pdf', '.png', '.jpg', '.jpeg', '.eps' ]) {
        assert.strictEqual(isTexGraphicsSource(ext as FileExtension), true, `${ext} should be a graphics source`);
      }
    });

    it('false for .tex / .bib (each has its own builder branch)', () => {
      assert.strictEqual(isTexGraphicsSource('.tex' as FileExtension), false);
      assert.strictEqual(isTexGraphicsSource('.bib' as FileExtension), false);
    });

    it('false for web-image formats pdflatex cannot render (.svg / .gif / .webp / .avif)', () => {
      for (const ext of [ '.svg', '.gif', '.webp', '.avif' ]) {
        assert.strictEqual(isTexGraphicsSource(ext as FileExtension), false, `${ext} is not pdflatex-renderable`);
      }
    });
  });

  // resolveGraphicsPath reads the preserveGraphicsFileExtension setting; set it explicitly so the
  // assertion does not depend on ambient config a sibling test may have left behind.
  describe('resolveGraphicsPath (preserveGraphicsFileExtension)', () => {
    afterEach(async () => {
      await setAutoImportSetting('latex', 'preserve', undefined);
    });

    it('keeps the extension when preserve is on', async () => {
      await setAutoImportSetting('latex', 'preserve', true);
      assert.strictEqual(resolveGraphicsPath('./figures/plot', '.png' as FileExtension), './figures/plot.png');
    });

    it('drops the extension when preserve is off', async () => {
      await setAutoImportSetting('latex', 'preserve', false);
      assert.strictEqual(resolveGraphicsPath('./figures/plot', '.png' as FileExtension), './figures/plot');
    });

    // The graphics preserve default is INVERTED from every other preserve toggle (true, not false): with
    // no override, getAutoImportSetting surfaces the package.json default (true) and the extension stays.
    // Sibling check: scss.test.ts pins the stylesheet toggle's opposite default (false strips). Guards the
    // inversion so a future package.json default flip is caught here, not just in the QA matrix.
    it('keeps the extension by default — no override resolves to the package.json default (true)', async () => {
      await setAutoImportSetting('latex', 'preserve', undefined);
      assert.strictEqual(resolveGraphicsPath('./figures/plot', '.png' as FileExtension), './figures/plot.png');
    });
  });

  // buildSnippet's source dispatch picks WHICH LaTeX command to emit from the raw source extension. The
  // *ByStyle renderers above are covered in isolation; these drive the three dispatch arms + the empty
  // backstop (a source that slipped past gating).
  describe('buildSnippet (source-type dispatch)', () => {
    const info = (sourceFileExt: string): FilePathInfo => ({
      relativePath: './asset',
      sourceFilePath: `/w/asset${sourceFileExt}`,
      destinationFilePath: '/w/paper/main.tex',
      sourceFileExt: sourceFileExt as FileExtension,
      destinationFileExt: '.tex' as FileExtension,
    });

    it('graphics source → \\includegraphics (inside a figure by default)', () => {
      assert.ok(buildSnippet(info('.png')).value.includes('\\includegraphics'));
    });
    it('.tex source → \\input / \\include', () => {
      const value = buildSnippet(info('.tex')).value;
      assert.ok(value.startsWith('\\input') || value.startsWith('\\include'), `got "${value}"`);
    });
    it('.bib source → \\addbibresource / \\bibliography', () => {
      const value = buildSnippet(info('.bib')).value;
      assert.ok(value.startsWith('\\addbibresource') || value.startsWith('\\bibliography'), `got "${value}"`);
    });
    it('unsupported source (slipped past gating) → empty SnippetString', () => {
      assert.strictEqual(buildSnippet(info('.svg')).value, '');
    });
  });

  // The pick-style picker for a .tex destination. Fixture-free: the LaTeX variant path reads no files
  // (only config), so a hand-built FilePathInfo exercises the full buildImportSnippetVariants branch.
  describe('buildImportSnippetVariants (.tex destination)', () => {
    const info = (relativePath: string, sourceFileExt: string): FilePathInfo => ({
      relativePath,
      sourceFilePath: `/w/src/whatever${sourceFileExt}`,
      destinationFilePath: '/w/paper/main.tex',
      sourceFileExt: sourceFileExt as FileExtension,
      destinationFileExt: '.tex' as FileExtension,
    });

    it('graphics source → 3 styled variants under (latex, graphics)', async () => {
      const variants = await buildImportSnippetVariants(info('./figures/plot', '.png'));
      assert.strictEqual(variants.length, 3);
      for (const v of variants) {
        assert.ok(v.setting, 'every graphics variant should carry a setting');
        assert.strictEqual(v.setting!.namespace, 'latex');
        assert.strictEqual(v.setting!.key, 'graphics');
      }
    });

    it('.tex source → 2 styled variants under (latex, input)', async () => {
      const variants = await buildImportSnippetVariants(info('./chapters/intro', '.tex'));
      assert.strictEqual(variants.length, 2);
      assert.strictEqual(variants[0].setting!.key, 'input');
    });

    it('.bib source → 2 styled variants under (latex, bibliography)', async () => {
      const variants = await buildImportSnippetVariants(info('./refs', '.bib'));
      assert.strictEqual(variants.length, 2);
      assert.strictEqual(variants[0].setting!.key, 'bibliography');
    });

    // The figure is the suite's only multi-line shape; renderLabel must collapse it to one line with no
    // raw snippet placeholders, or the QuickPick label would span six lines.
    it('the figure variant label is single-line with no snippet placeholders', async () => {
      const variants = await buildImportSnippetVariants(info('./figures/plot', '.png'));
      const figureLabel = variants[0].label;
      assert.ok(!figureLabel.includes('\n'), `label must be single-line, got "${figureLabel}"`);
      assert.ok(!figureLabel.includes('$'), `label must not contain snippet syntax, got "${figureLabel}"`);
      assert.ok(figureLabel.includes('\\begin{figure}'), 'label should still show the figure shape');
    });

    // The persist/read contract used by set-default-import-style.ts: each setting.value (an
    // ImportStyle.description string) must recover its numeric index via resolveStyleIndex.
    it('graphics setting.value strings round-trip via resolveStyleIndex', async () => {
      const variants = await buildImportSnippetVariants(info('./figures/plot', '.png'));
      const resolved = variants.map(v => resolveStyleIndex(TEX_GRAPHICS_IMPORT_OPTIONS, v.setting!.value));
      assert.ok(resolved.every(index => index !== undefined), 'every setting.value must resolve to an index');
      assert.deepStrictEqual([ ...resolved ].sort((a, b) => a! - b!), [ 0, 1, 2 ]);
    });
  });
});
