import * as assert from 'assert';

import { executeResetImportStyles, restoreImportStyles } from '../../commands/reset-import-styles';
import { getAutoImportSetting, setAutoImportSetting, inspectAutoImportSetting } from '../../config/settings';

// Mirrors config/settings.test.ts: drives the REAL VS Code config store (no Sinon). A reset removes
// the Global override so getAutoImportSetting falls back to the package.json default; restore re-writes
// the captured value. The Undo *click* on the toast is a manual-QA boundary, but restoreImportStyles
// is exported and exercised directly here.
describe('commands/reset-import-styles', () => {
  const SENTINEL = 'reset-sentinel-value';

  // Clear every style this suite may touch so a Global override never leaks into the rest of the run.
  afterEach(async () => {
    await Promise.all([
      setAutoImportSetting('script', 'javascript', undefined),
      setAutoImportSetting('script', 'typescript', undefined),
      setAutoImportSetting('stylesheet', 'css', undefined),
      setAutoImportSetting('stylesheet', 'scss', undefined),
      setAutoImportSetting('markup', 'htmlScript', undefined),
      setAutoImportSetting('markup', 'htmlImage', undefined),
      setAutoImportSetting('markup', 'htmlVideo', undefined),
      setAutoImportSetting('markup', 'htmlAudio', undefined),
      setAutoImportSetting('markup', 'markdownImage', undefined),
      setAutoImportSetting('latex', 'graphics', undefined),
      setAutoImportSetting('latex', 'input', undefined),
      setAutoImportSetting('latex', 'bibliography', undefined),
    ]);
  });

  it('resets customized styles by removing their Global override', async () => {
    await setAutoImportSetting('script', 'javascript', SENTINEL);
    await setAutoImportSetting('markup', 'htmlImage', SENTINEL);

    await executeResetImportStyles();

    assert.strictEqual(
      inspectAutoImportSetting('script', 'javascript')?.globalValue,
      undefined,
      'javascript override should have been removed',
    );
    assert.strictEqual(
      inspectAutoImportSetting('markup', 'htmlImage')?.globalValue,
      undefined,
      'htmlImage override should have been removed',
    );

    // get() now falls back to the declared default — a non-empty string that is not the sentinel.
    const jsDefault = getAutoImportSetting<string>('script', 'javascript');
    assert.ok(
      typeof jsDefault === 'string' && jsDefault.length > 0 && jsDefault !== SENTINEL,
      `expected the package.json default, got ${String(jsDefault)}`,
    );
  });

  // The LaTeX style settings (latex.graphics/input/bibliography) joined RESETTABLE_STYLES — a reset
  // must clear them too, or "Reset All Import Styles" would silently skip the LaTeX destination.
  it('resets a customized LaTeX style (latex.graphics is in RESETTABLE_STYLES)', async () => {
    await setAutoImportSetting('latex', 'graphics', SENTINEL);

    await executeResetImportStyles();

    assert.strictEqual(
      inspectAutoImportSetting('latex', 'graphics')?.globalValue,
      undefined,
      'latex.graphics override should have been removed',
    );
  });

  it('resets a customized LaTeX style (latex.input is in RESETTABLE_STYLES)', async () => {
    await setAutoImportSetting('latex', 'input', SENTINEL);

    await executeResetImportStyles();

    assert.strictEqual(
      inspectAutoImportSetting('latex', 'input')?.globalValue,
      undefined,
      'latex.input override should have been removed',
    );
  });

  it('resets a customized LaTeX style (latex.bibliography is in RESETTABLE_STYLES)', async () => {
    await setAutoImportSetting('latex', 'bibliography', SENTINEL);

    await executeResetImportStyles();

    assert.strictEqual(
      inspectAutoImportSetting('latex', 'bibliography')?.globalValue,
      undefined,
      'latex.bibliography override should have been removed',
    );
  });

  it('is a no-op (resolves without throwing) when no style is customized', async () => {
    // afterEach has cleared overrides → nothing to reset. Should resolve quietly and change nothing.
    await executeResetImportStyles();
    assert.strictEqual(inspectAutoImportSetting('script', 'javascript')?.globalValue, undefined);
  });

  it('restoreImportStyles re-applies a captured snapshot', async () => {
    await restoreImportStyles([{ namespace: 'script', key: 'javascript', priorValue: SENTINEL }]);
    assert.strictEqual(getAutoImportSetting('script', 'javascript'), SENTINEL);
  });

  it('reset then restore round-trips a customized value', async () => {
    await setAutoImportSetting('stylesheet', 'scss', SENTINEL);
    const priorValue = inspectAutoImportSetting<string>('stylesheet', 'scss')?.globalValue;
    assert.strictEqual(priorValue, SENTINEL);

    await executeResetImportStyles();
    assert.strictEqual(inspectAutoImportSetting('stylesheet', 'scss')?.globalValue, undefined);

    await restoreImportStyles([{ namespace: 'stylesheet', key: 'scss', priorValue: priorValue! }]);
    assert.strictEqual(getAutoImportSetting('stylesheet', 'scss'), SENTINEL);
  });
});
