import * as assert from 'assert';

import { deriveImportName, deriveComponentName } from '../../path/import-name';

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

describe('path/deriveComponentName', () => {
  describe('PascalCase derivation', () => {
    const cases: Array<[ string, string ]> = [
      [ 'my-button.vue', 'MyButton' ],        // kebab — the headline case
      [ 'my_button.svelte', 'MyButton' ],     // snake
      [ 'button.spec.vue', 'ButtonSpec' ],    // dotted (interior segment kept)
      [ 'nav-bar.astro', 'NavBar' ],
      [ 'BaseCard.vue', 'BaseCard' ],         // already PascalCase → idempotent
      [ 'App.vue', 'App' ],
      [ 'Widget.svelte', 'Widget' ],
      [ 'base--button.vue', 'BaseButton' ],   // separator run collapses
      [ 'spaced name.astro', 'SpacedName' ],  // whitespace splits
      [ 'my.2nd.thing.vue', 'My2ndThing' ],
      [ 'x.vue', 'X' ],
    ];
    for (const [ input, expected ] of cases) {
      it(`${input} → ${expected}`, () => {
        assert.strictEqual(deriveComponentName(input), expected);
      });
    }
  });

  describe('differs from deriveImportName only in first-segment case', () => {
    it('PascalCases the first segment where deriveImportName preserves it', () => {
      assert.strictEqual(deriveComponentName('my-button.vue'), 'MyButton');
      assert.strictEqual(deriveImportName('my-button.vue'), 'myButton');
    });
    it('leaves an already-PascalCase name identical on both', () => {
      assert.strictEqual(deriveComponentName('BaseCard.vue'), 'BaseCard');
      assert.strictEqual(deriveImportName('BaseCard.vue'), 'BaseCard');
    });
  });

  describe('basename invariance (full path === bare basename)', () => {
    it('derives from the basename only', () => {
      assert.strictEqual(deriveComponentName('./components/my-button.vue'), 'MyButton');
      assert.strictEqual(deriveComponentName('../../ui/nav-bar.astro'), 'NavBar');
    });
  });

  describe('null when no legal identifier can be formed', () => {
    const nullCases = [
      '2fa-widget.vue',   // leading digit
      '404.svelte',       // leading digit
      'café-menu.vue',    // non-ASCII (conservative ASCII identifier rule)
      '--.astro',         // only separators → no segments
      '   .vue',          // only whitespace → no segments
    ];
    for (const input of nullCases) {
      it(`${input} → null`, () => {
        assert.strictEqual(deriveComponentName(input), null);
      });
    }
  });
});
