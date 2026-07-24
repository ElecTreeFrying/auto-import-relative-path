import * as assert from 'assert';
import { InputBox, Key } from 'vscode-extension-tester';

import {
  clickNotificationAction,
  copyFromExplorer,
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  findNotification,
  notificationActionTitles,
  openFixture,
  pollEditorContains,
  sendChord,
} from './_helpers';

describe('[general.md §5.1/§5.12/§5.13/§5.4] copy-success toast + action buttons', function () {
  before(async function () {
    await ensureWorkspaceOpen();
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  it('[general.md §5.1] toast message and both buttons render', async function () {
    await copyFromExplorer('source.ts');
    const notification = await findNotification('Auto Import: Copied path — source.ts');
    const titles = await notificationActionTitles(notification);
    assert.ok(titles.includes('Paste with Style'), `expected the Paste with Style button, saw: ${JSON.stringify(titles)}`);
    assert.ok(titles.includes('Paste Now'), `expected the Paste Now button, saw: ${JSON.stringify(titles)}`);
  });

  it('[general.md §5.13] Paste Now inserts into the active editor', async function () {
    const destination = await openFixture('destination.ts');
    await copyFromExplorer('source.ts');
    const notification = await findNotification('Copied path — source.ts');
    await clickNotificationAction(notification, 'Paste Now');
    await pollEditorContains(destination, "from './source';");
  });

  it('[general.md §5.12] Paste with Style opens the style QuickPick', async function () {
    await openFixture('destination.ts');
    await copyFromExplorer('Widget.ts');
    const notification = await findNotification('Copied path — Widget.ts');
    await clickNotificationAction(notification, 'Paste with Style');
    const picker = await InputBox.create();
    assert.strictEqual(await picker.getPlaceHolder(), 'Select an import style');
    await picker.cancel();
  });

  it('[general.md §5.4/§5.11] unsupported-pair toast carries View Supported Files (presence only — never clicked)', async function () {
    const destination = await openFixture('destination.ts');
    await copyFromExplorer('unsupported.js');
    await findNotification('Copied path — unsupported.js');
    await destination.click(); // Cmd+I requires editorTextFocus
    await sendChord(Key.META, 'i');
    const notification = await findNotification('Auto Import: Cannot import .js into .ts files.');
    const titles = await notificationActionTitles(notification);
    assert.ok(titles.includes('View Supported Files'),
      `expected the View Supported Files button, saw: ${JSON.stringify(titles)}`);
    await notification.dismiss();
  });
});
