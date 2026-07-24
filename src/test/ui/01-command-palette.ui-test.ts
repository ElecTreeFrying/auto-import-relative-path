import * as assert from 'assert';
import { InputBox, Key, Workbench } from 'vscode-extension-tester';

import {
  altDFromExplorer,
  copyFromExplorer,
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  findNotification,
  openFixture,
  pollEditorContains,
  sendChord,
  snapshotQuickPicks,
} from './_helpers';

/** The eight contributed command titles (package.json `contributes.commands`). */
const COMMAND_TITLES = [
  'Auto Import: Paste as Import',
  'Auto Import: Copy File Path',
  'Auto Import: Insert Import from Selected File',
  'Auto Import: Paste as Import (Pick Style)',
  'Auto Import: Set Default Import Style',
  'Auto Import: Set Import Placement',
  'Auto Import: Toggle Preserve Script File Extension',
  'Auto Import: Reset All Import Styles to Defaults',
];

describe('[general.md §1/§5 smoke] command palette + keybindings', function () {
  before(async function () {
    await ensureWorkspaceOpen();
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  it('[palette] lists all 8 Auto Import commands by contributed title', async function () {
    const prompt = await new Workbench().openCommandPrompt();
    await prompt.setText('>Auto Import');
    const rows = await snapshotQuickPicks(prompt as InputBox);
    const labels = rows.map(row => row.label);
    for (const title of COMMAND_TITLES) {
      assert.ok(labels.some(label => label.includes(title)),
        `palette must list "${title}", saw: ${JSON.stringify(labels)}`);
    }
    await prompt.cancel();
  });

  it('[general.md §1.1] Cmd+Shift+A with an Explorer selection fires the copy-success toast', async function () {
    await copyFromExplorer('source.ts');
    await findNotification('Auto Import: Copied path — source.ts');
  });

  it('[general.md §5.1→paste] Cmd+I in the editor inserts the import', async function () {
    await openFixture('Widget.ts');
    await sendChord(Key.META, Key.SHIFT, 'a'); // editor-focused copy of the active file
    const destination = await openFixture('destination.ts');
    await sendChord(Key.META, 'i');
    await pollEditorContains(destination, "from './Widget';");
  });

  it('[general.md §4/§13.4 single] Alt+D with Explorer focus inserts into the active editor', async function () {
    await openFixture('destination.ts');
    await altDFromExplorer(['Widget.ts']);
    // Re-focus destination: the Explorer gesture can leave another editor active, and getText reads
    // the focused editor.
    const destination = await openFixture('destination.ts');
    await pollEditorContains(destination, "from './Widget';");
  });
});
