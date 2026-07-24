import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
  deinitReviewPromptForTest,
  getSuccessfulImportCount,
  initReviewPrompt,
  recordSuccessfulImport,
  resetReviewPromptState,
} from '../../editor/review-prompt';

const REVIEW_PROMPT_SRC = fs.readFileSync(
  path.resolve(__dirname, '../../../src/editor/review-prompt.ts'),
  'utf-8',
);
const NOTIFICATION_SRC = fs.readFileSync(
  path.resolve(__dirname, '../../../src/editor/notification.ts'),
  'utf-8',
);

/**
 * A `Memento` backed by a plain Map. The real `globalState` persists across windows, which a test
 * can neither seed nor clear; this substitutes the storage without stubbing the module under test.
 */
function fakeMemento(): vscode.Memento {
  const store = new Map<string, unknown>();
  return {
    keys: () => [...store.keys()],
    get: <T>(key: string, fallback?: T) => (store.has(key) ? store.get(key) as T : fallback),
    update: (key: string, value: unknown) => {
      if (value === undefined) {
        store.delete(key);
      } else {
        store.set(key, value);
      }
      return Promise.resolve();
    },
  };
}

/** Minimal `ExtensionContext` carrying only what `initReviewPrompt` reads. */
function fakeContext(id = 'ElecTreeFrying.auto-import'): vscode.ExtensionContext {
  return { globalState: fakeMemento(), extension: { id } } as unknown as vscode.ExtensionContext;
}

// The module keeps process-wide singleton state (the memento) and schedules the toast off a
// `setTimeout`. Both leak across tests unless contained: a threshold-crossing test would otherwise
// fire a real `showInformationMessage` into a *later* test that counts prompts. So the whole file
// runs under one harness — a stubbed toast, a drained timer queue after every test, and a de-init at
// the end that returns the module to inert so later-loading test files see no installed memento.
let promptsShown = 0;
let originalShowInformationMessage: typeof vscode.window.showInformationMessage;

/** Yields long enough for a `setTimeout(..., 0)`-scheduled toast to run, so nothing leaks forward. */
function drainTimers(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 5));
}

describe('editor/review-prompt', () => {
  beforeEach(async () => {
    promptsShown = 0;
    originalShowInformationMessage = vscode.window.showInformationMessage;
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = () => {
      promptsShown++;
      // Resolving undefined models a dismissal — the branch that must NOT re-arm the prompt.
      return Promise.resolve(undefined);
    };
    initReviewPrompt(fakeContext());
    await resetReviewPromptState();
  });

  afterEach(async () => {
    await drainTimers();
    (vscode.window as { showInformationMessage: unknown }).showInformationMessage = originalShowInformationMessage;
  });

  after(() => {
    // Leave the singleton uninitialised so import gestures in later-loading files stay inert.
    deinitReviewPromptForTest();
  });

  describe('counting', () => {
    it('starts at zero', () => {
      assert.strictEqual(getSuccessfulImportCount(), 0);
    });

    it('counts one per call, not per file', () => {
      recordSuccessfulImport();
      recordSuccessfulImport();
      recordSuccessfulImport();
      assert.strictEqual(getSuccessfulImportCount(), 3);
    });

    it('keeps counting past the prompt threshold', () => {
      for (let i = 0; i < 40; i++) {
        recordSuccessfulImport();
      }
      assert.strictEqual(getSuccessfulImportCount(), 40);
    });
  });

  describe('prompt gating', () => {
    it('fires no toast before the threshold', async () => {
      for (let i = 0; i < 24; i++) {
        recordSuccessfulImport();
      }
      await drainTimers();
      assert.strictEqual(promptsShown, 0, 'prompt fired before the 25th import');
    });

    it('fires exactly once at the threshold and never again', async () => {
      for (let i = 0; i < 120; i++) {
        recordSuccessfulImport();
      }
      await drainTimers();
      assert.strictEqual(promptsShown, 1, `expected a single prompt across 120 imports, saw ${promptsShown}`);
    });
  });
});

describe('editor/review-prompt — button-label byte-equality', () => {
  /** Single-quoted literals inside the `review-request` case of notification.ts. */
  function reviewActionLabels(): string[] {
    const marker = `case 'review-request':`;
    const start = NOTIFICATION_SRC.indexOf(marker);
    assert.notStrictEqual(start, -1, 'notification.ts missing the review-request case');
    const rest = NOTIFICATION_SRC.slice(start + marker.length);
    // Bound at the end of the showInformationMessage call rather than the next `case `: this is the
    // final case in the switch, so a case-delimited slice would run to end-of-file and sweep up
    // unrelated literals from the helpers below.
    const callEnd = rest.indexOf(');');
    assert.notStrictEqual(callEnd, -1, 'review-request case has no terminated call');
    const block = rest.slice(0, callEnd);
    return [...block.matchAll(/'([^']+)'/g)].map(match => match[1]);
  }

  it("review-request action labels are exactly 'Rate It', 'Not Now', 'Never Ask Again'", () => {
    assert.deepStrictEqual(reviewActionLabels(), [ 'Rate It', 'Not Now', 'Never Ask Again' ]);
  });

  it('review-prompt.ts dispatches on the two actionable labels as switch cases', () => {
    for (const label of [ 'Rate It', 'Not Now' ]) {
      assert.ok(
        REVIEW_PROMPT_SRC.includes(`case '${label}':`),
        `review-prompt.ts has no 'case ${label}:' — the label drifted from notification.ts`,
      );
    }
  });

  it('the opt-out label is handled by the default branch, not a case', () => {
    assert.ok(
      !REVIEW_PROMPT_SRC.includes(`case 'Never Ask Again':`),
      'Never Ask Again must fall through to default so a dismissal is treated identically',
    );
  });
});

describe('editor/review-prompt — marketplace URL', () => {
  it('builds the review URL from the runtime extension id, never a literal itemName', () => {
    // This module is mirrored into the sibling drag-import extension by a namespace-only sweep,
    // which would not rewrite a hardcoded itemName — sending its users to this listing.
    assert.ok(
      !/itemName=ElecTreeFrying\./.test(REVIEW_PROMPT_SRC),
      'review-prompt.ts hardcodes a publisher-qualified itemName; build it from context.extension.id',
    );
    assert.ok(
      REVIEW_PROMPT_SRC.includes('itemName=${extensionId}'),
      'review-prompt.ts should interpolate the runtime extension id into the review URL',
    );
  });
});
