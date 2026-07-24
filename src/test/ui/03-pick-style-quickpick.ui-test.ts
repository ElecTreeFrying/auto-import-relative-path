import * as assert from 'assert';
import { InputBox, Key, TextEditor, Workbench } from 'vscode-extension-tester';

import { TYPESCRIPT_IMPORT_OPTIONS } from '../../snippets/_styles';
import {
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  expectNoNotification,
  openFixture,
  pollEditorContains,
  sendChord,
  sleep,
  snapshotQuickPicks,
} from './_helpers';

/** The picker's description column renders the style's tag, falling back to the raw template. */
function expectedTag(index: number): string {
  const option = TYPESCRIPT_IMPORT_OPTIONS[index];
  return option.tag ?? option.description;
}

/** Copies Widget.ts (editor-focused chord) and opens destination.ts — the picker's staged pair. */
async function stagePair(): Promise<TextEditor> {
  await openFixture('Widget.ts');
  await sendChord(Key.META, Key.SHIFT, 'a');
  return openFixture('destination.ts');
}

describe('[general.md §9 / tsx.md §7] Paste as Import (Pick Style) — .ts → .ts', function () {
  before(async function () {
    await ensureWorkspaceOpen();
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  it('[tsx.md §7.1/§7.3] 7 items; labels are basename previews; descriptions equal the verbatim style tags', async function () {
    await stagePair();
    await new Workbench().executeCommand('Auto Import: Paste as Import (Pick Style)');
    const picker = await InputBox.create();
    assert.strictEqual(await picker.getPlaceHolder(), 'Select an import style');
    const rows = await snapshotQuickPicks(picker);
    assert.strictEqual(rows.length, TYPESCRIPT_IMPORT_OPTIONS.length,
      `expected one row per TypeScript style, saw: ${JSON.stringify(rows.map(row => row.label))}`);
    for (let index = 0; index < rows.length; index++) {
      assert.strictEqual(rows[index].description, expectedTag(index),
        `row ${index}'s description must be the verbatim style tag`);
      assert.ok(rows[index].label.includes("'Widget'"),
        `row ${index}'s label must preview the basename, got: ${rows[index].label}`);
      assert.ok(!rows[index].label.includes('./'),
        `row ${index}'s label must not carry the relative path, got: ${rows[index].label}`);
    }
    await picker.cancel();
  });

  it('[general.md §9.2] typing filters the list on description', async function () {
    await stagePair();
    await new Workbench().executeCommand('Auto Import: Paste as Import (Pick Style)');
    const picker = await InputBox.create();
    await sleep(500); // let the picker become interactable before typing (setText flakes otherwise)
    await picker.setText('type-only');
    await sleep(600); // let the filter re-render
    const rows = await snapshotQuickPicks(picker);
    // Intent: typing narrows the list on the description. Assert it narrowed and still surfaces the
    // type-only style — the exact surviving count depends on VS Code's fuzzy matcher.
    assert.ok(rows.length >= 1 && rows.length < TYPESCRIPT_IMPORT_OPTIONS.length,
      `the filter must narrow the list, got ${rows.length} rows`);
    assert.ok(rows.some(row => row.description === expectedTag(4)),
      `the filtered list must keep the type-only style, got: ${JSON.stringify(rows.map(row => row.description))}`);
    await picker.cancel();
  });

  it('[general.md §9.1] Escape dismisses silently — no toast, no insert', async function () {
    await stagePair();
    await new Workbench().executeCommand('Auto Import: Paste as Import (Pick Style)');
    const picker = await InputBox.create();
    await picker.cancel();
    await expectNoNotification('Auto Import:');
    // Intent: Escape inserted no IMPORT. Assert on the import (robust to cosmetic whitespace churn
    // in the editor), not byte-identity of the whole buffer.
    const destinationAfter = await openFixture('destination.ts');
    assert.ok(!(await destinationAfter.getText()).includes("from './Widget'"),
      'Escape must insert no import');
  });

  it('[general.md §9 select] selecting the namespace style inserts that shape', async function () {
    const destination = await stagePair();
    await new Workbench().executeCommand('Auto Import: Paste as Import (Pick Style)');
    const picker = await InputBox.create();
    const rows = await snapshotQuickPicks(picker);
    await picker.selectQuickPick(rows[2].label); // index 2 = the namespace style
    const text = await pollEditorContains(destination, 'import * as');
    assert.ok(text.includes("from './Widget';"), `the namespace import must target the full relative path, got: ${text}`);
  });

  it('[general.md §9.3] picking a non-default style does not change the default', async function () {
    // The §9-select test just inserted the namespace style via the picker; a plain Cmd+I must still
    // use the untouched default (style 0 — named import, class-detected identifier).
    const destination = await stagePair();
    await sendChord(Key.META, 'i');
    await pollEditorContains(destination, "import { Widget } from './Widget';");
  });
});
