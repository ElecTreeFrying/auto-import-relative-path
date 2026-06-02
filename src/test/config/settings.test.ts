import * as assert from 'assert';

import { getAutoImportSetting, setAutoImportSetting } from '../../config/settings';

// settings.ts is a thin wrapper over vscode.workspace.getConfiguration, but it carries one real
// invariant worth pinning: the read and write paths must resolve the SAME backing property through
// the AUTO_IMPORT_CONFIG alias map. A write via setAutoImportSetting must therefore be observable via
// getAutoImportSetting for the same (namespace, key). The byte-exact package.json sync is already
// covered by snippets/styles.test.ts; this is the get/set plumbing only.
describe('config/settings', () => {
  // VS Code stores a programmatic Global update verbatim, so a sentinel proves the round-trip without
  // depending on the exact enum strings (those are owned by styles.test.ts).
  const SENTINEL = 'roundtrip-sentinel-value';

  afterEach(async () => {
    // Clear the override so this run doesn't leak Global config into the rest of the suite.
    await setAutoImportSetting('script', 'javascript', undefined);
  });

  it('a setAutoImportSetting write is observable via getAutoImportSetting', async () => {
    await setAutoImportSetting('script', 'javascript', SENTINEL);
    assert.strictEqual(getAutoImportSetting('script', 'javascript'), SENTINEL);
  });

  it('getAutoImportSetting returns the package.json default when no override is set', () => {
    // afterEach has cleared any override → get resolves the declared default, not undefined.
    const value = getAutoImportSetting('script', 'javascript');
    assert.ok(
      typeof value === 'string' && value.length > 0,
      `expected a non-empty default string, got ${String(value)}`,
    );
  });
});

// Only ('script','javascript') was round-tripped above; the alias map has four namespaces and a wrong
// path in any of them silently reads/writes the wrong backing setting. One round-trip per other namespace.
describe('config/settings — namespace alias coverage', () => {
  const SENTINEL = 'ns-roundtrip-sentinel';

  it('round-trips (preferences, placement) through the alias map', async () => {
    await setAutoImportSetting('preferences', 'placement', SENTINEL);
    assert.strictEqual(getAutoImportSetting('preferences', 'placement'), SENTINEL);
    await setAutoImportSetting('preferences', 'placement', undefined);
  });

  it('round-trips (stylesheet, css) through the alias map', async () => {
    await setAutoImportSetting('stylesheet', 'css', SENTINEL);
    assert.strictEqual(getAutoImportSetting('stylesheet', 'css'), SENTINEL);
    await setAutoImportSetting('stylesheet', 'css', undefined);
  });

  it('round-trips (markup, htmlScript) through the alias map', async () => {
    await setAutoImportSetting('markup', 'htmlScript', SENTINEL);
    assert.strictEqual(getAutoImportSetting('markup', 'htmlScript'), SENTINEL);
    await setAutoImportSetting('markup', 'htmlScript', undefined);
  });
});
