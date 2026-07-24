import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { buildImportSnippet } from '../../snippets/dispatch';
import { buildImportSnippetVariants } from '../../snippets/variants';
import { getFilePathInfo } from '../../editor/file-path-info';
import {
  IMAGE_FILE_EXTENSIONS,
  MEDIA_FILE_EXTENSIONS,
  TEXT_TRACK_FILE_EXTENSIONS,
  STYLESHEET_FILE_EXTENSIONS,
} from '../../constants/extensions';

const FIXTURE_ROOT = path.resolve(__dirname, '../../../src/test/fixtures');

// JSX/TSX/MDX route their source-extension handling through TWO independently-maintained switches
// that types/CLAUDE.md (four-site sync, site 3) mandates stay synchronized:
//   - snippets/_react.ts:buildReactImport          (default paste flow, via dispatch.buildImportSnippet)
//   - snippets/variants.ts:buildReactNonScriptVariant (picker flow, via buildImportSnippetVariants)
// Before this file the picker-side copy was exercised by a single extension (.png, count only) and
// nothing asserted the two agreed — a drift would silently emit different imports for cmd+i vs the
// style picker. These tests pin both shapes and assert parity across every non-script source, using
// only the public dispatch/variants surface (no production export needed).
const REACT_DESTS = [
  { destExt: '.jsx', fixture: 'src/badge.jsx' },
  { destExt: '.tsx', fixture: 'src/widget.tsx' },
  { destExt: '.mdx', fixture: 'docs/example.mdx' },
];

// Non-script sources only. Script sources (.js/.jsx/.ts/.tsx) legitimately diverge between the two
// flows — dispatch returns the single config-default snippet, variants returns the full styled list —
// so they are out of scope here. The duplicated switch only governs non-script sources.
//
// The name-import group splits three ways by how the binding is derived from the source basename:
//   - plain assets (image/data/doc) → camelCase pre-fill (`${1:asset}`), via deriveImportName
//   - framework SFCs (.vue/.svelte/.astro) → PascalCase pre-fill (`${1:Asset}`), via deriveComponentName
//   - Markdown/MDX (.md/.mdx) → the generic `${1:name}` — their PascalCase-as-Astro-component naming
//                               is outside the shipped framework-SFC pathway's scope.
const PLAIN_NAME_SOURCES = [
  ...IMAGE_FILE_EXTENSIONS,
  '.json', '.html', '.yml', '.yaml', '.pdf',
];
const PASCAL_COMPONENT_SOURCES = [ '.vue', '.svelte', '.astro' ];
const COMPONENT_NAME_SOURCES = [ '.md', '.mdx' ];
const NAME_SOURCES = [ ...PLAIN_NAME_SOURCES, ...PASCAL_COMPONENT_SOURCES, ...COMPONENT_NAME_SOURCES ];
const URL_SOURCES = [
  ...MEDIA_FILE_EXTENSIONS,
  ...TEXT_TRACK_FILE_EXTENSIONS,
];
const SIDE_EFFECT_SOURCES = [
  '.woff', '.woff2', '.ttf', '.eot',
  ...STYLESHEET_FILE_EXTENSIONS,
];
const ALL_NON_SCRIPT_SOURCES = [ ...NAME_SOURCES, ...URL_SOURCES, ...SIDE_EFFECT_SOURCES ];

async function openDest(fixture: string): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(FIXTURE_ROOT, fixture)));
  await vscode.window.showTextDocument(doc);
}

// Points the clipboard at a sibling source named `asset<ext>` (same directory as the open
// destination, so computeRelative yields a deterministic './asset') and returns both builders'
// output for that source. The source file need not exist — this path is pure path math.
async function buildBoth(fixture: string, sourceBasename: string): Promise<{ dispatch: string; variant: string }> {
  await vscode.env.clipboard.writeText(path.join(FIXTURE_ROOT, path.dirname(fixture), sourceBasename));
  const info = await getFilePathInfo();
  const dispatch = (await buildImportSnippet(info)).value;
  const variants = await buildImportSnippetVariants(info);
  return { dispatch, variant: variants[0]?.snippetText ?? '' };
}

describe('react source-switch parity (_react.ts ↔ variants.ts)', () => {
  afterEach(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  for (const { destExt, fixture } of REACT_DESTS) {
    describe(`destination ${destExt}`, () => {
      it('parity: dispatch and variants agree for every non-script source', async () => {
        await openDest(fixture);
        for (const ext of ALL_NON_SCRIPT_SOURCES) {
          const { dispatch, variant } = await buildBoth(fixture, `asset${ext}`);
          assert.strictEqual(
            dispatch,
            variant,
            `parity drift for ${ext} into ${destExt}: dispatch="${dispatch}" variant="${variant}"`,
          );
        }
      });

      it('characterization: plain-asset name sources pre-fill the binding from the basename', async () => {
        await openDest(fixture);
        for (const ext of PLAIN_NAME_SOURCES) {
          const { dispatch } = await buildBoth(fixture, `asset${ext}`);
          assert.strictEqual(dispatch, `import \${1:asset} from './asset${ext}';`, `${ext} into ${destExt}`);
        }
      });

      it('characterization: framework SFC sources pre-fill the binding with a PascalCase component name', async () => {
        await openDest(fixture);
        for (const ext of PASCAL_COMPONENT_SOURCES) {
          const { dispatch } = await buildBoth(fixture, `asset${ext}`);
          assert.strictEqual(dispatch, `import \${1:Asset} from './asset${ext}';`, `${ext} into ${destExt}`);
        }
      });

      it('characterization: Markdown/MDX name sources keep the generic name binding', async () => {
        await openDest(fixture);
        for (const ext of COMPONENT_NAME_SOURCES) {
          const { dispatch } = await buildBoth(fixture, `asset${ext}`);
          assert.strictEqual(dispatch, `import \${1:name} from './asset${ext}';`, `${ext} into ${destExt}`);
        }
      });

      it('characterization: url-group sources (media + text-track) pre-fill the binding from the basename', async () => {
        await openDest(fixture);
        for (const ext of URL_SOURCES) {
          const { dispatch } = await buildBoth(fixture, `asset${ext}`);
          assert.strictEqual(dispatch, `import \${1:asset} from './asset${ext}';`, `${ext} into ${destExt}`);
        }
      });

      // A basename that can't form a legal identifier (leading digit) falls back to the generic
      // placeholder — `${1:name}` for the name/SFC groups, `${1:url}` for the url group.
      it('characterization: an illegal-identifier basename falls back to the generic placeholder', async () => {
        await openDest(fixture);
        const nameFallback = await buildBoth(fixture, '404.png');
        assert.strictEqual(nameFallback.dispatch, "import ${1:name} from './404.png';", `404.png into ${destExt}`);
        const sfcFallback = await buildBoth(fixture, '2fa-widget.vue');
        assert.strictEqual(sfcFallback.dispatch, "import ${1:name} from './2fa-widget.vue';", `2fa-widget.vue into ${destExt}`);
        const urlFallback = await buildBoth(fixture, '123.mp4');
        assert.strictEqual(urlFallback.dispatch, "import ${1:url} from './123.mp4';", `123.mp4 into ${destExt}`);
      });

      it('characterization: side-effect-group sources (fonts + stylesheets) produce a bare import', async () => {
        await openDest(fixture);
        for (const ext of SIDE_EFFECT_SOURCES) {
          const { dispatch } = await buildBoth(fixture, `asset${ext}`);
          assert.strictEqual(dispatch, `import './asset${ext}';`, `${ext} into ${destExt}`);
        }
      });

      it('CSS module sources produce a styles import on both flows', async () => {
        await openDest(fixture);
        for (const name of [ 'asset.module.css', 'asset.module.scss' ]) {
          const { dispatch, variant } = await buildBoth(fixture, name);
          const expected = `import \${1:styles} from './${name}';`;
          assert.strictEqual(dispatch, expected, `dispatch ${name} into ${destExt}`);
          assert.strictEqual(variant, expected, `variant ${name} into ${destExt}`);
        }
      });

      // LaTeX sources (.tex/.bib/.eps) pass the accept-all gate into JSX/TSX/MDX but have no branch in
      // buildAssetImportStatement → default:null → empty snippet on BOTH flows (buildReactNonScriptVariant
      // returns null, so variants is []). This is the documented LaTeX-into-React quirk whose gating-reject
      // fix is deferred (import-statement-design). Pin it so that deferred fix can't change it silently.
      it('LaTeX sources (.tex/.bib/.eps) produce an empty snippet on both flows (no _react asset branch)', async () => {
        await openDest(fixture);
        for (const ext of [ '.tex', '.bib', '.eps' ]) {
          const { dispatch, variant } = await buildBoth(fixture, `asset${ext}`);
          assert.strictEqual(dispatch, '', `dispatch ${ext} into ${destExt} should be empty`);
          assert.strictEqual(variant, '', `variant ${ext} into ${destExt} should be empty`);
        }
      });
    });
  }
});
