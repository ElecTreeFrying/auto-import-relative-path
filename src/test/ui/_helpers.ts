import * as fs from 'fs';
import * as path from 'path';
import {
  ActivityBar,
  ComboSetting,
  DefaultTreeSection,
  EditorView,
  InputBox,
  Key,
  Notification,
  SettingsEditor,
  TextEditor,
  ViewItem,
  VSBrowser,
  Workbench,
} from 'vscode-extension-tester';

/** The git-tracked fixture source for the UI suite. */
const WORKSPACE_SOURCE = path.resolve(__dirname, '../../../src/test/ui-workspace');
/**
 * The staged copy the launched VS Code actually opens — a crashed run can never dirty git. Lives
 * under the ExTester storage dir, which sits at a SHORT /tmp path (must byte-match the `-s` flag in
 * package.json's qa:ui scripts): the repo path is deep enough that a storage dir inside it pushes
 * the Extension Host's unix-socket path past macOS's ~104-char limit and the instance dies at
 * launch — the same failure .vscode-test.mjs documents for the headless suite's user-data-dir.
 */
const WORKSPACE_STAGE = '/tmp/auto-import-extester/ui-workspace';

let workspaceOpened = false;

/** A plain `{label, description}` snapshot of a QuickPick row (resolved eagerly — stale-safe). */
export interface QuickPickSnapshot {
  label: string;
  description: string;
}

/**
 * Stages a fresh copy of the fixture tree and opens it as the workspace folder — once per process
 * (every spec file shares one VS Code instance; the folder open triggers a window reload).
 */
export async function ensureWorkspaceOpen(): Promise<string> {
  if (workspaceOpened) {
    await closeQuickOpen(); // clear any QuickPick a prior spec file left open before its `before` hook
    return WORKSPACE_STAGE;
  }
  fs.rmSync(WORKSPACE_STAGE, { recursive: true, force: true });
  fs.cpSync(WORKSPACE_SOURCE, WORKSPACE_STAGE, { recursive: true });
  await VSBrowser.instance.openResources(WORKSPACE_STAGE);
  await VSBrowser.instance.waitForWorkbench();
  await sleep(1000); // let the reloaded workbench settle before the first page-object query
  await dismissStartupOverlays();
  workspaceOpened = true;
  return WORKSPACE_STAGE;
}

/**
 * Kills the fresh-profile onboarding dialog. VS Code shows a "Welcome to Visual Studio Code"
 * `aria-modal` overlay (`.onboarding-a-overlay`) that sits ABOVE the workbench and intercepts every
 * click into the Explorer, notifications, and Settings editor — a QuickPick opens over it (so those
 * tests pass) but a tree click does not. `startupEditor: none` suppresses the Welcome *tab*, not
 * this overlay, so it is dismissed here: Escape, then a direct DOM removal as the reliable fallback.
 */
async function dismissStartupOverlays(): Promise<void> {
  // The first-run "Welcome to Visual Studio Code" SIGN-IN overlay (`.onboarding-a-overlay`, with
  // "Continue with GitHub / … / Continue without Signing In") resists Escape and cannot be
  // DOM-removed (that leaves VS Code believing a modal is open, blocking editor opens). Click its
  // real Close control (`.onboarding-a-close-btn`, aria-label "Close") so VS Code dismisses it
  // through its own path — that unblocks Explorer/notification/Settings clicks.
  await pressEscape();
  await sleep(250);
  try {
    await VSBrowser.instance.driver.executeScript(
      'var b = document.querySelector(\'.onboarding-a-overlay .onboarding-a-close-btn, .onboarding-a-overlay [aria-label="Close"]\'); if (b) { b.click(); }',
    );
  } catch {
    // no overlay this launch — nothing to close
  }
  await sleep(400);
}

/** Presses Escape via the driver — dismisses a modal/QuickPick without needing a focusable target. */
export async function pressEscape(): Promise<void> {
  try {
    await VSBrowser.instance.driver.actions().sendKeys(Key.ESCAPE).perform();
  } catch {
    // nothing focused — harmless
  }
}

/**
 * Opens a staged fixture file and returns its focused TextEditor. `openResources` returns before the
 * editor tab finishes rendering, so poll `getOpenEditorTitles` until the tab appears rather than
 * calling `openEditor` immediately (which races and throws "No editor with title …").
 */
export async function openFixture(relativePath: string): Promise<TextEditor> {
  const title = path.basename(relativePath);
  await VSBrowser.instance.openResources(path.join(WORKSPACE_STAGE, relativePath));
  const editorView = new EditorView();
  let lastError: unknown;
  // The launched instance can hold several editor groups (files land in a non-zero group), so search
  // EVERY group for the tab — `openEditor(title)` alone only looks in group 0 and misses it.
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const groups = await editorView.getEditorGroups();
      for (let g = 0; g < groups.length; g++) {
        if ((await groups[g].getOpenEditorTitles()).includes(title)) {
          const editor = (await editorView.openEditor(title, g)) as TextEditor;
          await editor.click(); // keyboard focus into the editor, not the Explorer
          return editor;
        }
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw new Error(`openFixture: could not locate '${title}' in any editor group: ${lastError}`);
}

/** Returns the Explorer tree section for the staged workspace folder. */
export async function getExplorerTree(): Promise<DefaultTreeSection> {
  const control = await new ActivityBar().getViewControl('Explorer');
  const view = await control?.openView();
  if (!view) {
    throw new Error('the Explorer view is unavailable');
  }
  const sections = await view.getContent().getSections();
  for (const section of sections) {
    const title = await section.getTitle();
    if (title.toLowerCase().includes('ui-workspace')) {
      return section as DefaultTreeSection;
    }
  }
  // Single-folder workspaces sometimes render one unnamed section — fall back to the first.
  return sections[0] as DefaultTreeSection;
}

/** Expands a folder row in the Explorer if it is not already expanded. */
export async function expandExplorerFolder(name: string): Promise<void> {
  const tree = await getExplorerTree();
  const folder = await tree.findItem(name);
  if (folder && !(await folder.isExpanded())) {
    await folder.click();
  }
}

/** Clicks (selects) an Explorer item by label, returning it. */
export async function selectExplorerItem(name: string): Promise<ViewItem> {
  const tree = await getExplorerTree();
  const item = await tree.findItem(name, 3);
  if (!item) {
    throw new Error(`Explorer item not found: ${name}`);
  }
  await item.click();
  return item;
}

/**
 * Multi-selects a CONTIGUOUS run of Explorer items. A held-Meta Selenium click does not register as
 * VS Code's multi-select modifier on this build (each click just replaced the selection), so extend
 * the selection with Shift+ArrowDown from the first item instead — the fixture `multi/` files are
 * adjacent in Explorer order, so `names` in order maps to a contiguous downward range. Click the
 * first item, then extend down (names.length - 1) times.
 */
export async function metaSelectExplorerItems(names: string[]): Promise<ViewItem> {
  const tree = await getExplorerTree();
  const first = await tree.findItem(names[0], 3);
  if (!first) {
    throw new Error(`Explorer item not found: ${names[0]}`);
  }
  await first.click();
  await sleep(150);
  for (let i = 1; i < names.length; i++) {
    await sendChord(Key.SHIFT, Key.ARROW_DOWN);
    await sleep(90);
  }
  return first;
}

/** Sends a key chord (e.g. `sendChord(Key.META, 'i')`) to the currently focused element. */
export async function sendChord(...keys: string[]): Promise<void> {
  const driver = VSBrowser.instance.driver;
  const active = await driver.switchTo().activeElement();
  await active.sendKeys(Key.chord(...keys));
}

/**
 * Copies a single Explorer file via Cmd+Shift+A. Clicking the row focuses the Explorer tree
 * container (a focusable element that satisfies `filesExplorerFocus`); the chord then goes to that
 * active element. A `monaco-list-row` is NOT itself keyboard-interactable, so the chord must target
 * the active element, not the row.
 */
export async function copyFromExplorer(name: string): Promise<void> {
  await selectExplorerItem(name);
  await sendChord(Key.META, Key.SHIFT, 'a');
}

/** Multi-selects Explorer files (Cmd-click) then copies the selection via Cmd+Shift+A. */
export async function copyMultiFromExplorer(names: string[]): Promise<void> {
  await metaSelectExplorerItems(names);
  await sendChord(Key.META, Key.SHIFT, 'a');
}

/** Selects Explorer file(s) then fires Alt+D (Insert Import from Selected File) on the selection. */
export async function altDFromExplorer(names: string[]): Promise<void> {
  if (names.length === 1) {
    await selectExplorerItem(names[0]);
  } else {
    await metaSelectExplorerItems(names);
  }
  await sendChord(Key.ALT, 'd');
}

/**
 * Dismisses any open QuickPick / command palette by pressing Escape. It must NOT use
 * `Workbench.executeCommand` — that *opens* the command palette and types the argument, which for a
 * non-palette command like `workbench.action.closeQuickOpen` matches nothing and leaves a stuck
 * palette open, blocking the next test's `openResources`/clicks. Escape is how a QuickInput closes.
 */
export async function closeQuickOpen(): Promise<void> {
  await pressEscape();
}

/** Reads a notification's action-button titles, with settle + retry (the buttons render lazily). */
export async function notificationActionTitles(notification: Notification): Promise<string[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await sleep(300);
      const actions = await notification.getActions();
      const titles: string[] = [];
      for (const action of actions) {
        titles.push(await action.getTitle());
      }
      return titles;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`could not read notification actions: ${lastError}`);
}

/** Clicks a notification action button, with a settle + one retry (buttons flake as not-interactable). */
export async function clickNotificationAction(notification: Notification, title: string): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await sleep(300);
      await notification.takeAction(title);
      return;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
    }
  }
}

/** Polls the notification toasts until one whose message contains `substring` appears. */
export async function findNotification(substring: string, timeoutMs = 10000): Promise<Notification> {
  const deadline = Date.now() + timeoutMs;
  let lastSeen: string[] = [];
  while (Date.now() < deadline) {
    try {
      const notifications = await new Workbench().getNotifications();
      lastSeen = [];
      for (const notification of notifications) {
        const message = await notification.getMessage();
        lastSeen.push(message);
        if (message.includes(substring)) {
          return notification;
        }
      }
    } catch {
      // stale element mid-render — retry on the next poll
    }
    await sleep(250);
  }
  throw new Error(`notification not found within ${timeoutMs}ms: "${substring}" — saw: ${JSON.stringify(lastSeen)}`);
}

/** Verifies no toast containing `substring` appears within the grace window. */
export async function expectNoNotification(substring: string, graceMs = 1500): Promise<void> {
  await sleep(graceMs);
  try {
    const notifications = await new Workbench().getNotifications();
    for (const notification of notifications) {
      const message = await notification.getMessage();
      if (message.includes(substring)) {
        throw new Error(`expected no toast containing "${substring}", found: "${message}"`);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('expected no toast')) {
      throw error;
    }
    // stale element — the center is churning, which itself means no stable matching toast
  }
}

/** Clears every toast (best-effort — the command is a no-op when none are showing). */
export async function dismissAllToasts(): Promise<void> {
  try {
    await new Workbench().executeCommand('Notifications: Clear All');
  } catch {
    // the command prompt can occasionally lose the race with a closing toast — harmless
  }
}

/**
 * Full inter-test reset: dismiss any stray QuickPick/palette (else it intercepts the next test's
 * clicks), then revert-and-close every editor so fixture buffers are never saved-mutated and a
 * lingering Settings tab can't block the next open.
 */
export async function discardAllEditors(): Promise<void> {
  await pressEscape(); // drop any modal/QuickPick that would intercept the cleanup commands
  await closeQuickOpen();
  const editorView = new EditorView();
  for (let round = 0; round < 12; round++) {
    let titles: string[];
    try {
      titles = await editorView.getOpenEditorTitles();
    } catch {
      return;
    }
    if (titles.length === 0) {
      return;
    }
    try {
      await new Workbench().executeCommand('Revert and Close Editor');
    } catch {
      try {
        await editorView.closeAllEditors();
      } catch {
        // a modal may still be up — the next test's closeQuickOpen will clear it
      }
      return;
    }
    await sleep(150);
  }
}

/**
 * Resolves every QuickPick row into a plain snapshot. NOTE: ExTester's `TextEditor.getText()` can
 * round-trip the system clipboard — never interleave editor reads between a copy gesture and the
 * paste/picker command that consumes it.
 */
export async function snapshotQuickPicks(input: InputBox): Promise<QuickPickSnapshot[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const picks = await input.getQuickPicks();
      const snapshots: QuickPickSnapshot[] = [];
      for (const pick of picks) {
        snapshots.push({
          label: await pick.getLabel(),
          description: (await pick.getDescription()) ?? '',
        });
      }
      return snapshots;
    } catch {
      await sleep(300); // stale row mid-filter — re-resolve once
    }
  }
  throw new Error('could not snapshot the QuickPick rows');
}

/** Polls the editor text until it contains `needle`; returns the final text. */
export async function pollEditorContains(editor: TextEditor, needle: string, timeoutMs = 10000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let text = '';
  while (Date.now() < deadline) {
    try {
      text = await editor.getText();
      if (text.includes(needle)) {
        return text;
      }
    } catch {
      // editor mid-update — retry
    }
    await sleep(250);
  }
  throw new Error(`editor text did not contain "${needle}" within ${timeoutMs}ms — got: ${text.slice(0, 300)}`);
}

/** Opens the Settings UI and returns the setting addressed by its full ID. */
export async function openSettingUI(settingId: string): Promise<{ settingsEditor: SettingsEditor; setting: ComboSetting }> {
  const settingsEditor = await new Workbench().openSettings();
  const setting = (await settingsEditor.findSettingByID(settingId)) as ComboSetting;
  return { settingsEditor, setting };
}

/** Closes the Settings editor tab (best-effort). */
export async function closeSettingsEditor(): Promise<void> {
  try {
    await new EditorView().closeEditor('Settings');
  } catch {
    // already closed
  }
}

/** Runs the reset command and waits for its confirmation toast, leaving styles at defaults. */
export async function resetStylesViaCommand(): Promise<void> {
  await new Workbench().executeCommand('Auto Import: Reset All Import Styles to Defaults');
  const notification = await findNotification('import style');
  await notification.dismiss().catch(() => undefined);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
