import * as assert from 'assert';

import { deriveImportName } from '../../path/import-name';

describe('path/deriveImportName', () => {
  describe('camelCase derivation', () => {
    const cases: Array<[ string, string ]> = [
      [ 'logo.svg', 'logo' ],
      [ 'my-logo.v2.svg', 'myLogoV2' ],
      [ 'intro-video.mp4', 'introVideo' ],
      [ 'my_snake_case.json', 'mySnakeCase' ],
      [ 'app-root.component.ts', 'appRootComponent' ],
      [ 'spaced name.png', 'spacedName' ],
      [ 'MyButton.png', 'MyButton' ],       // leading case preserved (already PascalCase)
      [ 'App.jsx', 'App' ],                 // component filename keeps its case (not lowercased to 'app')
      [ 'my.2nd.thing.png', 'my2ndThing' ],
      [ 'bar', 'bar' ],
    ];
    for (const [ input, expected ] of cases) {
      it(`${input} → ${expected}`, () => {
        assert.strictEqual(deriveImportName(input), expected);
      });
    }
  });

  describe('basename invariance (full path === bare basename)', () => {
    it('derives from the basename only', () => {
      assert.strictEqual(deriveImportName('./assets/images/logo.png'), 'logo');
      assert.strictEqual(deriveImportName('../../a/b/my-widget.png'), 'myWidget');
      assert.strictEqual(deriveImportName('./src/bar.ts'), 'bar');
    });
  });

  describe('null when no legal identifier can be formed', () => {
    const nullCases = [
      '404.png',        // leading digit
      '2cool.svg',      // leading digit
      'café-menu.png',  // non-ASCII (conservative ASCII identifier rule)
      '日本語.png',       // non-ASCII
      '--.png',         // only separators → no segments
      '   .png',        // only whitespace → no segments
    ];
    for (const input of nullCases) {
      it(`${input} → null`, () => {
        assert.strictEqual(deriveImportName(input), null);
      });
    }
  });

  describe('extension handling', () => {
    it('strips a preserved script extension so it never folds into the identifier', () => {
      assert.strictEqual(deriveImportName('app-root.component.tsx'), 'appRootComponent');
      assert.strictEqual(deriveImportName('logo.png'), 'logo');
    });

    it('treats a leading-dot name as extensionless (Node semantics)', () => {
      // path.extname('.env') === '' — the whole name is the basename, not an extension.
      assert.strictEqual(deriveImportName('.env'), 'env');
    });
  });
});
