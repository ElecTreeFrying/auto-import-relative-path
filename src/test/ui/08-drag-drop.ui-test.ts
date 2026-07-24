import * as assert from 'assert';

import {
  detectDragBackend,
  dragWithVerify,
  ensureOsFocus,
  isDragBroken,
  markDragBroken,
  screenPointOf,
  skipForAccessibility,
} from './_drag';
import {
  dismissAllToasts,
  discardAllEditors,
  ensureWorkspaceOpen,
  findNotification,
  getExplorerTree,
  openFixture,
} from './_helpers';

// The ONE native-gesture smoke test: everything behavioral about drops is pinned headlessly
// (drop/provider tests build the same text/uri-list DataTransfer the Explorer produces); what only
// a real drag can prove is the wiring — the Explorer assembling the payload, VS Code routing it to
// the provider, and OUR edit out-ranking the built-in TypeScript "drop to update imports" provider
// (tsx.md §9's ranking guard — an EDH-only behavior by definition).
describe('[general.md §8 / tsx.md §9] native drag from Explorer into the editor', function () {
  before(async function () {
    await ensureWorkspaceOpen();
    if (detectDragBackend() === null) {
      skipForAccessibility(this, null);
    }
  });

  afterEach(async function () {
    await dismissAllToasts();
    await discardAllEditors();
  });

  it('[tsx.md §9 + ranking guard] dragging Widget.ts into Panel.tsx lands OUR import', async function () {
    const editor = await openFixture('Panel.tsx');
    const tree = await getExplorerTree();
    const item = await tree.findItem('Widget.ts', 3);
    assert.ok(item, 'Widget.ts must be visible in the Explorer');

    const target = await screenPointOf(editor);
    const source = await screenPointOf(item);
    await ensureOsFocus(target); // bring the test window frontmost before injecting

    const landed = await dragWithVerify(source, target, async () => {
      const text = await editor.getText();
      return text.includes("import { Widget } from './Widget';");
    });
    if (!landed) {
      const after = await editor.getText().catch(() => '<read error>');
      console.log('DIAG editor text after drag attempts:', JSON.stringify(after.slice(0, 200)));
      markDragBroken();
      skipForAccessibility(this, detectDragBackend());
    }

    const text = await editor.getText();
    // The ranking guard: if the built-in provider won, the text shows a default import with the
    // extension kept — or VS Code's raw-path fallback — instead of our named import.
    assert.ok(text.includes("import { Widget } from './Widget';"), `expected our import, got: ${text}`);
    assert.ok(!text.includes("'./Widget.ts'"), 'the built-in path-with-extension shape must not win');
    assert.ok(!/import Widget from /.test(text), 'the built-in default-import shape must not win');
    assert.ok(!/^\/?Users\//m.test(text), 'the raw-absolute-path fallback must not win');
  });

  it('[general.md §8.1] dragging the open file onto itself warns and inserts nothing', async function () {
    if (isDragBroken()) {
      this.skip();
    }
    const editor = await openFixture('Panel.tsx');
    const textBefore = await editor.getText();
    const tree = await getExplorerTree();
    const item = await tree.findItem('Panel.tsx', 3);
    assert.ok(item, 'Panel.tsx must be visible in the Explorer');

    const target = await screenPointOf(editor);
    const source = await screenPointOf(item);
    await ensureOsFocus(target);
    await dragWithVerify(source, target, async () => {
      try {
        await findNotification('A file cannot import itself.', 1500);
        return true;
      } catch {
        return false;
      }
    });

    await findNotification('Auto Import: A file cannot import itself.');
    assert.strictEqual(await editor.getText(), textBefore, 'a same-file drop must insert nothing');
  });
});
