import * as assert from 'assert';
import { InputBox, Key, TextEditor, Workbench } from 'vscode-extension-tester';

import {
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  expectNoNotification,
  findNotification,
  openFixture,
  pollEditorContains,
  sendChord,
  snapshotQuickPicks,
} from './_helpers';

/** Copies Widget.ts (editor-focused chord) and opens destination.ts. */
async function stagePair(): Promise<TextEditor> {
  await openFixture('Widget.ts');
  await sendChord(Key.META, Key.SHIFT, 'a');
  return openFixture('destination.ts');
}

describe('[general.md §12.1–12.3] Set Import Placement', function () {
  before(async function () {
    await ensureWorkspaceOpen();
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  it('[general.md §12.1] placeholder, three options with detail lines, current marked and first', async function () {
    await new Workbench().executeCommand('Auto Import: Set Import Placement');
    const picker = await InputBox.create();
    assert.strictEqual(await picker.getPlaceHolder(), 'Set import placement');
    const rows = await snapshotQuickPicks(picker);
    const labels = rows.map(row => row.label);
    assert.deepStrictEqual([...labels].sort(), ['Bottom', 'Cursor', 'Top']);
    assert.strictEqual(labels[0], 'Bottom', 'the current default (Bottom) must be listed first');
    assert.ok(rows[0].description.includes('Current'), `the current row must be marked, got: ${rows[0].description}`);
    await picker.cancel();
  });

  it('[general.md §12.2] selecting Top toasts, persists, moves the marker, and lands imports on line 1', async function () {
    await new Workbench().executeCommand('Auto Import: Set Import Placement');
    let picker = await InputBox.create();
    await picker.selectQuickPick('Top');
    await findNotification('Auto Import: Import placement saved — Top');

    await new Workbench().executeCommand('Auto Import: Set Import Placement');
    picker = await InputBox.create();
    const rows = await snapshotQuickPicks(picker);
    assert.strictEqual(rows[0].label, 'Top', 'the marker must move to Top');
    assert.ok(rows[0].description.includes('Current'));
    await picker.cancel();

    try {
      const destination = await stagePair();
      await sendChord(Key.META, 'i');
      const text = await pollEditorContains(destination, "from './Widget';");
      assert.ok(text.split('\n')[0].includes("./Widget"),
        `Top mode must land the import on the first line, got: ${text.split('\n')[0]}`);
    } finally {
      await dismissAllToasts();
      await new Workbench().executeCommand('Auto Import: Set Import Placement');
      const restore = await InputBox.create();
      await restore.selectQuickPick('Bottom');
      await findNotification('Auto Import: Import placement saved — Bottom');
    }
  });

  it('[general.md §12.3] Escape saves nothing', async function () {
    await new Workbench().executeCommand('Auto Import: Set Import Placement');
    const picker = await InputBox.create();
    await picker.cancel();
    await expectNoNotification('placement saved');
    await new Workbench().executeCommand('Auto Import: Set Import Placement');
    const reopened = await InputBox.create();
    const rows = await snapshotQuickPicks(reopened);
    assert.strictEqual(rows[0].label, 'Bottom', 'the placement must still be Bottom after Escape');
    await reopened.cancel();
  });
});
