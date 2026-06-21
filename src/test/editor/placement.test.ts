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
  findSfcScriptBounds,
  getLineIndentation,
  isCommentLine,
  isImportLine,
  isInlineSnippet,
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

    it('does not walk up Markdown * bullets when isMarkdown is true (cursor stays put)', () => {
      const lines = [ '# Shopping list', '', '* milk', '* eggs', '* bread' ];
      assert.strictEqual(adjustForCommentBlock(lines, 4, true), 4);
    });

    it('still walks up a JS * block-comment continuation (isMarkdown false)', () => {
      const lines = [ '/**', ' * doc', ' * more', 'export const x = 1;' ];
      assert.strictEqual(adjustForCommentBlock(lines, 2), 0);
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

    it('repositions cursor for HTML destination', () => {
      const text = '<html>\n<head>\n</head>\n<body>\n</body>\n</html>';
      const result = computeImportPlacement(
        text,
        '.html' as FileExtension,
        '.js' as FileExtension,
        3, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 3);
    });

    it('repositions cursor for Markdown destination', () => {
      const text = '# Title\n\nSome text\n\nMore text';
      const result = computeImportPlacement(
        text,
        '.md' as FileExtension,
        '.md' as FileExtension,
        2, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 2);
    });

    it('repositions cursor for LaTeX destination (body cursor line, not the preamble at line 0)', () => {
      const text = '\\documentclass{article}\n\\begin{document}\nSome prose.\n\\end{document}';
      const result = computeImportPlacement(
        text,
        '.tex' as FileExtension,
        '.png' as FileExtension,
        2, 0,
      );
      assert.strictEqual(result.isInline, false);
      assert.strictEqual(result.line, 2);
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
});
