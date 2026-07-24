import * as assert from 'assert';

import {
  altDFromExplorer,
  copyMultiFromExplorer,
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  expandExplorerFolder,
  findNotification,
  openFixture,
  pollEditorContains,
} from './_helpers';

describe('[general.md §13.1/§13.2/§13.4] Explorer multi-select gestures', function () {
  before(async function () {
    await ensureWorkspaceOpen();
    await expandExplorerFolder('multi');
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  it('[general.md §13.1] two files — Copied 2 paths — alpha.ts, beta.ts', async function () {
    await copyMultiFromExplorer(['alpha.ts', 'beta.ts']);
    await findNotification('Auto Import: Copied 2 paths — alpha.ts, beta.ts');
  });

  it('[general.md §13.2] five files elide after three basenames — +2 more', async function () {
    await copyMultiFromExplorer(['alpha.ts', 'beta.ts', 'extra-one.ts', 'extra-two.ts', 'gamma.ts']);
    await findNotification('Auto Import: Copied 5 paths — alpha.ts, beta.ts, extra-one.ts, +2 more');
  });

  it('[general.md §13.4] Alt+D with a two-file selection inserts the stacked block', async function () {
    await openFixture('destination.ts');
    await altDFromExplorer(['alpha.ts', 'beta.ts']);
    const destination = await openFixture('destination.ts'); // re-focus after the Explorer gesture
    const text = await pollEditorContains(destination, "from './multi/alpha';");
    assert.ok(text.includes("from './multi/beta';"), `both members must land, got: ${text}`);
    assert.ok(text.indexOf('./multi/alpha') < text.indexOf('./multi/beta'),
      'the stack must keep selection order');
  });
});
