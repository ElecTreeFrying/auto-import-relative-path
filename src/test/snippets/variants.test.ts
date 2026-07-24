import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildImportSnippetVariants } from '../../snippets/variants';
import { getFilePathInfo } from '../../editor/file-path-info';
import { resolveStyleIndex, JAVASCRIPT_IMPORT_OPTIONS } from '../../snippets/_styles';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

async function openAndQuery(destFixture: string, sourceName: string, insideStyleBlock = false) {
  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.file(path.join(FIXTURE_ROOT, destFixture))
  );
  await vscode.window.showTextDocument(doc);
  await vscode.env.clipboard.writeText(
    path.join(FIXTURE_ROOT, path.dirname(destFixture), sourceName)
  );
  const info = await getFilePathInfo();
  return buildImportSnippetVariants(info, insideStyleBlock);
}

async function closeEditor(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

describe('buildImportSnippetVariants', () => {
  afterEach(async () => {
    await closeEditor();
  });

  it('.js into .js: 7 styled variants', async () => {
    const variants = await openAndQuery('with-requires.js', 'src/bar.js');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.ts into .ts: 7 styled variants', async () => {
    const variants = await openAndQuery('src/foo.ts', 'bar.ts');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  // Framework-component sources into .ts/.js are a single hardcoded (fixed-shape) variant: the
  // style picker inserts it directly, and Set Default reports it as fixed-style (setting undefined).
  it('.vue into .ts: 1 hardcoded component variant (no style setting)', async () => {
    const variants = await openAndQuery('src/foo.ts', 'App.vue');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined);
    assert.strictEqual(variants[0].snippetText, "import ${1:App} from './App.vue';");
  });

  it('.astro into .ts: 1 hardcoded component variant', async () => {
    const variants = await openAndQuery('src/foo.ts', 'App.astro');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].snippetText, "import ${1:App} from './App.astro';");
  });

  it('.svelte into .js: 1 hardcoded component variant (no style setting)', async () => {
    const variants = await openAndQuery('src/sibling.js', 'Widget.svelte');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined);
    assert.strictEqual(variants[0].snippetText, "import ${1:Widget} from './Widget.svelte';");
  });

  it('.css into .css: 2 styled variants', async () => {
    const variants = await openAndQuery('styles/reset.css', 'global.css');
    assert.strictEqual(variants.length, 2);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.scss into .scss: 5 styled variants', async () => {
    const variants = await openAndQuery('styles/tokens.scss', 'secondary.scss');
    assert.strictEqual(variants.length, 5);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.js into .html: 5 styled variants (script)', async () => {
    const variants = await openAndQuery('pages/index.html', 'app.js');
    assert.strictEqual(variants.length, 5);
    assert.ok(variants[0].setting, 'styled variant should have setting');
    assert.strictEqual(variants[0].setting.namespace, 'markup');
    assert.strictEqual(variants[0].setting.key, 'htmlScript');
  });

  it('.png into .html: 3 styled variants (image)', async () => {
    const variants = await openAndQuery('pages/index.html', 'logo.png');
    assert.strictEqual(variants.length, 3);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.mp4 into .html: 4 styled variants (video)', async () => {
    const variants = await openAndQuery('pages/index.html', 'clip.mp4');
    assert.strictEqual(variants.length, 4);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.mp3 into .html: 2 styled variants (audio)', async () => {
    const variants = await openAndQuery('pages/index.html', 'track.mp3');
    assert.strictEqual(variants.length, 2);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('.css into .html: 1 hardcoded variant (stylesheet)', async () => {
    const variants = await openAndQuery('pages/index.html', 'styles.css');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'hardcoded variant should omit setting');
  });

  it('.md into .md: 1 hardcoded variant (link)', async () => {
    const variants = await openAndQuery('docs/guide.md', 'architecture.md');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'hardcoded variant should omit setting');
  });

  it('.png into .md: 3 styled variants (markdown image)', async () => {
    const variants = await openAndQuery('docs/guide.md', 'logo.png');
    assert.strictEqual(variants.length, 3);
    assert.ok(variants[0].setting, 'styled variant should have setting');
  });

  it('extensionless source into .md: 1 hardcoded link variant (no setting)', async () => {
    const variants = await openAndQuery('docs/guide.md', '../LICENSE');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'link variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, '[${1:text}](../LICENSE)');
  });

  it('.ts into .tsx: 7 styled variants (TS)', async () => {
    const variants = await openAndQuery('unicode-paths/café-menu.tsx', 'widget.ts');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
    assert.strictEqual(variants[0].setting.key, 'typescript');
  });

  it('.png into .jsx: 1 hardcoded variant', async () => {
    const variants = await openAndQuery('src/badge.jsx', 'logo.png');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'hardcoded variant should omit setting');
  });

  it('.ts into .vue: 7 styled variants (TS)', async () => {
    const variants = await openAndQuery('src/App.vue', 'bar.ts');
    assert.strictEqual(variants.length, 7);
    assert.ok(variants[0].setting, 'styled variant should have setting');
    assert.strictEqual(variants[0].setting.key, 'typescript');
  });

  // Non-script sources into framework destinations are a single hardcoded asset variant
  // (not the styled TS catalogue), mirroring the React (.jsx/.tsx/.mdx) picker behavior.
  it('.png into .vue: 1 hardcoded name-import variant (basename-derived binding)', async () => {
    const variants = await openAndQuery('src/App.vue', 'logo.png');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'asset variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "import ${1:logo} from './logo.png';");
  });

  it('.mp4 into .svelte: 1 hardcoded url-import variant (basename-derived binding)', async () => {
    const variants = await openAndQuery('src/App.svelte', 'clip.mp4');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'asset variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "import ${1:clip} from './clip.mp4';");
  });

  it('.svg into .astro: 1 hardcoded name-import variant (basename-derived binding)', async () => {
    const variants = await openAndQuery('src/App.astro', 'icon.svg');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'asset variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "import ${1:icon} from './icon.svg';");
  });

  // Markdown/MDX into a framework destination is a single hardcoded name-import variant kept on the
  // generic `name` binding (the PascalCase pathway is SFC-only) — mirrors the .md/.mdx React picker path.
  it('.md into .vue: 1 hardcoded name-import variant (generic binding)', async () => {
    const variants = await openAndQuery('src/App.vue', 'intro.md');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'asset variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "import ${1:name} from './intro.md';");
  });

  it('.mdx into .svelte: 1 hardcoded name-import variant (generic binding)', async () => {
    const variants = await openAndQuery('src/App.svelte', 'post.mdx');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'asset variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "import ${1:name} from './post.mdx';");
  });

  // A framework SFC source into a framework destination is a single hardcoded variant whose binding
  // is the PascalCase component name (deriveComponentName), through the same asset switch — this pins
  // the pick-style picker path for the SFC-naming feature (dispatch parity is covered in react.test.ts).
  it('.vue into .vue: 1 hardcoded PascalCase component variant', async () => {
    const variants = await openAndQuery('src/App.vue', 'my-button.vue');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'asset variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "import ${1:MyButton} from './my-button.vue';");
  });

  it('.svelte into .astro (cross-framework): 1 hardcoded PascalCase component variant', async () => {
    const variants = await openAndQuery('src/App.astro', 'my-card.svelte');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].snippetText, "import ${1:MyCard} from './my-card.svelte';");
  });

  it('.vue into .vue with an illegal-identifier basename falls back to the generic name', async () => {
    const variants = await openAndQuery('src/App.vue', '2fa-widget.vue');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].snippetText, "import ${1:name} from './2fa-widget.vue';");
  });

  it('.json into .json: empty variant set (isEmptyVariantSet backstop, same-ext non-dispatch)', async () => {
    const variants = await openAndQuery('data/config.json', 'feature-flags.json');
    assert.deepStrictEqual(variants, []);
  });

  it('.js into .js: each styled variant setting.value round-trips via resolveStyleIndex', async () => {
    const variants = await openAndQuery('with-requires.js', 'src/bar.js');
    // setting.value is the ImportStyle.description string; resolveStyleIndex must recover the
    // numeric index for every one, covering the whole table exactly once (the persist/read contract
    // used by set-default-import-style.ts).
    const resolved = variants.map(v => resolveStyleIndex(JAVASCRIPT_IMPORT_OPTIONS, v.setting!.value));
    assert.ok(resolved.every(index => index !== undefined), 'every setting.value must resolve to an index');
    assert.deepStrictEqual([ ...resolved ].sort((a, b) => a! - b!), [ 0, 1, 2, 3, 4, 5, 6 ]);
  });

  // renderLabel strips snippet placeholders so the picker shows human text, not `${1:name}` / `$1`.
  it('.js into .js: labels render without raw snippet placeholders', async () => {
    const variants = await openAndQuery('with-requires.js', 'src/bar.js');
    for (const v of variants) {
      assert.ok(!v.label.includes('$'), `label should have no snippet syntax: "${v.label}"`);
    }
    assert.ok(variants[0].label.includes('bar'), `expected the source basename in the label, got "${variants[0].label}"`);
  });

  // The picker preview shows the detected exported class name at index 0 (TS class detection).
  it('.ts into .ts: the index-0 label shows the detected exported class name', async () => {
    const variants = await openAndQuery('src/foo.ts', 'components/app-root.component.ts');
    assert.ok(
      variants[0].label.includes('AppRootComponent'),
      `expected detected class name in label, got "${variants[0].label}"`,
    );
    assert.ok(!variants[0].label.includes('$'), 'label should not contain raw snippet placeholders');
  });

  // Image-into-stylesheet is a single hardcoded url() variant — assert the exact payload, not just count.
  it('.png into .css: one hardcoded url() variant with the exact snippet', async () => {
    const variants = await openAndQuery('styles/reset.css', 'logo.png');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'image variant is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "url('./logo.png')");
  });

  it('.png into .scss: reuses the CSS image url() snippet', async () => {
    const variants = await openAndQuery('styles/main.scss', 'logo.png');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].snippetText, "url('./logo.png')");
  });

  // SCSS partial normalization through the variant path: a leading-underscore source loses the `_`.
  it('.scss into .scss: a leading-underscore partial source is normalized in the variant path', async () => {
    const variants = await openAndQuery('styles/tokens.scss', '_mypartial.scss');
    assert.ok(variants.length >= 1);
    assert.ok(
      variants[0].snippetText.includes('mypartial') && !variants[0].snippetText.includes('_mypartial'),
      `expected the leading underscore stripped, got "${variants[0].snippetText}"`,
    );
  });

  // Every framework-component variant carries the typescript setting (not just variants[0]).
  it('.ts into .vue: all 7 variants carry the typescript setting', async () => {
    const variants = await openAndQuery('src/App.vue', 'bar.ts');
    assert.strictEqual(variants.length, 7);
    for (const v of variants) {
      assert.ok(v.setting, 'every framework variant should carry a setting');
      assert.strictEqual(v.setting!.namespace, 'script');
      assert.strictEqual(v.setting!.key, 'typescript');
    }
  });

  // Stylesheet source into a framework <style> block (insideStyleBlock = true): the CSS/SCSS style
  // pickers, carrying the shared `stylesheet` settings (Set Default persists cssImportStyle /
  // scssImportStyle — the same knobs the plain .css/.scss destinations use). Without style context
  // the same source is one fixed side-effect variant (no setting).
  it('.css into a .vue <style> block: 2 CSS styled variants carrying the stylesheet/css setting', async () => {
    const variants = await openAndQuery('src/App.vue', 'theme.css', true);
    assert.strictEqual(variants.length, 2);
    for (const v of variants) {
      assert.ok(v.setting, 'style-block CSS variant should carry a setting');
      assert.strictEqual(v.setting!.namespace, 'stylesheet');
      assert.strictEqual(v.setting!.key, 'css');
    }
  });

  it('.scss into a .svelte <style> block: 5 SCSS styled variants carrying the stylesheet/scss setting', async () => {
    const variants = await openAndQuery('src/App.svelte', 'base.scss', true);
    assert.strictEqual(variants.length, 5);
    for (const v of variants) {
      assert.ok(v.setting, 'style-block SCSS variant should carry a setting');
      assert.strictEqual(v.setting!.namespace, 'stylesheet');
      assert.strictEqual(v.setting!.key, 'scss');
    }
  });

  it('.css into a .astro <style> block: CSS styled variants (all three SFC destinations share the branch)', async () => {
    const variants = await openAndQuery('src/App.astro', 'theme.css', true);
    assert.strictEqual(variants.length, 2);
    assert.strictEqual(variants[0].setting!.key, 'css');
  });

  it('.css into .vue WITHOUT style context: 1 fixed side-effect variant (no setting)', async () => {
    const variants = await openAndQuery('src/App.vue', 'theme.css');
    assert.strictEqual(variants.length, 1);
    assert.strictEqual(variants[0].setting, undefined, 'the script-block stylesheet import is hardcoded (no setting)');
    assert.strictEqual(variants[0].snippetText, "import './theme.css';");
  });
});
