import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { insertImportSnippet } from '../../editor/insert-snippet';
import { computeImportPlacement, getLineIndentation } from '../../editor/placement';
import { getFilePathInfo, FilePathInfo } from '../../editor/file-path-info';
import { setAutoImportSetting } from '../../config/settings';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');
const MARKER = 'ZZPARITYZZ';

// The command flow (insertImportSnippet) and the drop flow (computeImportPlacement) DUPLICATE the
// placement precedence across six switch statements plus two private bottom-scan / insertion-column
// helpers — editor/CLAUDE.md: "the two implementations duplicate the precedence ... and must be kept
// in sync." Each side is tested only against itself; nothing asserted they AGREE. This drives both
// with identical (text, exts, cursor) inputs and asserts the resulting insertion LINE matches (and,
// for indentation-free destinations, the COLUMN too). The command's editor.selection.anchor maps to
// the drop's dropLine/dropColumn. Because it asserts the two flows are EQUAL (not a hardcoded line),
// it stays robust to fixture content and catches any drift between the duplicated branches.
//
// Out of scope — line semantics legitimately differ: the wrapper branches (no Astro frontmatter / no
// SFC <script>), where the command physically inserts a wrapper while the drop returns a base line +
// wrapperPrefix for the provider to prepend. Indentation/wrapper math is covered by the shared
// helpers' own tests in placement.test.ts; these scenarios all use fixtures that take the non-wrapper
// path. COLUMN is asserted only for flat (indentation-free) destinations — Astro/SFC bake the block
// indentation into the inserted text (column 0 + a separate indentation field), so their column is
// compared by the helper tests, not here.
//
// COLUMN also diverges by design on the forced-cursor destinations (.html/.md/.tex): a caret column
// is typing intent, so paste keeps it, while a drop column is where the mouse button came up, so the
// drop ignores it and takes the target line's structural indent instead (column 0 when that line is
// blank — the drop then reuses the line via replaceLineEndColumn). Those scenarios set `forcedCursor`
// and assert each side's column separately — line parity still holds.

interface Scenario {
  name: string;
  fixture: string;
  source: string;
  cursorLine: number;
  cursorColumn: number;
  placement?: 'Top' | 'Bottom' | 'Cursor';
  flat: boolean;
  /** Forced-cursor markup destinations: paste keeps the caret column, drop takes the target line's structural indent (0 on a blank line). */
  forcedCursor?: boolean;
  insideStyleBlock?: boolean;
}

const SCENARIOS: Scenario[] = [
  { name: 'script Bottom (after last import)', fixture: 'with-imports.ts', source: 'src/bar.ts', cursorLine: 0, cursorColumn: 0, placement: 'Bottom', flat: true },
  { name: 'script Bottom skips comment imports', fixture: 'comments-only.ts', source: 'src/bar.ts', cursorLine: 0, cursorColumn: 0, placement: 'Bottom', flat: true },
  { name: 'script Top', fixture: 'with-imports.ts', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Top', flat: true },
  { name: 'script Cursor', fixture: 'with-imports.ts', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Cursor', flat: true },
  { name: 'html forced cursor (line parity; drop takes the line indent)', fixture: 'pages/index.html', source: 'pages/app.js', cursorLine: 8, cursorColumn: 2, flat: true, forcedCursor: true },
  { name: 'markdown forced cursor (blank target line reused at column 0)', fixture: 'docs/guide.md', source: 'docs/architecture.md', cursorLine: 3, cursorColumn: 0, flat: true, forcedCursor: true },
  { name: 'latex forced cursor (line parity; drop takes the line indent)', fixture: 'paper/main.tex', source: 'assets/logo.png', cursorLine: 6, cursorColumn: 2, flat: true, forcedCursor: true },
  { name: 'inline image into stylesheet', fixture: 'styles/reset.css', source: 'assets/logo.png', cursorLine: 3, cursorColumn: 16, flat: true },
  // Cursor inside a JSX {/* … */} span: both flows must hop above the opener rather than insert
  // the import commented-out. Interior span lines carry no comment prefix, so this exercises the
  // state-scan complement to isCommentLine — in both the command and drop paths.
  { name: 'mdx cursor inside a JSX comment span (hops above the opener)', fixture: 'docs/notes.mdx', source: 'src/bar.ts', cursorLine: 3, cursorColumn: 0, placement: 'Cursor', flat: true },
  { name: 'astro frontmatter Bottom', fixture: 'src/App.astro', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Bottom', flat: false },
  { name: 'astro frontmatter Top', fixture: 'src/App.astro', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Top', flat: false },
  { name: 'astro frontmatter Cursor', fixture: 'src/App.astro', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Cursor', flat: false },
  { name: 'vue <script setup> Bottom', fixture: 'src/App.vue', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Bottom', flat: false },
  { name: 'vue <script setup> Top', fixture: 'src/App.vue', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Top', flat: false },
  { name: 'vue <script setup> Cursor', fixture: 'src/App.vue', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Cursor', flat: false },
  { name: 'svelte <script> Bottom', fixture: 'src/App.svelte', source: 'src/bar.ts', cursorLine: 1, cursorColumn: 0, placement: 'Bottom', flat: false },
  // Stylesheet source into a populated SFC <style> block — the style-block placement branch, driven by
  // insideStyleBlock. styled.{vue,svelte,astro} carry a <style> block with interior lines.
  { name: 'vue <style> Bottom', fixture: 'src/styled.vue', source: 'styles/theme.scss', cursorLine: 9, cursorColumn: 0, placement: 'Bottom', flat: false, insideStyleBlock: true },
  { name: 'vue <style> Top', fixture: 'src/styled.vue', source: 'styles/theme.scss', cursorLine: 9, cursorColumn: 0, placement: 'Top', flat: false, insideStyleBlock: true },
  { name: 'vue <style> Cursor', fixture: 'src/styled.vue', source: 'styles/theme.scss', cursorLine: 9, cursorColumn: 0, placement: 'Cursor', flat: false, insideStyleBlock: true },
  { name: 'svelte <style> Bottom', fixture: 'src/styled.svelte', source: 'styles/theme.scss', cursorLine: 7, cursorColumn: 0, placement: 'Bottom', flat: false, insideStyleBlock: true },
  { name: 'astro <style> Bottom', fixture: 'src/styled.astro', source: 'styles/theme.scss', cursorLine: 9, cursorColumn: 0, placement: 'Bottom', flat: false, insideStyleBlock: true },
];

async function insertAndWait(snippet: vscode.SnippetString, info: FilePathInfo, insideStyleBlock = false): Promise<void> {
  const changed = new Promise<void>(resolve => {
    const disposable = vscode.workspace.onDidChangeTextDocument(() => {
      disposable.dispose();
      resolve();
    });
  });
  insertImportSnippet(snippet, info, insideStyleBlock);
  await changed;
}

function findMarker(doc: vscode.TextDocument): { line: number; column: number } {
  for (let i = 0; i < doc.lineCount; i++) {
    const column = doc.lineAt(i).text.indexOf(MARKER);
    if (column !== -1) {
      return { line: i, column };
    }
  }
  throw new Error('parity marker not found after insertion');
}

describe('placement parity: insertImportSnippet (command) ↔ computeImportPlacement (drop)', () => {
  afterEach(async () => {
    await setAutoImportSetting('preferences', 'placement', undefined);
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  for (const s of SCENARIOS) {
    it(s.name, async () => {
      if (s.placement) {
        await setAutoImportSetting('preferences', 'placement', s.placement);
      }
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, s.fixture)));
      const editor = await vscode.window.showTextDocument(doc);
      const documentText = doc.getText();
      const cursor = new vscode.Position(s.cursorLine, s.cursorColumn);
      editor.selection = new vscode.Selection(cursor, cursor);

      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, s.source));
      const info = await getFilePathInfo();

      // Command flow mutates the editor — capture where the marker actually landed.
      await insertAndWait(new vscode.SnippetString(MARKER), info, s.insideStyleBlock);
      const actual = findMarker(editor.document);

      // Drop flow computes against the SAME pre-insertion text + cursor.
      const expected = computeImportPlacement(
        documentText,
        info.destinationFileExt,
        info.sourceFileExt,
        s.cursorLine,
        s.cursorColumn,
        s.insideStyleBlock,
      );

      assert.strictEqual(actual.line, expected.line, `${s.name}: insertion LINE must match between flows`);
      if (s.forcedCursor) {
        assert.strictEqual(actual.column, s.cursorColumn, `${s.name}: paste must keep the caret column`);
        const targetLine = documentText.split('\n')[expected.line] ?? '';
        const expectedColumn = targetLine.trim().length === 0 ? 0 : getLineIndentation(targetLine).length;
        assert.strictEqual(expected.column, expectedColumn, `${s.name}: drop must take the target line's structural indent`);
      } else if (s.flat) {
        assert.strictEqual(actual.column, expected.column, `${s.name}: insertion COLUMN must match between flows`);
      }
    });
  }
});
