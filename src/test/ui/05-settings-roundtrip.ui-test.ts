import * as assert from 'assert';
import { Key, TextEditor, Workbench } from 'vscode-extension-tester';

import {
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  findNotification,
  openFixture,
  pollEditorContains,
  sendChord,
} from './_helpers';

/** Copies Widget.ts (editor-focused chord) and opens destination.ts. */
async function stagePair(): Promise<TextEditor> {
  await openFixture('Widget.ts');
  await sendChord(Key.META, Key.SHIFT, 'a');
  return openFixture('destination.ts');
}

// The Toggle Preserve command's effect on the very next paste, exercised end-to-end through the real
// command + a real paste. (The ExTester SettingsEditor page object is unreliable on this VS Code
// build; the Settings-UI widget round-trip is instead covered headlessly in
// src/test/config/settings.test.ts + src/test/qa/settings-commands.test.ts. This spec proves the
// command wiring changes paste behavior live.) Each test reads the resulting toast to learn the new
// On/Off state and asserts the paste matches it, so it is robust to the starting state.
describe('[general.md §12.4/§11.3] Toggle Preserve — command flips paste behavior live', function () {
  before(async function () {
    await ensureWorkspaceOpen();
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  async function toggleAndReadState(): Promise<boolean> {
    await new Workbench().executeCommand('Auto Import: Toggle Preserve Script File Extension');
    const notification = await findNotification('Auto Import: Preserve script file extension —');
    const message = await notification.getMessage();
    return message.includes('On');
  }

  it('[general.md §12.4] toggling preserve makes the next paste keep/strip .ts to match the toast', async function () {
    const isOn = await toggleAndReadState();
    const destination = await stagePair();
    await sendChord(Key.META, 'i');
    if (isOn) {
      await pollEditorContains(destination, "from './Widget.ts';");
    } else {
      const text = await pollEditorContains(destination, "from './Widget';");
      assert.ok(!text.includes("./Widget.ts"), `Off must strip the extension, got: ${text}`);
    }
  });

  it('[general.md §11.3] toggling again flips the state and the next paste flips with it', async function () {
    const isOn = await toggleAndReadState();
    const destination = await stagePair();
    await sendChord(Key.META, 'i');
    if (isOn) {
      await pollEditorContains(destination, "from './Widget.ts';");
    } else {
      const text = await pollEditorContains(destination, "from './Widget';");
      assert.ok(!text.includes("./Widget.ts"), `Off must strip the extension, got: ${text}`);
    }
  });
});
