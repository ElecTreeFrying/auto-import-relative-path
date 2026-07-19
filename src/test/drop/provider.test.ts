import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { AutoImportOnDropProvider } from '../../drop/provider';
import { setAutoImportSetting } from '../../config/settings';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

const provider = new AutoImportOnDropProvider();

/** Builds a DataTransfer carrying a single `text/uri-list` entry for the given absolute path. */
function dataTransferFor(absPath: string): vscode.DataTransfer {
  const transfer = new vscode.DataTransfer();
  transfer.set('text/uri-list', new vscode.DataTransferItem(vscode.Uri.file(absPath).toString()));
  return transfer;
}

async function destDocument(relativePath: string): Promise<vscode.TextDocument> {
  return vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
}

function dropWith(doc: vscode.TextDocument, transfer: vscode.DataTransfer) {
  const token = new vscode.CancellationTokenSource().token;
  return provider.provideDocumentDropEdits(doc, new vscode.Position(0, 0), transfer, token);
}

function drop(doc: vscode.TextDocument, sourceRel: string) {
  return dropWith(doc, dataTransferFor(path.join(FIXTURE_ROOT, sourceRel)));
}

/** Drops at an explicit line AND column, so the drop position actually varies (the default helper drops at 0,0). */
function dropAtPosition(doc: vscode.TextDocument, sourceRel: string, line: number, column: number) {
  const token = new vscode.CancellationTokenSource().token;
  const transfer = dataTransferFor(path.join(FIXTURE_ROOT, sourceRel));
  return provider.provideDocumentDropEdits(doc, new vscode.Position(line, column), transfer, token);
}

/**
 * Runs a drop against a throwaway document and returns the text that actually results.
 *
 * A `SnippetTextEdit` is invisible through `WorkspaceEdit`'s public accessors — `size`, `get()`, and
 * `entries()` all report empty for one — so the edit object cannot be introspected. Applying it and
 * reading the document back is both the only reliable route and the stronger assertion: it proves
 * what the user ends up with, not merely what we asked VS Code for.
 */
async function textAfterDrop(
  tempName: string,
  content: string,
  sourceRels: string[],
  line: number,
  column: number,
): Promise<string> {
  const tmp = vscode.Uri.file(path.join(FIXTURE_ROOT, tempName));
  await vscode.workspace.fs.writeFile(tmp, Buffer.from(content, 'utf-8'));
  try {
    const doc = await vscode.workspace.openTextDocument(tmp);
    const transfer = new vscode.DataTransfer();
    transfer.set('text/uri-list', new vscode.DataTransferItem(
      sourceRels.map(rel => vscode.Uri.file(path.join(FIXTURE_ROOT, rel)).toString()).join('\n'),
    ));
    const token = new vscode.CancellationTokenSource().token;
    const result = await provider.provideDocumentDropEdits(doc, new vscode.Position(line, column), transfer, token);
    assert.ok(result, 'expected a drop edit');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'expected an attached placement WorkspaceEdit');
    assert.strictEqual(await vscode.workspace.applyEdit(result.additionalEdit), true, 'applyEdit must succeed');
    return doc.getText();
  } finally {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    try { await vscode.workspace.fs.delete(tmp); } catch { /* best-effort cleanup */ }
  }
}

/**
 * Asserts a *suppressed* drop: an empty `DocumentDropEdit` (empty `SnippetString`, no
 * `additionalEdit`) rather than `null`. The empty edit out-ranks VS Code's built-in
 * insert-relative-path default, resolving the drop to a no-op so nothing lands in the
 * document — whereas `null` would cede to that default and insert a stray raw path. The
 * empty `insertText` distinguishes it from an inline edit; the absent `additionalEdit`
 * from a placement edit. See `suppressDrop()` in drop/provider.ts and the
 * "`null` vs. `suppressDrop()`" section of src/drop/CLAUDE.md.
 */
function assertSuppressed(result: vscode.DocumentDropEdit | null) {
  assert.ok(result, 'expected a suppressing DocumentDropEdit, not null (null cedes to VS Code\'s raw-path default)');
  assert.strictEqual(result.title, 'Auto Import');
  assert.strictEqual((result.insertText as vscode.SnippetString).value, '', 'a suppressing edit must insert nothing');
  assert.strictEqual(result.additionalEdit, undefined, 'a suppressing edit must not carry a placement WorkspaceEdit');
}

describe('AutoImportOnDropProvider.provideDocumentDropEdits', () => {
  it('suppresses the drop (empty edit, not null) when the source/destination pair fails gating (.ts → .css)', async () => {
    const doc = await destDocument('styles/reset.css');
    const result = await drop(doc, 'src/bar.ts');
    assertSuppressed(result);
  });

  it('suppresses the drop (empty edit, not null) when the dragged file is the destination itself (same-file)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'src/foo.ts');
    assertSuppressed(result);
  });

  it('suppresses the drop (empty edit, not null) when gating passes but the snippet is empty (.ts → .jsx backstop)', async () => {
    const doc = await destDocument('src/badge.jsx');
    const result = await drop(doc, 'src/bar.ts');
    assertSuppressed(result);
  });

  it('returns a placement drop edit with an attached WorkspaceEdit for a supported pair (.ts → .ts)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'src/bar.ts');

    assert.ok(result, 'expected a DocumentDropEdit for a supported pair');
    assert.strictEqual(result.title, 'Auto Import');
    // Placement is delivered as a SnippetTextEdit on additionalEdit (VS Code's legacy
    // WorkspaceEdit accessors size/get don't surface snippet edits, so we only assert presence).
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'expected an attached WorkspaceEdit');
  });

  it('delivers a framework component into a script destination via insertText, not additionalEdit (.vue → .ts)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'src/App.vue');

    assert.ok(result, 'expected a DocumentDropEdit for .vue → .ts');
    assert.strictEqual(result.title, 'Auto Import');
    // A concrete insertText (NOT an empty-insertText + additionalEdit placement) is what out-ranks
    // VS Code's built-in TypeScript "drop to update imports" provider — which competes on script
    // destinations and, unable to import an SFC, otherwise leaves the raw path + a "Not supported" notice.
    const inserted = (result.insertText as vscode.SnippetString).value;
    assert.ok(inserted.includes("from './App.vue'"), `expected the component import in insertText, got: "${inserted}"`);
    assert.strictEqual(result.additionalEdit, undefined, 'component-into-script drops must NOT defer to a placement WorkspaceEdit');
  });

  it('suppresses a non-component source dropped into a script destination (.png → .ts, narrow allow-list)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'assets/logo.png');
    assertSuppressed(result);
  });

  it('returns an inline drop edit whose insertText carries the url() snippet (.png → .css)', async () => {
    const doc = await destDocument('styles/reset.css');
    const result = await drop(doc, 'assets/logo.png');

    assert.ok(result, 'expected a DocumentDropEdit for an image into a stylesheet');
    assert.strictEqual(result.title, 'Auto Import');
    const inserted = String((result.insertText as vscode.SnippetString).value);
    assert.ok(
      inserted.includes("url(") && inserted.includes('logo.png'),
      `expected an inline url() snippet referencing the image, got: "${inserted}"`,
    );
  });

  it('drops an extensionless source into a .md destination as a Markdown link (placement edit)', async () => {
    const doc = await destDocument('docs/guide.md');
    const result = await drop(doc, 'LICENSE');
    assert.ok(result, 'expected a DocumentDropEdit for extensionless → .md');
    assert.strictEqual(result.title, 'Auto Import');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'the Markdown link is delivered via a placement WorkspaceEdit');
  });

  it('suppresses an extensionless source dropped into a non-.md destination (.ts)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await drop(doc, 'LICENSE');
    assertSuppressed(result);
  });
});

// resolveSourcePath prefers text/uri-list, falls back to an absolute text/plain, and otherwise
// yields null (no drop edit offered). The cases above all feed text/uri-list; these exercise the
// fallback and the give-up branches through the public provider.
describe('AutoImportOnDropProvider — source resolution fallbacks', () => {
  function plainTransfer(value: string): vscode.DataTransfer {
    const transfer = new vscode.DataTransfer();
    transfer.set('text/plain', new vscode.DataTransferItem(value));
    return transfer;
  }

  it('falls back to text/plain when it is an absolute path (no uri-list present)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropWith(doc, plainTransfer(path.join(FIXTURE_ROOT, 'src/bar.ts')));
    assert.ok(result, 'expected an edit from an absolute text/plain path');
  });

  it('returns null when text/plain is a relative path (not absolute)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropWith(doc, plainTransfer('src/bar.ts'));
    assert.strictEqual(result, null);
  });

  it('returns null when the DataTransfer carries no usable item', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropWith(doc, new vscode.DataTransfer());
    assert.strictEqual(result, null);
  });

  it('returns null when uri-list is blank and there is no text/plain', async () => {
    const doc = await destDocument('src/foo.ts');
    const transfer = new vscode.DataTransfer();
    transfer.set('text/uri-list', new vscode.DataTransferItem('   '));
    const result = await dropWith(doc, transfer);
    assert.strictEqual(result, null);
  });
});

// Drop placement through the Astro/SFC branches of computeImportPlacement — distinct from the script
// (.ts → .ts) and inline (.png → .css) paths above. The script-less .svelte case exercises the
// wrapperPrefix concatenation in provider.ts that fixtures with an existing block skip.
describe('AutoImportOnDropProvider — framework-destination placement', () => {
  it('drop .ts into .astro (with frontmatter) yields a placement WorkspaceEdit', async () => {
    const doc = await destDocument('src/App.astro');
    const result = await drop(doc, 'src/bar.ts');
    assert.ok(result, 'expected a DocumentDropEdit for .ts into .astro');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
  });

  it('drop .ts into .vue (with <script> block) yields a placement WorkspaceEdit', async () => {
    const doc = await destDocument('src/App.vue');
    const result = await drop(doc, 'src/bar.ts');
    assert.ok(result, 'expected a DocumentDropEdit for .ts into .vue');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
  });

  it('drop .ts into a script-less .svelte wraps the import (wrapperPrefix path)', async () => {
    const uri = vscode.Uri.file(path.join(FIXTURE_ROOT, '_temp_drop_no_script.svelte'));
    await vscode.workspace.fs.writeFile(uri, Buffer.from('<div>Hello</div>\n', 'utf-8'));
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      const result = await drop(doc, 'src/bar.ts');
      assert.ok(result, 'expected a DocumentDropEdit for .ts into a script-less .svelte');
      assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
    } finally {
      try { await vscode.workspace.fs.delete(uri); } catch { /* ignore */ }
    }
  });
});

// Multi-file drop: dragging several files from the Explorer delivers a newline-separated
// text/uri-list. The provider fans out over every URI, skips same-file / unsupported members, and
// stacks the remaining statement-style imports into a single placement edit. The renumber+join that
// keeps stacked tab stops independent is unit-tested in compose.test.ts; because WorkspaceEdit does
// not surface SnippetTextEdit content through its public accessors, these cases assert *routing* —
// which drops produce a placement edit vs. a suppression. The distinguishing cases put a skippable
// file (unsupported, or the destination itself) FIRST: single-file behaviour reads only that first
// URI and suppresses, so a passing edit proves the later URIs were processed.
describe('AutoImportOnDropProvider — multi-file drop', () => {
  function manyTransfer(absPaths: string[], separator = '\n'): vscode.DataTransfer {
    const transfer = new vscode.DataTransfer();
    const uriList = absPaths.map(p => vscode.Uri.file(p).toString()).join(separator);
    transfer.set('text/uri-list', new vscode.DataTransferItem(uriList));
    return transfer;
  }
  function dropMany(doc: vscode.TextDocument, sourceRels: string[], separator = '\n') {
    return dropWith(doc, manyTransfer(sourceRels.map(r => path.join(FIXTURE_ROOT, r)), separator));
  }

  it('stacks two supported sources into one placement WorkspaceEdit (.ts + .ts → .ts)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropMany(doc, ['src/bar.ts', 'src/api-client.ts']);
    assert.ok(result, 'expected a DocumentDropEdit for two supported sources');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'expected a stacked placement edit');
  });

  it('imports a later supported source even when the FIRST dragged file is unsupported (.css, .ts → .ts)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropMany(doc, ['styles/reset.css', 'src/bar.ts']);
    assert.ok(result, 'expected an edit, not null');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'an unsupported first member must not suppress the whole drop');
  });

  it('imports a later source even when the FIRST dragged file is the destination itself (same-file)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropMany(doc, ['src/foo.ts', 'src/bar.ts']);
    assert.ok(result, 'expected an edit, not null');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'a same-file first member must not suppress the whole drop');
  });

  it('parses a CRLF-separated uri-list (skips the unsupported first member, imports the rest)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropMany(doc, ['styles/reset.css', 'src/bar.ts'], '\r\n');
    assert.ok(result, 'expected an edit, not null');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'a CRLF-separated uri-list must split into multiple URIs');
  });

  it('suppresses the drop when every dragged file is unsupported (.css + .css → .ts)', async () => {
    const doc = await destDocument('src/foo.ts');
    const result = await dropMany(doc, ['styles/reset.css', 'styles/reset.css']);
    assertSuppressed(result);
  });

  // Mixed set into a stylesheet: an inline url() member (image) plus a statement member (.css).
  // The statement stacks into a placement WorkspaceEdit; the inline url() is dropped (it can't join
  // a statement block). The image is listed FIRST — an inline-first-only regression would return an
  // inline DocumentDropEdit (non-empty insertText, no additionalEdit) instead, so the empty
  // insertText + WorkspaceEdit here proves the trailing statement drove the edit.
  it('mixed inline + statement routes to a stacked placement edit, not inline-first-only (.png + .css → .scss)', async () => {
    const doc = await destDocument('styles/main.scss');
    const result = await dropMany(doc, ['assets/images/favicon.png', 'styles/global.css']);
    assert.ok(result, 'expected an edit, not null');
    assert.strictEqual((result.insertText as vscode.SnippetString).value, '', 'the placement path inserts via additionalEdit, not inline insertText');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'the .css statement must drive a stacked placement edit; a leading inline image must not trigger the inline-first-only return');
  });
});

// Stylesheet sources into framework SFCs. Dropping a .css/.scss onto a .vue/.svelte/.astro now
// produces an import (previously gate-rejected → suppressed). WorkspaceEdit content is not surfaced,
// so these assert routing: a placement edit vs. suppression. The dialect (@import/@use vs. side-effect)
// is unit-tested in dispatch/framework-component/variants; here we drop at a <style>-block position.
describe('AutoImportOnDropProvider — stylesheet into framework SFC', () => {
  function dropAt(doc: vscode.TextDocument, sourceRels: string[], line: number) {
    const transfer = new vscode.DataTransfer();
    const uriList = sourceRels.map(r => vscode.Uri.file(path.join(FIXTURE_ROOT, r)).toString()).join('\n');
    transfer.set('text/uri-list', new vscode.DataTransferItem(uriList));
    const token = new vscode.CancellationTokenSource().token;
    return provider.provideDocumentDropEdits(doc, new vscode.Position(line, 0), transfer, token);
  }

  it('.css into a .vue (previously gate-rejected) now yields a placement edit, not a suppression', async () => {
    const doc = await destDocument('src/App.vue');
    const result = await drop(doc, 'styles/global.css'); // dropped at 0,0 — the script region
    assert.ok(result, 'expected a DocumentDropEdit — .css → .vue is now supported');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit, 'a supported stylesheet source must produce a placement edit');
  });

  it('.css dropped inside a <style> block yields a placement edit (style dialect)', async () => {
    const doc = await destDocument('src/styled.vue');
    const result = await dropAt(doc, ['styles/global.css'], 9); // inside the <style scoped> block
    assert.ok(result, 'expected a placement edit for .css into a <style> block');
    assert.strictEqual((result.insertText as vscode.SnippetString).value, '', 'style-block placement is delivered via additionalEdit');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
  });

  it('multi-file all-stylesheet drop into a <style> block stacks into one placement edit', async () => {
    const doc = await destDocument('src/styled.vue');
    const result = await dropAt(doc, ['styles/global.css', 'styles/theme.scss'], 9);
    assert.ok(result, 'expected a stacked placement edit for two stylesheet sources');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
  });

  it('.scss dropped inside an Astro <style> block yields a placement edit', async () => {
    const doc = await destDocument('src/styled.astro');
    const result = await dropAt(doc, ['styles/theme.scss'], 9);
    assert.ok(result, 'expected a placement edit for .scss into an Astro <style> block');
    assert.ok(result.additionalEdit instanceof vscode.WorkspaceEdit);
  });
});

// End-to-end proof that the drop provider EMITS the edit at column 0. The unit tests pin
// computeImportPlacement's return value; these assert the position the provider actually hands to
// VS Code, which is what the user sees. Before the own-line fix these landed at the drop column,
// splicing the import into the middle of the line it was dropped on.
describe('AutoImportOnDropProvider — a dropped import takes its own line', () => {
  it('.js into .html dropped mid-line does not splice the line it lands on', async () => {
    const text = await textAfterDrop(
      '_own_line.html', '<body>\n  <main>hello</main>\n</body>\n', [ 'pages/app.js' ], 1, 9);
    assert.ok(
      text.includes('\n  <main>hello</main>\n'),
      `the dropped-on line must survive intact, got:\n${text}`,
    );
    assert.strictEqual(
      text.split('\n')[1], '<script src="./pages/app.js"></script>',
      `the import must own line 1 at column 0, got:\n${text}`,
    );
  });

  it('.md into .md dropped mid-word does not splice the prose line', async () => {
    const text = await textAfterDrop(
      '_own_line.md', '# Title\n\nSome existing prose.\n', [ 'docs/architecture.md' ], 2, 7);
    assert.ok(
      text.includes('\nSome existing prose.\n'),
      `the prose line must survive intact, got:\n${text}`,
    );
    assert.ok(
      text.split('\n')[2].includes('architecture.md'),
      `the link must own line 2, got:\n${text}`,
    );
  });

  it('.png into .tex dropped mid-line keeps the body line whole and stays out of the preamble', async () => {
    const text = await textAfterDrop(
      '_own_line.tex',
      '\\documentclass{article}\n\\begin{document}\nBody prose here.\n\\end{document}\n',
      [ 'assets/logo.png' ], 2, 5);
    assert.ok(text.includes('\nBody prose here.\n'), `the body line must survive intact, got:\n${text}`);
    assert.strictEqual(
      text.split('\n')[0], '\\documentclass{article}',
      'the preamble must be untouched',
    );
    assert.ok(text.split('\n')[2].startsWith('\\begin{figure}'), `the figure must own line 2, got:\n${text}`);
  });

  it('a multi-file drop stacks at column 0 without splicing', async () => {
    const text = await textAfterDrop(
      '_own_line_multi.html', '<body>\n  <main>hello</main>\n</body>\n',
      [ 'pages/app.js', 'assets/logo.png' ], 1, 9);
    assert.ok(text.includes('\n  <main>hello</main>\n'), `the dropped-on line must survive intact, got:\n${text}`);
    const lines = text.split('\n');
    assert.ok(lines[1].startsWith('<script'), `first stacked statement at column 0, got: "${lines[1]}"`);
    assert.ok(lines[2].startsWith('<img'), `second stacked statement at column 0, got: "${lines[2]}"`);
  });

  it('the inline url() branch still uses the exact drop position (must NOT be forced to 0)', async () => {
    const doc = await destDocument('styles/reset.css');
    const result = await dropAtPosition(doc, 'assets/logo.png', 3, 16);
    assert.ok(result, 'expected an inline drop edit');
    assert.strictEqual(result.additionalEdit, undefined, 'inline url() is delivered via insertText, not a placement edit');
    assert.ok(
      (result.insertText as vscode.SnippetString).value.includes('url('),
      'expected the inline url() snippet',
    );
  });
});

// The span hop must reach the DROP flow too, not just paste — both share adjustForCommentBlock.
describe('AutoImportOnDropProvider — JSX comment span', () => {
  const SPAN_DOC = 'import { Header } from "./guide";\n\n{/*\n  draft outline\n*/}\n\n# Notes\n';

  afterEach(async () => {
    await setAutoImportSetting('preferences', 'placement', undefined);
  });

  it('.ts dropped inside an .mdx {/* */} span lands above the opener, not inside the comment', async () => {
    await setAutoImportSetting('preferences', 'placement', 'Cursor');
    const text = await textAfterDrop('_span.mdx', SPAN_DOC, [ 'src/bar.ts' ], 3, 4);
    const lines = text.split('\n');
    assert.ok(lines[2].includes('bar'), `expected the import above the opener on line 2, got:\n${text}`);
    assert.strictEqual(lines[3].trim(), '{/*', `the span opener must be pushed down intact, got:\n${text}`);
  });

  it('.ts dropped below a closed one-line span is NOT hopped', async () => {
    await setAutoImportSetting('preferences', 'placement', 'Cursor');
    const text = await textAfterDrop(
      '_span_closed.mdx', '{/* a one-line note */}\n\n# Notes\n', [ 'src/bar.ts' ], 1, 0);
    const lines = text.split('\n');
    assert.strictEqual(
      lines[0], '{/* a one-line note */}',
      `a closed span leaves no state to hop out of, got:\n${text}`,
    );
    assert.ok(lines[1].includes('bar'), `the import belongs at the gesture line 1, got:\n${text}`);
  });
});
