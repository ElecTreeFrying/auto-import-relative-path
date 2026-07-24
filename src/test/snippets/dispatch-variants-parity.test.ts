import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

// Four-site extension sync (site 3 ↔ site 4): dispatch.ts:buildImportSnippet (default paste flow) and
// variants.ts:buildImportSnippetVariants (pick-style flow) each switch on destinationFileExt. If a new
// destination is added to one switch but forgotten in the other, paste works while the style picker
// silently has nothing — or vice versa. Nothing asserted the two switches stay in lockstep. This reads
// both sources (the notification.test.ts precedent for source-as-contract checks) and pins set-equality
// of the destination case labels. It only inspects the FIRST switch in each file — the one on
// destinationFileExt — stopping at its `default:` so variants.ts's later source-extension switch is
// out of scope.
const SNIPPETS_DIR = path.resolve(__dirname, '../../../src/snippets');

function destinationCases(source: string, switchAnchor: string): Set<string> {
  const start = source.indexOf(switchAnchor);
  assert.notStrictEqual(start, -1, `could not find "${switchAnchor}" — did the switch get renamed?`);
  const end = source.indexOf('default:', start);
  assert.notStrictEqual(end, -1, 'expected a default: arm after the destination switch');
  const region = source.slice(start, end);
  return new Set([ ...region.matchAll(/case '(\.[a-z]+)':/g) ].map(m => m[1]));
}

describe('dispatch ↔ variants destination parity (four-site sync guard)', () => {
  it('buildImportSnippet and buildImportSnippetVariants switch on the same destination extensions', () => {
    const dispatchSrc = fs.readFileSync(path.join(SNIPPETS_DIR, 'dispatch.ts'), 'utf-8');
    const variantsSrc = fs.readFileSync(path.join(SNIPPETS_DIR, 'variants.ts'), 'utf-8');

    const dispatchDests = destinationCases(dispatchSrc, 'switch (info.destinationFileExt)');
    const variantsDests = destinationCases(variantsSrc, 'switch (destinationFileExt)');

    assert.ok(dispatchDests.size >= 10, `expected the full destination set, got ${dispatchDests.size}`);
    assert.deepStrictEqual(
      [ ...dispatchDests ].sort(),
      [ ...variantsDests ].sort(),
      'dispatch.ts and variants.ts must handle the same destination extensions',
    );
  });
});
