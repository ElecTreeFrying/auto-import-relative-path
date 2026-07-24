import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { executeCopyFilePath } from '../../commands/copy-file-path';
import { executePasteImport } from '../../commands/paste-import';
import { executeSetDefaultImportStyle } from '../../commands/set-default-import-style';
import { setAutoImportSetting } from '../../config/settings';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

async function openFixture(relativePath: string): Promise<vscode.TextEditor> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, relativePath)));
  return vscode.window.showTextDocument(doc);
}

async function closeAll(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

/** Yields long enough for `.then(...)`-chained toast handlers and timer-scheduled toasts to settle. */
function drainTimers(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 10));
}

// The checklists assert rendered toast strings with real interpolation, so these tests capture the
// runtime messages by save/replace/restoring the two window methods (the review-prompt.test.ts stub
// precedent — no Sinon). Assertions are exact-match membership in the captured arrays, never "last
// message", so an interleaved review-request toast can never satisfy or break one.
describe('general.md §5 — notification wording (runtime-captured bodies)', () => {
  let infoMessages: string[] = [];
  let warningMessages: string[] = [];
  let originalShowInformationMessage: typeof vscode.window.showInformationMessage;
  let originalShowWarningMessage: typeof vscode.window.showWarningMessage;
  let originalShowQuickPick: typeof vscode.window.showQuickPick;

  beforeEach(() => {
    infoMessages = [];
    warningMessages = [];
    originalShowInformationMessage = vscode.window.showInformationMessage;
    originalShowWarningMessage = vscode.window.showWarningMessage;
    originalShowQuickPick = vscode.window.showQuickPick;
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = (message: string) => {
      infoMessages.push(message);
      return Promise.resolve(undefined); // models a dismissal; `.then(dispatchPasteAction)` sees undefined
    };
    (vscode.window as { showWarningMessage: unknown }).showWarningMessage = (message: string) => {
      warningMessages.push(message);
      return Promise.resolve(undefined);
    };
  });

  afterEach(async () => {
    await drainTimers();
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = originalShowInformationMessage;
    (vscode.window as { showWarningMessage: unknown }).showWarningMessage = originalShowWarningMessage;
    (vscode.window as { showQuickPick: unknown }).showQuickPick = originalShowQuickPick;
    await setAutoImportSetting('script', 'typescript', undefined);
    await closeAll();
  });

  it('[general.md §5.1] copy success — Auto Import: Copied path — foo.ts', async () => {
    await openFixture('src/foo.ts');
    await executeCopyFilePath();
    assert.ok(
      infoMessages.includes('Auto Import: Copied path — foo.ts'),
      `expected the single-copy toast, got: ${JSON.stringify(infoMessages)}`,
    );
  });

  it('[general.md §5.3] same file — Auto Import: A file cannot import itself.', async () => {
    await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/foo.ts'));
    await executePasteImport();
    assert.ok(warningMessages.includes('Auto Import: A file cannot import itself.'),
      `got: ${JSON.stringify(warningMessages)}`);
  });

  it('[general.md §5.4] unsupported pair — Auto Import: Cannot import .js into .ts files.', async () => {
    await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/sibling.js'));
    await executePasteImport();
    assert.ok(warningMessages.includes('Auto Import: Cannot import .js into .ts files.'),
      `got: ${JSON.stringify(warningMessages)}`);
  });

  it('[general.md §5.5] no active editor — Auto Import: Open a file to paste an import.', async () => {
    await closeAll();
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    await executePasteImport();
    assert.ok(warningMessages.includes('Auto Import: Open a file to paste an import.'),
      `got: ${JSON.stringify(warningMessages)}`);
  });

  it('[general.md §5.6] nothing to copy — Auto Import: No file selected to copy.', async () => {
    // With no active editor the built-in `copyFilePath` leaves the clipboard untouched, so the
    // seeded empty clipboard drives the no-file-to-copy rejection.
    await closeAll();
    await vscode.env.clipboard.writeText('');
    await executeCopyFilePath();
    assert.ok(warningMessages.includes('Auto Import: No file selected to copy.'),
      `got: ${JSON.stringify(warningMessages)}`);
  });

  it('[general.md §5.7] no extension — LICENSE has no file extension — only Markdown links support extensionless files.', async () => {
    await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'LICENSE'));
    await executePasteImport();
    assert.ok(
      warningMessages.includes('Auto Import: LICENSE has no file extension — only Markdown links support extensionless files.'),
      `got: ${JSON.stringify(warningMessages)}`,
    );
  });

  it('[general.md §5.8] empty clipboard — Auto Import: Clipboard does not contain a file path.', async () => {
    await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText('hello world');
    await executePasteImport();
    assert.ok(warningMessages.includes('Auto Import: Clipboard does not contain a file path.'),
      `got: ${JSON.stringify(warningMessages)}`);
  });

  it('[general.md §5.9] source not found — Auto Import: Source file no longer exists: nonexistent-file.ts.', async () => {
    await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/nonexistent-file.ts'));
    await executePasteImport();
    assert.ok(warningMessages.includes('Auto Import: Source file no longer exists: nonexistent-file.ts.'),
      `got: ${JSON.stringify(warningMessages)}`);
  });

  it('[general.md §5.10] fixed style — Auto Import: .css → .html imports use a fixed style.', async () => {
    await openFixture('pages/index.html');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'styles/global.css'));
    await executeSetDefaultImportStyle();
    assert.ok(warningMessages.includes('Auto Import: .css → .html imports use a fixed style.'),
      `got: ${JSON.stringify(warningMessages)}`);
  });

  it('[general.md §5.2] default style saved — the toast suffix is the picked raw template value', async () => {
    // Stub the picker to choose the first non-current item; the toast must render that item's raw
    // `setting.value` template (e.g. `import name from '_relativePath_';`), not its description tag.
    let pickedValue = '';
    (vscode.window as { showQuickPick: unknown }).showQuickPick = (
      items: Array<vscode.QuickPickItem & { setting: { value: string } }>,
    ) => {
      const picked = items.find(item => !(item.description ?? '').includes('Current default')) ?? items[0];
      pickedValue = picked.setting.value;
      return Promise.resolve(picked);
    };
    await openFixture('src/foo.ts');
    await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, 'src/bar.ts'));
    await executeSetDefaultImportStyle();
    assert.notStrictEqual(pickedValue, '', 'the stubbed picker must have been reached');
    assert.ok(infoMessages.includes(`Auto Import: Default style saved — ${pickedValue}`),
      `got: ${JSON.stringify(infoMessages)}`);
  });
});

describe('general.md §13.1/§13.2 — multi-copy toast + elision', () => {
  let infoMessages: string[] = [];
  let originalShowInformationMessage: typeof vscode.window.showInformationMessage;

  // The multi-copy seam: with no active editor the built-in `copyFilePath` is a no-op, so a seeded
  // newline-joined clipboard flows straight into `copyMultipleFilePaths` — the real toast path.
  async function copyWithSeededClipboard(absolutePaths: string[]): Promise<void> {
    await closeAll();
    const seeded = absolutePaths.join('\n');
    await vscode.env.clipboard.writeText(seeded);
    await executeCopyFilePath();
    assert.strictEqual(
      await vscode.env.clipboard.readText(),
      seeded,
      'the seeded clipboard must survive the built-in delegate (all members absolute → re-written verbatim)',
    );
  }

  beforeEach(() => {
    infoMessages = [];
    originalShowInformationMessage = vscode.window.showInformationMessage;
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = (message: string) => {
      infoMessages.push(message);
      return Promise.resolve(undefined);
    };
  });

  afterEach(async () => {
    await drainTimers();
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = originalShowInformationMessage;
    await closeAll();
  });

  it('[general.md §13.1] two files — Auto Import: Copied 2 paths — foo.ts, bar.ts', async () => {
    await copyWithSeededClipboard([
      path.join(FIXTURE_ROOT, 'src/foo.ts'),
      path.join(FIXTURE_ROOT, 'src/bar.ts'),
    ]);
    assert.ok(infoMessages.includes('Auto Import: Copied 2 paths — foo.ts, bar.ts'),
      `got: ${JSON.stringify(infoMessages)}`);
  });

  it('[general.md §13.2] five files elide after three basenames — +2 more', async () => {
    await copyWithSeededClipboard([
      path.join(FIXTURE_ROOT, 'src/foo.ts'),
      path.join(FIXTURE_ROOT, 'src/bar.ts'),
      path.join(FIXTURE_ROOT, 'src/helpers.ts'),
      path.join(FIXTURE_ROOT, 'src/api-client.ts'),
      path.join(FIXTURE_ROOT, 'src/http.ts'),
    ]);
    assert.ok(infoMessages.includes('Auto Import: Copied 5 paths — foo.ts, bar.ts, helpers.ts, +2 more'),
      `got: ${JSON.stringify(infoMessages)}`);
  });

  it('[general.md §13.2 boundary] exactly three basenames render in full with no elision suffix', async () => {
    await copyWithSeededClipboard([
      path.join(FIXTURE_ROOT, 'src/foo.ts'),
      path.join(FIXTURE_ROOT, 'src/bar.ts'),
      path.join(FIXTURE_ROOT, 'src/helpers.ts'),
    ]);
    const expected = 'Auto Import: Copied 3 paths — foo.ts, bar.ts, helpers.ts';
    assert.ok(infoMessages.includes(expected), `got: ${JSON.stringify(infoMessages)}`);
    assert.ok(!infoMessages.some(message => message.includes('more')),
      'a three-member copy must not elide');
  });
});

// The message-prefix invariant is a source-read check (the actionLabelsInCase precedent from
// editor/notification.test.ts): every toast the module can raise — including review-request, which
// no execute* flow reaches cheaply — must carry the `Auto Import: ` prefix.
describe('editor/notification — every toast message carries the Auto Import: prefix (source-read)', () => {
  const NOTIFICATION_SRC = fs.readFileSync(
    path.resolve(__dirname, '../../../src/editor/notification.ts'),
    'utf-8',
  );

  it('each show*Message call site opens with the literal Auto Import: prefix', () => {
    const callSites = NOTIFICATION_SRC.match(/show(?:Warning|Information)Message\(/g) ?? [];
    const literalPrefixed = NOTIFICATION_SRC.match(/show(?:Warning|Information)Message\(\s*[`']Auto Import: /g) ?? [];
    // The two plural-aware cases (copy-success, styles-reset) pass a locally-built `message`
    // variable instead of a literal — verified separately below.
    const variableSites = NOTIFICATION_SRC.match(/show(?:Warning|Information)Message\(\s*message\b/g) ?? [];
    assert.ok(callSites.length > 0, 'notification.ts must contain show*Message call sites');
    assert.strictEqual(
      literalPrefixed.length + variableSites.length,
      callSites.length,
      `every show*Message call must take an Auto Import:-prefixed literal or the local message variable (${literalPrefixed.length}+${variableSites.length}/${callSites.length})`,
    );
  });

  it('each `const message =` builder renders only Auto Import:-prefixed arms', () => {
    const builders = NOTIFICATION_SRC.match(/const message = [\s\S]*?;/g) ?? [];
    assert.ok(builders.length > 0, 'notification.ts must contain the plural-aware message builders');
    for (const builder of builders) {
      const templates = builder.match(/`([^`]*)`/g) ?? [];
      assert.ok(templates.length > 0, `builder must contain template literals: ${builder}`);
      for (const template of templates) {
        assert.ok(template.startsWith('`Auto Import: '),
          `every message-builder arm must carry the prefix, got: ${template}`);
      }
    }
  });
});
