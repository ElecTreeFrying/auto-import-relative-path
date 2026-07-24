import * as assert from 'assert';
import { InputBox, Key, TextEditor, Workbench } from 'vscode-extension-tester';

import { TYPESCRIPT_IMPORT_OPTIONS } from '../../snippets/_styles';
import {
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  expectNoNotification,
  findNotification,
  notificationActionTitles,
  openFixture,
  sendChord,
  snapshotQuickPicks,
} from './_helpers';

/** Copies Widget.ts (editor-focused chord) and opens destination.ts — the picker's staged pair. */
async function stagePair(): Promise<TextEditor> {
  await openFixture('Widget.ts');
  await sendChord(Key.META, Key.SHIFT, 'a');
  return openFixture('destination.ts');
}

describe('[general.md §10] Set Default Import Style', function () {
  before(async function () {
    await ensureWorkspaceOpen();
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  after(async function () {
    // Restore the default AND double as the §12.6 UI smoke: the reset toast renders with its Undo
    // button (never clicked — clicking would re-apply the override).
    await new Workbench().executeCommand('Auto Import: Reset All Import Styles to Defaults');
    const notification = await findNotification('Reset 1 import style to defaults');
    const titles = await notificationActionTitles(notification);
    assert.ok(titles.includes('Undo'), `the reset toast must carry Undo, saw: ${JSON.stringify(titles)}`);
    await notification.dismiss();
    await discardAllEditors();
  });

  it('[general.md §10.1] the current default is first and marked Current default', async function () {
    await stagePair();
    await new Workbench().executeCommand('Auto Import: Set Default Import Style');
    const picker = await InputBox.create();
    assert.strictEqual(await picker.getPlaceHolder(), 'Set default import style');
    const rows = await snapshotQuickPicks(picker);
    assert.strictEqual(rows.length, TYPESCRIPT_IMPORT_OPTIONS.length);
    assert.ok(rows[0].description.includes('Current default'),
      `the current default must be marked, got: ${rows[0].description}`);
    for (let index = 1; index < rows.length; index++) {
      const option = TYPESCRIPT_IMPORT_OPTIONS[index];
      assert.strictEqual(rows[index].description, option.tag ?? option.description,
        `row ${index} must keep its verbatim tag`);
    }
    await picker.cancel();
  });

  it('[general.md §10.2] selecting a different style toasts the saved value and moves the checkmark', async function () {
    await stagePair();
    await new Workbench().executeCommand('Auto Import: Set Default Import Style');
    let picker = await InputBox.create();
    await picker.selectQuickPick(1); // style 1 — the default-import shape
    await findNotification(`Auto Import: Default style saved — ${TYPESCRIPT_IMPORT_OPTIONS[1].description}`);

    await new Workbench().executeCommand('Auto Import: Set Default Import Style');
    picker = await InputBox.create();
    const rows = await snapshotQuickPicks(picker);
    assert.ok(rows[0].description.includes('Current default'),
      `the checkmark must move to the new default, got: ${rows[0].description}`);
    assert.ok(!rows[0].label.includes('import {'),
      `the first row must now be the default-import shape, got: ${rows[0].label}`);
    await picker.cancel();
  });

  // Persistence to the profile settings is verified by §10.2 (reopening the picker reads the setting
  // back and shows the moved checkmark) and headlessly in src/test/config/settings.test.ts. The
  // ExTester SettingsEditor page object is unreliable on this VS Code build, so no Settings-UI read
  // is asserted here.

  it('[general.md §10.4/§10.5] Escape is silent and the command never inserts', async function () {
    await stagePair();
    await new Workbench().executeCommand('Auto Import: Set Default Import Style');
    const picker = await InputBox.create();
    await picker.cancel();
    await expectNoNotification('Default style saved');
    // Set Default persists a setting; it must never write an import into the editor.
    const destinationAfter = await openFixture('destination.ts');
    assert.ok(!(await destinationAfter.getText()).includes("from './Widget'"),
      'Set Default must never insert an import');
  });
});
