import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { executePasteImport } from '../../commands/paste-import';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

async function openFixture(relativePath: string): Promise<vscode.TextEditor> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  return vscode.window.showTextDocument(doc);
}

async function closeAll(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

function waitForDocumentChange(fn: () => Promise<void>, timeoutMs = 500): Promise<boolean> {
  return new Promise(resolve => {
    const timeout = setTimeout(() => { disposable.dispose(); resolve(false); }, timeoutMs);
    const disposable = vscode.workspace.onDidChangeTextDocument(() => {
      clearTimeout(timeout);
      disposable.dispose();
      resolve(true);
    });
    fn();
  });
}

describe('executePasteImport', () => {
  afterEach(async () => {
    await closeAll();
  });

  describe('rejection: clipboard validation', () => {
    it('empty clipboard triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText('');
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for empty clipboard');
    });

    it('non-absolute path triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText('relative/path.ts');
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for non-absolute path');
    });

    it('path without extension into a non-.md destination triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText('/usr/local/bin/Makefile');
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for extensionless path into .ts');
    });
  });

  describe('extensionless source → Markdown link', () => {
    it('inserts a Markdown link when pasting an extensionless source into a .md destination', async () => {
      await openFixture('docs/guide.md');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'LICENSE'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the Markdown link to insert for extensionless → .md');
    });

    it('rejects an extensionless source into a non-.md destination (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'LICENSE'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change — extensionless imports only into .md');
    });
  });

  describe('rejection: same-file', () => {
    it('clipboard equals destination path triggers warning (no document change)', async () => {
      const destPath = path.join(FIXTURE_ROOT, 'src/foo.ts');
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(destPath);
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for same-file');
    });
  });

  describe('rejection: source not found', () => {
    it('nonexistent source file triggers warning (no document change)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/nonexistent-file.ts'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for missing source');
    });
  });

  describe('rejection: unsupported pairs', () => {
    it('.html into .html triggers not-supported (no document change)', async () => {
      await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'pages/about.html'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .html into .html');
    });

    it('.ts into .html triggers not-supported (no document change)', async () => {
      await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .ts into .html');
    });

    it('.ts into .js rejects (same-extension rule)', async () => {
      await openFixture('src/sibling.js');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .ts into .js');
    });

    it('.js into .ts rejects (same-extension rule)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/sibling.js'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .js into .ts');
    });

    it('.scss into .html rejects (not in HTML_SUPPORTED_EXTENSIONS)', async () => {
      await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/main.scss'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .scss into .html');
    });

    // The only gating-passes-but-empty-snippet pair: .jsx accepts cross-imports, but the JSX
    // builder has no .ts/.tsx branch, so the snippet is empty and clauses 10/11 reject it.
    it('.ts into .jsx triggers not-supported (gating passes, empty snippet)', async () => {
      await openFixture('src/badge.jsx');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .ts into .jsx');
    });

    it('.tsx into .jsx triggers not-supported (gating passes, empty snippet)', async () => {
      await openFixture('src/badge.jsx');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/widget.tsx'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change for .tsx into .jsx');
    });
  });

  describe('successful insertion', () => {
    it('.ts into .ts inserts import snippet', async () => {
      const editor = await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      const textBefore = editor.document.getText();
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for valid .ts into .ts');
      assert.notStrictEqual(editor.document.getText(), textBefore, 'document should differ after insertion');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), `expected import path in document, got: ${allText.slice(0, 200)}`);
    });

    it('.js into .html inserts <script> tag', async () => {
      const editor = await openFixture('pages/index.html');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'with-requires.js'));
      const textBefore = editor.document.getText();
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for valid .js into .html');
      assert.notStrictEqual(editor.document.getText(), textBefore, 'document should differ after insertion');
      const allText = editor.document.getText();
      assert.ok(allText.includes('<script src='), `expected <script> tag in document, got: ${allText.slice(0, 200)}`);
    });

    it('.ts into .vue inserts TS-style import (cross-import)', async () => {
      const editor = await openFixture('src/App.vue');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      const textBefore = editor.document.getText();
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for valid .ts into .vue');
      assert.notStrictEqual(editor.document.getText(), textBefore, 'document should differ after insertion');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), `expected import path in document, got: ${allText.slice(0, 200)}`);
    });

    it('.css into .scss inserts SCSS import (cross-import)', async () => {
      const editor = await openFixture('styles/main.scss');
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/global.css'));
      const textBefore = editor.document.getText();
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for valid .css into .scss');
      assert.notStrictEqual(editor.document.getText(), textBefore, 'document should differ after insertion');
      const allText = editor.document.getText();
      assert.ok(allText.includes('./global.css'), `expected SCSS import with .css preserved, got: ${allText.slice(0, 200)}`);
    });
  });

  // Stylesheet source into a framework SFC: the shape depends on where the cursor sits. Inside a
  // <style> block it is the @import/@use dialect; in the script region it is a side-effect import.
  // (These pairs were gate-rejected before this feature — see the removed 'rejects' cases.)
  describe('stylesheet source into a framework SFC', () => {
    function setCursor(editor: vscode.TextEditor, line: number): void {
      const pos = new vscode.Position(line, 0);
      editor.selection = new vscode.Selection(pos, pos);
    }

    it('.css into a .vue <style> block inserts the @import shape', async () => {
      const editor = await openFixture('src/styled.vue');
      setCursor(editor, 9); // inside <style scoped>
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/global.css'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the @import to insert');
      assert.ok(editor.document.getText().includes("@import '../styles/global.css';"),
        `expected @import in the <style> block, got: ${editor.document.getText()}`);
    });

    it('.scss into a .vue <style> block inserts the @use shape (extension dropped)', async () => {
      const editor = await openFixture('src/styled.vue');
      setCursor(editor, 9);
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/theme.scss'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the @use to insert');
      assert.ok(editor.document.getText().includes("@use '../styles/theme';"),
        `expected @use in the <style> block, got: ${editor.document.getText()}`);
    });

    it('.css into a .vue script region inserts the side-effect import (not @import)', async () => {
      const editor = await openFixture('src/styled.vue');
      setCursor(editor, 0); // the <script setup> line — outside every <style> block
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/global.css'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the side-effect import to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes("import '../styles/global.css';"), `expected side-effect import, got: ${allText}`);
      assert.ok(!allText.includes('@import'), 'must not use the style dialect outside a <style> block');
    });

    it('two stylesheet sources into a <style> block stack in the style dialect', async () => {
      const editor = await openFixture('src/styled.vue');
      setCursor(editor, 9);
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'styles/global.css'),
        path.join(FIXTURE_ROOT, 'styles/theme.scss'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the stacked style block to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes("@import '../styles/global.css';"), 'the .css member → @import');
      assert.ok(allText.includes("@use '../styles/theme';"), 'the .scss member → @use');
    });

    it('a mixed selection (stylesheet + script) into a <style> block stays script-dialect (D4)', async () => {
      const editor = await openFixture('src/styled.vue');
      setCursor(editor, 9);
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'styles/global.css'),
        path.join(FIXTURE_ROOT, 'src/bar.ts'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the mixed selection to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes("import '../styles/global.css';"), 'the .css member stays a side-effect import in a mixed selection');
      assert.ok(allText.includes("from './bar'"), 'the .ts member imports too');
      assert.ok(!allText.includes('@import') && !allText.includes('@use'), 'a mixed selection must not use the style dialect');
    });
  });

  describe('rejection: no active editor', () => {
    it('returns without inserting and does not throw when no editor is open', async () => {
      await closeAll();
      await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
      // getFilePathInfo dereferences editor.document on a null editor — the guard must short-circuit first.
      await assert.doesNotReject(executePasteImport());
    });
  });

  // A multi-line clipboard (Explorer multi-selection) fans out per member and inserts one stacked
  // block, mirroring the drop provider's skip semantics. Tab-stop renumbering itself is pinned in
  // test/snippets/compose.test.ts — the editor renders placeholders as their default text, so these
  // assert member selection, ordering, and single-insertion placement through the document text.
  describe('multi-path clipboard (stacked imports)', () => {
    it('two .ts sources into .ts insert one stacked block in clipboard order', async () => {
      const editor = await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'src/bar.ts'),
        path.join(FIXTURE_ROOT, 'src/api-client.ts'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for multi .ts into .ts');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), `expected first member's import, got: ${allText.slice(0, 200)}`);
      assert.ok(allText.includes("from './api-client'"), `expected second member's import, got: ${allText.slice(0, 200)}`);
      assert.ok(allText.indexOf('./bar') < allText.indexOf('./api-client'), 'stack must keep clipboard order');
    });

    it('skips a same-file member and inserts the rest', async () => {
      const editor = await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'src/foo.ts'),
        path.join(FIXTURE_ROOT, 'src/bar.ts'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the non-same-file member to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), 'valid member must insert');
      assert.ok(!allText.includes("from './foo'"), 'destination itself must not be imported');
    });

    it('skips a missing member and inserts the rest', async () => {
      const editor = await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'src/nonexistent-file.ts'),
        path.join(FIXTURE_ROOT, 'src/bar.ts'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the existing member to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), 'existing member must insert');
      assert.ok(!allText.includes('nonexistent-file'), 'missing member must be skipped');
    });

    it('skips an unsupported member and inserts the rest', async () => {
      // Fonts are deliberately excluded from the .js/.ts asset set, so a .woff2 into .ts stays unsupported.
      const editor = await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'assets/font.woff2'),
        path.join(FIXTURE_ROOT, 'src/bar.ts'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the supported member to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), 'supported member must insert');
      assert.ok(!allText.includes('font.woff2'), 'unsupported member must be skipped');
    });

    it('all members unsupported → no document change (one aggregate toast)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'assets/font.woff2'),
        path.join(FIXTURE_ROOT, 'assets/regular.ttf'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'expected no document change when every member is unsupported');
    });

    it('all extensionless members into a non-.md destination → no document change (aggregate no-extension)', async () => {
      await openFixture('src/foo.ts');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'LICENSE'),
        path.join(FIXTURE_ROOT, 'Dockerfile'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport());
      assert.strictEqual(changed, false, 'extensionless members are skipped into a non-.md destination');
    });

    it('stacks an extensionless member and a .md member as links into a .md destination', async () => {
      const editor = await openFixture('docs/guide.md');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'LICENSE'),
        path.join(FIXTURE_ROOT, 'docs/architecture.md'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the stacked Markdown links to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes('](../LICENSE)'), 'the extensionless member must link');
      assert.ok(allText.includes('](./architecture.md)'), 'the .md member must link');
    });

    it('all-inline members (two images into .css) insert only the first url()', async () => {
      const editor = await openFixture('styles/global.css');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'assets/images/favicon.png'),
        path.join(FIXTURE_ROOT, 'assets/images/logo-dark.png'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the first inline member to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes('favicon.png'), 'first image url() expected');
      assert.ok(!allText.includes('logo-dark.png'), 'second inline member must be dropped — url() values cannot stack');
    });

    // Mixed set: an inline url() member (image) alongside a statement member (.css) into .scss.
    // Statements win the single insertion — they stack into the block; inline url() values can't
    // join a statement block, so they are dropped. The image is listed FIRST to prove the statement
    // later in the clipboard still drives the insertion (not an inline-first-only return).
    it('mixed inline + statement (image + .css into .scss) stacks the statement and drops the inline url()', async () => {
      const editor = await openFixture('styles/main.scss');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'assets/images/favicon.png'),
        path.join(FIXTURE_ROOT, 'styles/global.css'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected the statement member to insert');
      const allText = editor.document.getText();
      assert.ok(allText.includes('global.css'), 'the .css statement (@use … global.css) must stack into the block');
      assert.ok(!allText.includes('favicon.png'), 'the inline url() member must be dropped — it cannot join a statement block');
    });

    it('stacks into the .vue script block as one insertion', async () => {
      const editor = await openFixture('src/App.vue');
      await vscode.env.clipboard.writeText([
        path.join(FIXTURE_ROOT, 'src/bar.ts'),
        path.join(FIXTURE_ROOT, 'src/api-client.ts'),
      ].join('\n'));
      const changed = await waitForDocumentChange(() => executePasteImport(), 2000);
      assert.strictEqual(changed, true, 'expected document change for multi .ts into .vue');
      const allText = editor.document.getText();
      assert.ok(allText.includes("from './bar'"), 'first member must land in the script block');
      assert.ok(allText.includes("from './api-client'"), 'second member must land in the script block');
      assert.ok(allText.indexOf('./bar') < allText.indexOf('./api-client'), 'stack must keep clipboard order');
    });
  });
});
