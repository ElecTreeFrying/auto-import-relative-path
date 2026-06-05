import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

// These tests read source text rather than runtime values: the labels are inline string
// literals (not exported constants), and the contract is a byte-exact match between the two
// sites — showInformationMessage resolves with the literal clicked label, so any drift
// silently no-ops.
const NOTIFICATION_SRC = fs.readFileSync(
  path.resolve(__dirname, '../../../src/editor/notification.ts'),
  'utf-8',
);
const COPY_FILE_PATH_SRC = fs.readFileSync(
  path.resolve(__dirname, '../../../src/commands/copy-file-path.ts'),
  'utf-8',
);

/** Returns the single-quoted string literals inside a `case '<type>':` block of notification.ts. */
function actionLabelsInCase(caseLabel: string): string[] {
  const marker = `case '${caseLabel}':`;
  const start = NOTIFICATION_SRC.indexOf(marker);
  assert.notStrictEqual(start, -1, `notification.ts missing ${marker}`);
  const rest = NOTIFICATION_SRC.slice(start + marker.length);
  const nextCase = rest.indexOf('case ');
  const block = nextCase === -1 ? rest : rest.slice(0, nextCase);
  return [...block.matchAll(/'([^']+)'/g)].map(match => match[1]);
}

describe('editor/notification — button-label byte-equality', () => {
  it("copy-success action labels are exactly 'Paste with Style' then 'Paste Now'", () => {
    assert.deepStrictEqual(actionLabelsInCase('copy-success'), [ 'Paste with Style', 'Paste Now' ]);
  });

  it('copy-file-path.ts handles each copy-success action label as a switch case', () => {
    for (const label of actionLabelsInCase('copy-success')) {
      assert.ok(
        COPY_FILE_PATH_SRC.includes(`case '${label}':`),
        `copy-file-path.ts is missing a switch case for '${label}'`,
      );
    }
  });
});

describe('editor/notification — self-handler', () => {
  it("not-supported's action button label matches its own click-handler comparison", () => {
    const labels = actionLabelsInCase('not-supported');
    assert.strictEqual(labels.length, 2, "expected 'View Supported Files' as button arg + handler comparison");
    assert.strictEqual(labels[0], 'View Supported Files');
    assert.strictEqual(labels[1], labels[0], 'button label and handler comparison must be byte-identical');
  });
});
