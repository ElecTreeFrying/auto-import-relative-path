import * as assert from 'assert';
import * as vscode from 'vscode';

import { setAutoImportSetting } from '../../config/settings';
import {
  IMPORT_INDICATORS,
  adjustForCommentBlock,
  computeImportPlacement,
  detectBlockIndentation,
  findAstroFrontmatterBounds,
  findBottomLineInRange,
  findEnclosingStyleBounds,
  findJsxCommentSpanStart,
  findSfcScriptBounds,
  getLineIndentation,
  isCommentLine,
  isFrameworkStyleDestination,
  isImportLine,
  isInlineSnippet,
  isJsxFamilyDestination,
  isStyleBlockContext,
  shouldRepositionCursor,
} from '../../editor/placement';
import { FileExtension } from '../../types/file-extension';

describe('editor/placement', () => {
  describe('isCommentLine', () => {
    it('detects // comments', () => {
      assert.strictEqual(isCommentLine('// comment'), true);
    });

    it('detects /* comments', () => {
      assert.strictEqual(isCommentLine('/* comment */'), true);
    });

    it('detects * continuation lines', () => {
      assert.strictEqual(isCommentLine(' * middle of block'), true);
    });

    it('detects indented // comments', () => {
      assert.strictEqual(isCommentLine('  // indented'), true);
    });

    it('rejects import statements', () => {
      assert.strictEqual(isCommentLine("import { x } from './y';"), false);
    });

    it('rejects empty lines', () => {
      assert.strictEqual(isCommentLine(''), false);
    });

    it('treats * as a comment for non-Markdown destinations (default)', () => {
      assert.strictEqual(isCommentLine(' * bullet'), true);
    });

    it('treats * as content (not a comment) for Markdown destinations', () => {
      assert.strictEqual(isCommentLine('* milk', true), false);
      assert.strictEqual(isCommentLine('  **bold**', true), false);
      assert.strictEqual(isCommentLine('***', true), false);
    });

    it('still treats // and /* as comments for Markdown destinations', () => {
      assert.strictEqual(isCommentLine('// comment', true), true);
      assert.strictEqual(isCommentLine('/* comment */', true), true);
    });
  });

  describe('getLineIndentation', () => {
    it('extracts leading spaces', () => {
      assert.strictEqual(getLineIndentation('  import x;'), '  ');
    });

    it('extracts leading tab', () => {
      assert.strictEqual(getLineIndentation('\timport x;'), '\t');
    });

    it('returns empty for no indentation', () => {
      assert.strictEqual(getLineIndentation('import x;'), '');
    });

    it('returns empty for empty string', () => {
      assert.strictEqual(getLineIndentation(''), '');
    });
  });

  describe('detectBlockIndentation', () => {
    it('returns indentation of first non-empty line in range', () => {
      const lines = [ '<script>', '  import x;', '  const y;', '</script>' ];
      assert.strictEqual(detectBlockIndentation(lines, 0, 3), '  ');
    });

    it('returns empty for block with no content', () => {
      const lines = [ '<script>', '', '', '</script>' ];
      assert.strictEqual(detectBlockIndentation(lines, 0, 3), '');
    });
  });

  describe('findAstroFrontmatterBounds', () => {
    it('finds both --- fences', () => {
      const lines = [ '---', 'import x;', '---', '<html>' ];
      const result = findAstroFrontmatterBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 0, closingLine: 2 });
    });

    it('returns null with only one fence', () => {
      const lines = [ '---', 'import x;', '<html>' ];
      assert.strictEqual(findAstroFrontmatterBounds(lines), null);
    });

    it('returns null with no fences', () => {
      const lines = [ '<html>', '<body>', '</body>', '</html>' ];
      assert.strictEqual(findAstroFrontmatterBounds(lines), null);
    });

    it('handles whitespace-padded fences', () => {
      const lines = [ '  ---  ', 'import x;', '  ---  ' ];
      const result = findAstroFrontmatterBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 0, closingLine: 2 });
    });
  });

  describe('findSfcScriptBounds', () => {
    it('finds <script setup> block', () => {
      const lines = [ '<script setup>', 'import x;', '</script>', '<template>' ];
      const result = findSfcScriptBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 0, closingLine: 2 });
    });

    it('prefers <script setup> over bare <script>', () => {
      const lines = [ '<script>', 'old code', '</script>', '<script setup>', 'import x;', '</script>' ];
      const result = findSfcScriptBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 3, closingLine: 5 });
    });

    it('falls back to bare <script> when no setup exists', () => {
      const lines = [ '<script>', 'import x;', '</script>' ];
      const result = findSfcScriptBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 0, closingLine: 2 });
    });

    it('returns null when no script block exists', () => {
      const lines = [ '<template>', '<div>Hello</div>', '</template>' ];
      assert.strictEqual(findSfcScriptBounds(lines), null);
    });

    it('prefers instance <script> over <script context="module"> (Svelte)', () => {
      const lines = [
        '<script context="module">',
        '  export const metadata = {};',
        '</script>',
        '<script>',
        "  import { onMount } from 'svelte';",
        '</script>',
      ];
      const result = findSfcScriptBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 3, closingLine: 5 });
    });

    it('falls back to <script context="module"> when no instance script exists', () => {
      const lines = [
        '<script context="module">',
        '  export const x = 1;',
        '</script>',
        '<div>Hello</div>',
      ];
      const result = findSfcScriptBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 0, closingLine: 2 });
    });

    it('finds <script lang="ts"> (Svelte common pattern)', () => {
      const lines = [ '<script lang="ts">', "  import { onMount } from 'svelte';", '</script>' ];
      const result = findSfcScriptBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 0, closingLine: 2 });
    });

    it('finds <script setup lang="ts"> (Vue common pattern)', () => {
      const lines = [ '<script setup lang="ts">', "import { ref } from 'vue';", '</script>' ];
      const result = findSfcScriptBounds(lines);
      assert.deepStrictEqual(result, { openingLine: 0, closingLine: 2 });
    });

    // Characterization of two edge cases (current behavior — both fall back to a wrapped block):
    it('returns null for a single-line <script setup>…</script> (open + close on one line)', () => {
      assert.strictEqual(findSfcScriptBounds([ '<script setup>const a = 1;</script>' ]), null);
    });

    it('returns null when the closing tag has trailing whitespace (</script >)', () => {
      assert.strictEqual(findSfcScriptBounds([ '<script>', 'import x;', '</script >' ]), null);
    });
  });

  describe('findBottomLineInRange', () => {
    it('finds line after last import indicator', () => {
      const lines = [ '---', "import x from 'y';", "import z from 'w';", '---' ];
      const result = findBottomLineInRange(lines, 0, 3);
      assert.strictEqual(result.line, 3);
    });

    it('skips comment lines containing indicators', () => {
      const lines = [ '---', '// import x', "import y from 'z';", '---' ];
      const result = findBottomLineInRange(lines, 0, 3);
      assert.strictEqual(result.line, 3);
    });

    it('falls back to after opening line when no indicators', () => {
      const lines = [ '---', 'const x = 1;', '---' ];
      const result = findBottomLineInRange(lines, 0, 2);
      assert.strictEqual(result.line, 1);
    });

    it('preserves indentation of last import line', () => {
      const lines = [ '<script>', "  import x from 'y';", '</script>' ];
      const result = findBottomLineInRange(lines, 0, 2);
      assert.strictEqual(result.indentation, '  ');
    });
  });

  describe('adjustForCommentBlock', () => {
    it('returns same line when not a comment', () => {
      const lines = [ 'import x;', '// comment', 'const y;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 0), 0);
    });

    it('adjusts to start of comment block', () => {
      const lines = [ 'import x;', '// line 1', '// line 2', '// line 3', 'const y;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 3), 1);
    });

    it('handles single comment line', () => {
      const lines = [ 'import x;', '// single', 'const y;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 1), 1);
    });

    it('handles comment at line 0', () => {
      const lines = [ '// first', '// second', 'import x;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 1), 0);
    });

    it('returns line when out of bounds', () => {
      const lines = [ 'import x;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 5), 5);
    });

    it('does not walk up Markdown * bullets for a Markdown destination (cursor stays put)', () => {
      const lines = [ '# Shopping list', '', '* milk', '* eggs', '* bread' ];
      assert.strictEqual(adjustForCommentBlock(lines, 4, '.md' as FileExtension), 4);
    });

    it('still walks up a JS * block-comment continuation (non-Markdown destination)', () => {
      const lines = [ '/**', ' * doc', ' * more', 'export const x = 1;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 2), 0);
    });

    it('hops above a JSX {/* */} span in an .mdx destination (interior line carries no marker)', () => {
      const lines = [ 'import { Header } from "./h";', '', '{/*', '  draft outline', '*/}', '', '# Notes' ];
      assert.strictEqual(adjustForCommentBlock(lines, 3, '.mdx' as FileExtension), 2);
    });

    it('hops above a JSX {/* */} span in a .tsx destination', () => {
      const lines = [ 'import { Header } from "./h";', '', '{/*', '  draft outline', '*/}', '', 'export const P = () => null;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 3, '.tsx' as FileExtension), 2);
    });

    it('hops above the whole run when a // block precedes the {/* */} span opener', () => {
      const lines = [ '// bootstrap', '// init', '{/*', '  notes', '*/}', 'export const P = () => null;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 3, '.jsx' as FileExtension), 0);
    });

    it('does NOT span-scan a Markdown destination ({/* is literal CommonMark text)', () => {
      const lines = [ '# Doc', '', '{/*', 'still prose', '*/}', 'more' ];
      assert.strictEqual(adjustForCommentBlock(lines, 3, '.md' as FileExtension), 3);
    });

    it('leaves a .mdx * bullet as content even with the span rule active', () => {
      const lines = [ '# Shopping list', '', '* milk', '* eggs', '* bread' ];
      assert.strictEqual(adjustForCommentBlock(lines, 4, '.mdx' as FileExtension), 4);
    });
  });

  describe('findJsxCommentSpanStart', () => {
    const SPAN = [ 'import x from "./x";', '', '{/*', '  draft outline', '  more notes', '*/}', '', '# Notes' ];

    it('returns the opener line for a line inside the span', () => {
      assert.strictEqual(findJsxCommentSpanStart(SPAN, 4), 2);
    });

    it('returns null for a line above the opener', () => {
      assert.strictEqual(findJsxCommentSpanStart(SPAN, 1), null);
    });

    it('returns null for a line below the closer', () => {
      assert.strictEqual(findJsxCommentSpanStart(SPAN, 7), null);
    });

    it('returns null ON the opener line itself (inserting there already lands above it)', () => {
      assert.strictEqual(findJsxCommentSpanStart(SPAN, 2), null);
    });

    it('returns the opener ON the closing line (still inside until the marker is passed)', () => {
      assert.strictEqual(findJsxCommentSpanStart(SPAN, 5), 2);
    });

    it('returns null when a single-line {/* … */} sits above (opened and closed, no state)', () => {
      const lines = [ '{/* a note */}', 'export const P = () => null;' ];
      assert.strictEqual(findJsxCommentSpanStart(lines, 1), null);
    });

    it('returns the opener for an unclosed span (no closer anywhere above)', () => {
      const lines = [ '{/*', '  dangling', 'still inside' ];
      assert.strictEqual(findJsxCommentSpanStart(lines, 2), 0);
    });

    it('tracks the SECOND opener when a closed span precedes it', () => {
      const lines = [ '{/* first */}', 'code', '{/*', '  second', '*/}' ];
      assert.strictEqual(findJsxCommentSpanStart(lines, 3), 2);
    });

    it('handles an open and close on the same line before the target (no lingering state)', () => {
      const lines = [ 'code', '{/* inline */} const x = 1;', 'target' ];
      assert.strictEqual(findJsxCommentSpanStart(lines, 2), null);
    });

    it('returns null for line 0 (nothing above it)', () => {
      assert.strictEqual(findJsxCommentSpanStart(SPAN, 0), null);
    });

    it('clamps a line beyond the buffer to the available lines', () => {
      assert.strictEqual(findJsxCommentSpanStart(SPAN, 99), null);
    });
  });

  describe('isJsxFamilyDestination', () => {
    it('.jsx / .tsx / .mdx return true', () => {
      assert.strictEqual(isJsxFamilyDestination('.jsx' as FileExtension), true);
      assert.strictEqual(isJsxFamilyDestination('.tsx' as FileExtension), true);
      assert.strictEqual(isJsxFamilyDestination('.mdx' as FileExtension), true);
    });

    it('.md / .ts / .vue return false', () => {
      assert.strictEqual(isJsxFamilyDestination('.md' as FileExtension), false);
      assert.strictEqual(isJsxFamilyDestination('.ts' as FileExtension), false);
      assert.strictEqual(isJsxFamilyDestination('.vue' as FileExtension), false);
    });
  });

  describe('isInlineSnippet', () => {
    it('non-stylesheet into stylesheet returns true', () => {
      assert.strictEqual(isInlineSnippet('.png' as FileExtension, '.css' as FileExtension), true);
    });

    it('non-stylesheet into scss returns true', () => {
      assert.strictEqual(isInlineSnippet('.jpg' as FileExtension, '.scss' as FileExtension), true);
    });

    it('stylesheet into stylesheet returns false', () => {
      assert.strictEqual(isInlineSnippet('.css' as FileExtension, '.css' as FileExtension), false);
    });

    it('scss into scss returns false', () => {
      assert.strictEqual(isInlineSnippet('.scss' as FileExtension, '.scss' as FileExtension), false);
    });

    it('non-stylesheet into non-stylesheet returns false', () => {
      assert.strictEqual(isInlineSnippet('.png' as FileExtension, '.ts' as FileExtension), false);
    });
  });

  describe('shouldRepositionCursor', () => {
    it('.html returns true', () => {
      assert.strictEqual(shouldRepositionCursor('.html' as FileExtension), true);
    });

    it('.md returns true', () => {
      assert.strictEqual(shouldRepositionCursor('.md' as FileExtension), true);
    });

    it('.tex returns true (figure / \\input inserts in the body at the cursor, never the preamble)', () => {
      assert.strictEqual(shouldRepositionCursor('.tex' as FileExtension), true);
    });

    it('.ts returns false', () => {
      assert.strictEqual(shouldRepositionCursor('.ts' as FileExtension), false);
    });

    it('.css returns false', () => {
      assert.strictEqual(shouldRepositionCursor('.css' as FileExtension), false);
    });

    it('.vue returns false', () => {
      assert.strictEqual(shouldRepositionCursor('.vue' as FileExtension), false);
    });
  });

  describe('IMPORT_INDICATORS', () => {
    it('has exactly 9 markers', () => {
      assert.strictEqual(IMPORT_INDICATORS.length, 9);
    });

    it("includes 'import '", () => {
      assert.ok(IMPORT_INDICATORS.includes('import '));
    });

    it("includes 'require('", () => {
      assert.ok(IMPORT_INDICATORS.includes('require('));
    });

    it("includes \"@use '\"", () => {
      assert.ok(IMPORT_INDICATORS.includes("@use '"));
    });

    it("includes \"@forward '\"", () => {
      assert.ok(IMPORT_INDICATORS.includes("@forward '"));
    });
  });

  describe('isImportLine', () => {
    it('detects a line-leading ES import', () => {
      assert.strictEqual(isImportLine("import x from './y';"), true);
    });

    it('detects a side-effect import', () => {
      assert.strictEqual(isImportLine("import './styles.css';"), true);
    });

    it('detects a space-indented import (e.g. inside a script block)', () => {
      assert.strictEqual(isImportLine("  import { onMount } from 'svelte';"), true);
    });

    it('detects a tab-indented import', () => {
      assert.strictEqual(isImportLine("\timport x from './y';"), true);
    });

    it('does NOT detect an `import ` substring inside a string literal', () => {
      assert.strictEqual(isImportLine('const msg = "you should import this";'), false);
    });

    it('detects a mid-line require() call (not line-leading)', () => {
      assert.strictEqual(isImportLine("const fs = require('fs');"), true);
    });

    it('detects an indented require() call', () => {
      assert.strictEqual(isImportLine("  const fs = require('fs');"), true);
    });

    it('detects @import, @import url(), @use, @forward at-rules', () => {
      assert.strictEqual(isImportLine("@import 'reset.css';"), true);
      assert.strictEqual(isImportLine("@import url('reset.css');"), true);
      assert.strictEqual(isImportLine("@use 'colors';"), true);
      assert.strictEqual(isImportLine("@forward 'spacing';"), true);
    });

    it('does NOT detect an at-rule keyword inside a string literal', () => {
      assert.strictEqual(isImportLine('const note = "remember to @use this";'), false);
    });

    it('returns false for a plain statement and an empty line', () => {
      assert.strictEqual(isImportLine('const x = 1;'), false);
      assert.strictEqual(isImportLine(''), false);
    });

    // Documented residual: `require(` is a call expression matched anywhere on the
    // line, so a literal `require(` inside a string is still a false positive. Far
    // rarer than the prose-`import` case; removing it needs string-literal parsing.
    it('characterizes the residual require()-in-string false positive (intentional)', () => {
      assert.strictEqual(isImportLine('const note = "call require(x) here";'), true);
    });
  });

  describe('computeImportPlacement', () => {
    it('returns inline for non-stylesheet source into stylesheet destination', () => {
      const result = computeImportPlacement(
        'body { color: red; }',
        '.css' as FileExtension,
        '.png' as FileExtension,
        0, 10,
      );
      assert.strictEqual(result.isInline, true);
      assert.strictEqual(result.line, 0);
      assert.strictEqual(result.column, 10);
    });

    it('repositions cursor for HTML destination (drop column forced to 0)', () => {
      const text = '<html>\n<head>\n</head>\n<body>\n</body>\n</html>';
      const result = computeImportPlacement(
        text,
        '.html' as FileExtension,
        '.js' as FileExtension,
        3, 4,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 3);
      assert.strictEqual(result.column, 0);
    });

    it('repositions cursor for Markdown destination (drop column forced to 0)', () => {
      const text = '# Title\n\nSome text\n\nMore text';
      const result = computeImportPlacement(
        text,
        '.md' as FileExtension,
        '.md' as FileExtension,
        2, 5,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 2);
      assert.strictEqual(result.column, 0);
    });

    it('repositions cursor for LaTeX destination (body cursor line, not the preamble at line 0; drop column forced to 0)', () => {
      const text = '\\documentclass{article}\n\\begin{document}\nSome prose.\n\\end{document}';
      const result = computeImportPlacement(
        text,
        '.tex' as FileExtension,
        '.png' as FileExtension,
        2, 9,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 2);
      assert.strictEqual(result.column, 0);
    });

    it('Markdown cursor on a * bullet lands AT the cursor, not the top of the run', () => {
      const text = '# Shopping list\n\n* milk\n* eggs\n* bread';
      const result = computeImportPlacement(
        text,
        '.md' as FileExtension,
        '.md' as FileExtension,
        4, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 4, `expected cursor line 4 ('* bread'), got ${result.line}`);
    });

    it('.mdx Cursor drop inside a {/* */} span hops above the opener (never inserts commented-out)', async () => {
      await setAutoImportSetting('preferences', 'placement', 'Cursor');
      try {
        const text = 'import x from "./x";\n\n{/*\n  draft outline\n*/}\n\n# Notes';
        const result = computeImportPlacement(
          text,
          '.mdx' as FileExtension,
          '.ts' as FileExtension,
          3, 0,
        );
        assert.strictEqual(result.line, 2, `expected the {/* opener line 2, got ${result.line}`);
        assert.strictEqual(result.column, 0);
      } finally {
        await setAutoImportSetting('preferences', 'placement', undefined);
      }
    });

    it('.tsx Cursor drop inside a {/* */} span hops above the opener', async () => {
      await setAutoImportSetting('preferences', 'placement', 'Cursor');
      try {
        const text = 'import x from "./x";\n\n{/*\n  draft outline\n*/}\n\nexport const P = () => null;';
        const result = computeImportPlacement(
          text,
          '.tsx' as FileExtension,
          '.ts' as FileExtension,
          3, 0,
        );
        assert.strictEqual(result.line, 2, `expected the {/* opener line 2, got ${result.line}`);
      } finally {
        await setAutoImportSetting('preferences', 'placement', undefined);
      }
    });

    it('returns wrapperPrefix for Astro without frontmatter', () => {
      const text = '<html><body>Hello</body></html>';
      const result = computeImportPlacement(
        text,
        '.astro' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.line, 0);
      assert.strictEqual(result.wrapperPrefix, '---\n');
      assert.strictEqual(result.wrapperSuffix, '---\n');
    });

    it('places inside Astro frontmatter', () => {
      const text = '---\nimport x;\n---\n<html></html>';
      const result = computeImportPlacement(
        text,
        '.astro' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.ok(result.line >= 1 && result.line <= 2, `expected line 1 or 2, got ${result.line}`);
    });

    it('returns wrapperPrefix for Vue without script block', () => {
      const text = '<template>\n  <div>Hello</div>\n</template>';
      const result = computeImportPlacement(
        text,
        '.vue' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.line, 0);
      assert.strictEqual(result.wrapperPrefix, '<script>\n');
      assert.strictEqual(result.wrapperSuffix, '</script>\n');
    });

    it('places inside Vue script block', () => {
      const text = '<script setup>\nimport x;\n</script>\n<template></template>';
      const result = computeImportPlacement(
        text,
        '.vue' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.ok(result.line >= 1 && result.line <= 2, `expected line 1 or 2, got ${result.line}`);
    });

    it('returns wrapperPrefix for Svelte without script block', () => {
      const text = '<div>Hello</div>';
      const result = computeImportPlacement(
        text,
        '.svelte' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.line, 0);
      assert.strictEqual(result.wrapperPrefix, '<script>\n');
      assert.strictEqual(result.wrapperSuffix, '</script>\n');
    });

    it('default Bottom placement inserts after last import indicator', () => {
      const text = "import x from 'x';\nimport y from 'y';\n\nconst z = 1;";
      const result = computeImportPlacement(
        text,
        '.ts' as FileExtension,
        '.ts' as FileExtension,
        3, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 2);
      assert.strictEqual(result.column, 0);
    });

    it('Bottom placement finds require() as import indicator', () => {
      const text = "import { A } from './a';\nconst fs = require('fs');\n\nconst x = 1;";
      const result = computeImportPlacement(
        text,
        '.ts' as FileExtension,
        '.ts' as FileExtension,
        3, 0,
      );
      assert.strictEqual(result.line, 2);
      assert.strictEqual(result.column, 0);
    });

    it('Bottom placement skips commented import lines', () => {
      const text = "// import { old } from './old';\nimport { A } from './a';\n\nconst x = 1;";
      const result = computeImportPlacement(
        text,
        '.ts' as FileExtension,
        '.ts' as FileExtension,
        3, 0,
      );
      assert.strictEqual(result.line, 2);
    });

    it('Bottom placement falls back to line 0 for whitespace-only text', () => {
      const text = '   \n  \n    ';
      const result = computeImportPlacement(
        text,
        '.ts' as FileExtension,
        '.ts' as FileExtension,
        2, 0,
      );
      assert.strictEqual(result.line, 0);
    });

    it('Bottom placement falls back to line 0 when no indicators', () => {
      const text = 'const x = 1;\nconst y = 2;';
      const result = computeImportPlacement(
        text,
        '.ts' as FileExtension,
        '.ts' as FileExtension,
        1, 0,
      );
      assert.strictEqual(result.line, 0);
    });

    it('Bottom placement ignores an `import ` substring inside a string literal (no real import → line 0)', () => {
      const text = 'const msg = "you should import this";';
      const result = computeImportPlacement(
        text,
        '.ts' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.line, 0);
    });

    it('Bottom placement counts only the real import, not a string-literal `import ` below it', () => {
      const text = "import { real } from './real';\nconst msg = \"you should import this\";\n\nconst x = 1;";
      const result = computeImportPlacement(
        text,
        '.ts' as FileExtension,
        '.ts' as FileExtension,
        3, 0,
      );
      assert.strictEqual(result.line, 1);
    });

    it('Bottom (Astro): an `import ` substring in a frontmatter string literal does not move the insertion point', () => {
      const text = '---\nconst msg = "you should import this";\n---\n<h1></h1>';
      const result = computeImportPlacement(
        text,
        '.astro' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.line, 1);
    });

    it('Svelte: inserts after last import in script block (Bottom)', () => {
      const text = [
        '<script lang="ts">',
        "  import { onMount } from 'svelte';",
        "  import { fade } from 'svelte/transition';",
        '',
        '  let visible = false;',
        '</script>',
        '<div>Hello</div>',
      ].join('\n');
      const result = computeImportPlacement(
        text,
        '.svelte' as FileExtension,
        '.ts' as FileExtension,
        6, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 3);
      assert.strictEqual(result.indentation, '  ');
    });

    it('Svelte: prefers instance script over module script', () => {
      const text = [
        '<script context="module">',
        '  export const metadata = {};',
        '</script>',
        '<script>',
        "  import { onMount } from 'svelte';",
        '</script>',
        '<div>Hello</div>',
      ].join('\n');
      const result = computeImportPlacement(
        text,
        '.svelte' as FileExtension,
        '.ts' as FileExtension,
        6, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 5);
      assert.strictEqual(result.indentation, '  ');
    });

    it('Vue: drop outside script block still inserts inside it (Bottom)', () => {
      const text = [
        '<script setup>',
        "import { ref } from 'vue';",
        '</script>',
        '<template>',
        '  <div>Hello</div>',
        '</template>',
      ].join('\n');
      const result = computeImportPlacement(
        text,
        '.vue' as FileExtension,
        '.ts' as FileExtension,
        4, 5,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 2);
      assert.strictEqual(result.column, 0);
    });

    it('Vue: empty script block inserts after opening tag', () => {
      const text = '<script setup>\n</script>\n<template></template>';
      const result = computeImportPlacement(
        text,
        '.vue' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 1);
    });

    it('Svelte: preserves indentation from existing imports', () => {
      const text = [
        '<script>',
        "  import { writable } from 'svelte/store';",
        '</script>',
      ].join('\n');
      const result = computeImportPlacement(
        text,
        '.svelte' as FileExtension,
        '.ts' as FileExtension,
        0, 0,
      );
      assert.strictEqual(result.indentation, '  ');
    });
  });

  // The Astro/SFC Cursor branch inserts at the cursor only when strictly inside the block
  // (dropLine > openingLine && dropLine < closingLine); a cursor exactly ON a fence/tag line
  // must fall back to Bottom. Requires the 'Cursor' placement setting (restored after).
  describe('computeImportPlacement — Cursor exactly on a fence / script tag', () => {
    before(async () => {
      await setAutoImportSetting('preferences', 'placement', 'Cursor', vscode.ConfigurationTarget.Global);
    });
    after(async () => {
      await setAutoImportSetting('preferences', 'placement', undefined, vscode.ConfigurationTarget.Global);
    });

    const astro = '---\nimport x;\nconst a = 1;\n---\n<html></html>';   // fences at lines 0 and 3
    const vue = '<script setup>\nimport x;\nconst a = 1;\n</script>\n<template></template>'; // tags at 0 and 3

    it('Astro: cursor on the opening --- fence falls back to Bottom (after last import)', () => {
      const r = computeImportPlacement(astro, '.astro' as FileExtension, '.ts' as FileExtension, 0, 0);
      assert.strictEqual(r.line, 2);
    });

    it('Astro: cursor on the closing --- fence falls back to Bottom', () => {
      const r = computeImportPlacement(astro, '.astro' as FileExtension, '.ts' as FileExtension, 3, 0);
      assert.strictEqual(r.line, 2);
    });

    it('Vue: cursor on the opening <script setup> tag falls back to Bottom', () => {
      const r = computeImportPlacement(vue, '.vue' as FileExtension, '.ts' as FileExtension, 0, 0);
      assert.strictEqual(r.line, 2);
    });

    it('Vue: cursor on the closing </script> tag falls back to Bottom', () => {
      const r = computeImportPlacement(vue, '.vue' as FileExtension, '.ts' as FileExtension, 3, 0);
      assert.strictEqual(r.line, 2);
    });

    // Cursor STRICTLY inside the block (dropLine between the fences/tags) lands AT the cursor line.
    it('Astro: cursor strictly inside the fences lands at the cursor line', () => {
      const r = computeImportPlacement(astro, '.astro' as FileExtension, '.ts' as FileExtension, 2, 0);
      assert.strictEqual(r.line, 2);
    });

    it('Vue: cursor strictly inside the script block lands at the cursor line', () => {
      const r = computeImportPlacement(vue, '.vue' as FileExtension, '.ts' as FileExtension, 2, 0);
      assert.strictEqual(r.line, 2);
    });
  });

  describe('findEnclosingStyleBounds', () => {
    // 0:<script> 1:</script> 2:<template> 3:  <div/> 4:</template> 5:<style scoped> 6:.a {} 7:</style>
    const lines = [ '<script setup>', '</script>', '<template>', '  <div/>', '</template>', '<style scoped>', '.a {}', '</style>' ];

    it('finds the block strictly enclosing the cursor line', () => {
      assert.deepStrictEqual(findEnclosingStyleBounds(lines, 6), { openingLine: 5, closingLine: 7 });
    });

    it('returns null when the cursor sits ON the opening <style> tag (strict insideness)', () => {
      assert.strictEqual(findEnclosingStyleBounds(lines, 5), null);
    });

    it('returns null when the cursor sits ON the closing </style> tag (strict insideness)', () => {
      assert.strictEqual(findEnclosingStyleBounds(lines, 7), null);
    });

    it('returns null when the cursor is outside every style block (in the script block)', () => {
      assert.strictEqual(findEnclosingStyleBounds(lines, 0), null);
    });

    it('matches a lang-tagged opening tag (<style lang="scss">)', () => {
      const scss = [ '<style lang="scss">', '$c: red;', '</style>' ];
      assert.deepStrictEqual(findEnclosingStyleBounds(scss, 1), { openingLine: 0, closingLine: 2 });
    });

    it('picks the enclosing block when several <style> blocks exist', () => {
      const multi = [
        '<style>', 'a {}', '</style>',        // 0..2
        '<template></template>',              // 3
        '<style scoped>', 'b {}', '</style>', // 4..6
      ];
      assert.deepStrictEqual(findEnclosingStyleBounds(multi, 1), { openingLine: 0, closingLine: 2 });
      assert.deepStrictEqual(findEnclosingStyleBounds(multi, 5), { openingLine: 4, closingLine: 6 });
      assert.strictEqual(findEnclosingStyleBounds(multi, 3), null, 'a line between blocks is enclosed by neither');
    });

    it('returns null for an unclosed <style> block', () => {
      assert.strictEqual(findEnclosingStyleBounds([ '<style>', '.a {}' ], 1), null);
    });
  });

  describe('isFrameworkStyleDestination', () => {
    it('.vue / .svelte / .astro return true', () => {
      assert.strictEqual(isFrameworkStyleDestination('.vue' as FileExtension), true);
      assert.strictEqual(isFrameworkStyleDestination('.svelte' as FileExtension), true);
      assert.strictEqual(isFrameworkStyleDestination('.astro' as FileExtension), true);
    });

    it('non-framework destinations return false', () => {
      assert.strictEqual(isFrameworkStyleDestination('.ts' as FileExtension), false);
      assert.strictEqual(isFrameworkStyleDestination('.css' as FileExtension), false);
      assert.strictEqual(isFrameworkStyleDestination('.tsx' as FileExtension), false);
    });
  });

  describe('isStyleBlockContext', () => {
    const vueStyle = '<script setup>\n</script>\n<template>\n  <div/>\n</template>\n<style scoped>\n.a {}\n</style>';
    const cursorInStyle = 6; // the `.a {}` line, strictly inside <style>

    it('framework dest + all-stylesheet sources + cursor inside <style> → true', () => {
      assert.strictEqual(
        isStyleBlockContext(vueStyle, '.vue' as FileExtension, [ '.css' as FileExtension ], cursorInStyle), true);
      assert.strictEqual(
        isStyleBlockContext(vueStyle, '.vue' as FileExtension, [ '.scss' as FileExtension, '.css' as FileExtension ], cursorInStyle), true);
    });

    it('false when the destination is not a framework SFC (even with a stylesheet source in a <style> block)', () => {
      assert.strictEqual(
        isStyleBlockContext(vueStyle, '.css' as FileExtension, [ '.css' as FileExtension ], cursorInStyle), false);
    });

    it('false when any source is not a stylesheet (mixed selection stays script-dialect)', () => {
      assert.strictEqual(
        isStyleBlockContext(vueStyle, '.vue' as FileExtension, [ '.css' as FileExtension, '.png' as FileExtension ], cursorInStyle), false);
    });

    it('false for an empty source list', () => {
      assert.strictEqual(isStyleBlockContext(vueStyle, '.vue' as FileExtension, [], cursorInStyle), false);
    });

    it('false when the cursor is outside the <style> block (in the script block)', () => {
      assert.strictEqual(
        isStyleBlockContext(vueStyle, '.vue' as FileExtension, [ '.css' as FileExtension ], 0), false);
    });
  });

  describe('computeImportPlacement — style-block context (insideStyleBlock)', () => {
    // 0:<script setup> 1:</script> 2:<template> 3:  <div/> 4:</template> 5:<style scoped> 6:.a {} 7:</style>
    const vueStyle = '<script setup>\n</script>\n<template>\n  <div/>\n</template>\n<style scoped>\n.a {}\n</style>';

    it('a .css source into a .vue <style> block places inside the block (Bottom → after opening tag)', () => {
      const r = computeImportPlacement(vueStyle, '.vue' as FileExtension, '.css' as FileExtension, 6, 0, true);
      assert.strictEqual(r.isInline, false);
      assert.strictEqual(r.line, 6, 'Bottom in an import-less <style> block lands just after the opening tag');
    });

    it('ignores the style branch when insideStyleBlock is false (falls through to the SFC script block)', () => {
      const r = computeImportPlacement(vueStyle, '.vue' as FileExtension, '.css' as FileExtension, 6, 0, false);
      // No import lines in the empty <script setup>, so Bottom-in-script falls back to after the opening tag.
      assert.strictEqual(r.line, 1);
    });

    it('defensively falls through to SFC placement when insideStyleBlock is set but no <style> block exists', () => {
      const noStyle = '<script setup>\nimport x;\n</script>\n<template></template>';
      const r = computeImportPlacement(noStyle, '.vue' as FileExtension, '.css' as FileExtension, 0, 0, true);
      assert.strictEqual(r.line, 2, 'no <style> block → SFC script-block placement (after the last import)');
    });
  });

  // Top / Cursor within a <style> block require the placement setting (restored after).
  describe('computeImportPlacement — style-block context Top / Cursor', () => {
    before(async () => {
      await setAutoImportSetting('preferences', 'placement', 'Top', vscode.ConfigurationTarget.Global);
    });
    after(async () => {
      await setAutoImportSetting('preferences', 'placement', undefined, vscode.ConfigurationTarget.Global);
    });

    // 5:<style scoped> 6:.a {} 7:.b {} 8:</style>
    const vueStyle = '<script setup>\n</script>\n<template>\n  <div/>\n</template>\n<style scoped>\n.a {}\n.b {}\n</style>';

    it('Top places just after the opening <style> tag', async () => {
      const r = computeImportPlacement(vueStyle, '.vue' as FileExtension, '.scss' as FileExtension, 7, 0, true);
      assert.strictEqual(r.line, 6);
    });

    it('Cursor (set below) places at the cursor line inside the block', async () => {
      await setAutoImportSetting('preferences', 'placement', 'Cursor', vscode.ConfigurationTarget.Global);
      const r = computeImportPlacement(vueStyle, '.vue' as FileExtension, '.scss' as FileExtension, 7, 0, true);
      assert.strictEqual(r.line, 7);
    });
  });
});
