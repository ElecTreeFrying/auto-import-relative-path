import * as assert from 'assert';
import * as vscode from 'vscode';

import { executeResetImportStyles } from '../../commands/reset-import-styles';
import { executeSetImportPlacement } from '../../commands/set-import-placement';
import { executeTogglePreserveScriptExtension } from '../../commands/toggle-preserve-script-extension';
import { inspectAutoImportSetting, setAutoImportSetting } from '../../config/settings';

/** The QuickPick item shape `set-import-placement.ts` builds (label + $(check) marker + detail). */
interface CapturedPlacementItem extends vscode.QuickPickItem {
  value: string;
}

/** Yields long enough for `.then(...)`-chained toast handlers (the Undo restore) to settle. */
function drainTimers(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 10));
}

/** Polls until the condition holds (the Undo restore runs in an un-awaited `.then` chain). */
async function pollUntil(condition: () => boolean, deadlineMs = 2000): Promise<boolean> {
  const deadline = Date.now() + deadlineMs;
  while (Date.now() < deadline) {
    if (condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  return condition();
}

// The settings commands had registration-smoke coverage only (extension.test.ts). These tests close
// general.md §12.1–12.7 headlessly by stubbing the picker/toast seams the way review-prompt.test.ts
// stubs showInformationMessage — save/replace/restore, no Sinon.
describe('general.md §12 — settings commands', () => {
  let infoMessages: string[] = [];
  let capturedItems: CapturedPlacementItem[] = [];
  let capturedOptions: vscode.QuickPickOptions | undefined;
  let quickPickResult: ((items: CapturedPlacementItem[]) => CapturedPlacementItem | undefined) | undefined;
  let toastAction: string | undefined;
  let originalShowInformationMessage: typeof vscode.window.showInformationMessage;
  let originalShowQuickPick: typeof vscode.window.showQuickPick;

  beforeEach(() => {
    infoMessages = [];
    capturedItems = [];
    capturedOptions = undefined;
    quickPickResult = undefined;
    toastAction = undefined;
    originalShowInformationMessage = vscode.window.showInformationMessage;
    originalShowQuickPick = vscode.window.showQuickPick;
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = (message: string) => {
      infoMessages.push(message);
      return Promise.resolve(toastAction); // `undefined` models a dismissal; 'Undo' models the button click
    };
    (vscode.window as { showQuickPick: unknown }).showQuickPick = (
      items: CapturedPlacementItem[],
      options?: vscode.QuickPickOptions,
    ) => {
      capturedItems = items;
      capturedOptions = options;
      return Promise.resolve(quickPickResult ? quickPickResult(items) : undefined);
    };
  });

  afterEach(async () => {
    await drainTimers();
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = originalShowInformationMessage;
    (vscode.window as { showQuickPick: unknown }).showQuickPick = originalShowQuickPick;
    await Promise.all([
      setAutoImportSetting('preferences', 'placement', undefined),
      setAutoImportSetting('script', 'preserve', undefined),
      setAutoImportSetting('script', 'typescript', undefined),
      setAutoImportSetting('stylesheet', 'css', undefined),
    ]);
  });

  describe('[general.md §12.1] Set Import Placement — QuickPick contract', () => {
    it('§12.1 — placeholder is Set import placement', async () => {
      await executeSetImportPlacement();
      assert.strictEqual(capturedOptions?.placeHolder, 'Set import placement');
    });

    it('§12.1 — items are Top / Bottom / Cursor, each carrying a detail line', async () => {
      await executeSetImportPlacement();
      const labels = capturedItems.map(item => item.label).sort();
      assert.deepStrictEqual(labels, ['Bottom', 'Cursor', 'Top']);
      for (const item of capturedItems) {
        assert.ok((item.detail ?? '').length > 0, `${item.label} must carry a detail line`);
      }
      const cursor = capturedItems.find(item => item.label === 'Cursor');
      assert.strictEqual(cursor?.detail, 'Insert at the current cursor position.');
    });

    it('§12.1 — the current value (default Bottom) is marked $(check) Current and listed first', async () => {
      await executeSetImportPlacement();
      assert.strictEqual(capturedItems[0].label, 'Bottom', 'the current default must be spliced to position 0');
      assert.strictEqual(capturedItems[0].description, '$(check) Current');
      for (const item of capturedItems.slice(1)) {
        assert.strictEqual(item.description, undefined, `${item.label} must carry no marker`);
      }
    });
  });

  describe('[general.md §12.2] Set Import Placement — persist + toast + marker moves', () => {
    it('§12.2 — picking Top writes the Global override and toasts the saved placement', async () => {
      quickPickResult = items => items.find(item => item.label === 'Top');
      await executeSetImportPlacement();
      assert.strictEqual(inspectAutoImportSetting<string>('preferences', 'placement')?.globalValue, 'Top');
      assert.ok(infoMessages.includes('Auto Import: Import placement saved — Top'),
        `got: ${JSON.stringify(infoMessages)}`);
    });

    it('§12.2 — reopening lists Top first with the $(check) Current marker', async () => {
      quickPickResult = items => items.find(item => item.label === 'Top');
      await executeSetImportPlacement();
      quickPickResult = undefined; // second open: Escape
      await executeSetImportPlacement();
      assert.strictEqual(capturedItems[0].label, 'Top');
      assert.strictEqual(capturedItems[0].description, '$(check) Current');
    });
  });

  describe('[general.md §12.3] Set Import Placement — Escape path', () => {
    it('§12.3 — an undefined pick writes no setting and fires no toast', async () => {
      quickPickResult = undefined;
      await executeSetImportPlacement();
      assert.strictEqual(inspectAutoImportSetting<string>('preferences', 'placement')?.globalValue, undefined);
      assert.deepStrictEqual(infoMessages, []);
    });
  });

  describe('[general.md §12.4] Toggle Preserve Script File Extension', () => {
    it('§12.4 — first run writes true and toasts On; second run writes false and toasts Off', async () => {
      await executeTogglePreserveScriptExtension();
      assert.strictEqual(inspectAutoImportSetting<boolean>('script', 'preserve')?.globalValue, true);
      assert.ok(infoMessages.includes('Auto Import: Preserve script file extension — On'),
        `got: ${JSON.stringify(infoMessages)}`);

      await executeTogglePreserveScriptExtension();
      assert.strictEqual(inspectAutoImportSetting<boolean>('script', 'preserve')?.globalValue, false);
      assert.ok(infoMessages.includes('Auto Import: Preserve script file extension — Off'),
        `got: ${JSON.stringify(infoMessages)}`);
    });
  });

  describe('[general.md §12.5–12.7] Reset All Import Styles — toast wording + Undo dispatch', () => {
    it('§12.5 — no overrides: Auto Import: No custom import styles to reset.', async () => {
      // First run flushes any override a prior suite may have leaked; the second run is the assert.
      await executeResetImportStyles();
      await drainTimers();
      infoMessages = [];
      await executeResetImportStyles();
      assert.ok(infoMessages.includes('Auto Import: No custom import styles to reset.'),
        `got: ${JSON.stringify(infoMessages)}`);
    });

    it('§12.6 — one override: singular Reset 1 import style to defaults, override cleared', async () => {
      await setAutoImportSetting('script', 'typescript', "import name from '_relativePath_';");
      await executeResetImportStyles();
      assert.ok(infoMessages.includes('Auto Import: Reset 1 import style to defaults'),
        `got: ${JSON.stringify(infoMessages)}`);
      assert.strictEqual(inspectAutoImportSetting<string>('script', 'typescript')?.globalValue, undefined,
        'the override must be cleared back to the package.json default');
    });

    it('§12.6 — two overrides: plural Reset 2 import styles to defaults', async () => {
      await setAutoImportSetting('script', 'typescript', "import name from '_relativePath_';");
      await setAutoImportSetting('stylesheet', 'css', "@import url('_relativePath_');");
      await executeResetImportStyles();
      assert.ok(infoMessages.includes('Auto Import: Reset 2 import styles to defaults'),
        `got: ${JSON.stringify(infoMessages)}`);
    });

    it('§12.7 — an Undo click restores the prior value and toasts Import styles restored.', async () => {
      const priorValue = "import name from '_relativePath_';";
      await setAutoImportSetting('script', 'typescript', priorValue);
      toastAction = 'Undo'; // the stubbed styles-reset toast resolves with the clicked button label
      await executeResetImportStyles();
      // The restore runs in an un-awaited .then chain and its config writes are async — poll.
      const restored = await pollUntil(() =>
        inspectAutoImportSetting<string>('script', 'typescript')?.globalValue === priorValue
        && infoMessages.includes('Auto Import: Import styles restored.'));
      assert.strictEqual(restored, true,
        `Undo must re-write the prior value and toast the restore; value: ${inspectAutoImportSetting<string>('script', 'typescript')?.globalValue}, toasts: ${JSON.stringify(infoMessages)}`);
    });
  });
});
