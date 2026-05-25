# src/test/manual-qa-workspace/CLAUDE.md

~174 fixture files opened as a folder in the Extension Development Host by a human walking `../manual-qa/`. Never compiled, never linted, never imported by Mocha — every code path *into* this directory is a user pressing **F5**, not the build.

## DO NOT scan this tree wholesale

The parent `src/test/CLAUDE.md` already lists this directory under "Sibling directories — DO NOT read into" because the tree is large, static, and yields no signal you can't get from this file or the sibling `README.md`. Repeating the rule locally so it applies even when you arrive here directly:

- **Never** `find`, `grep`, or `ls -R` across the workspace. The ~174 files are placeholders — there is no needle in this haystack.
- If a task names a specific fixture, `Edit` or `Write` precisely that file. Don't survey the surrounding tree first.
- If a task asks "where is X covered?", read the sibling `README.md` only. Its `Layout`, `Coverage matrix`, and `Maintenance notes` sections are the index.
- If a task asks "if I touch *this code*, which fixtures regression-test it?", read the `Fixture roles` table below.

## Excluded from every toolchain surface

| Surface | Where the exclusion lives | What it means |
|---------|---------------------------|---------------|
| TypeScript compilation (`tsc -p .`) | `tsconfig.json:18` — `"exclude": ["src/test/manual-qa-workspace/**"]` | Fixtures may import from uninstalled packages, reference undeclared globals, or be syntactically invalid. |
| ESLint (`npm run lint`) | `eslint.config.mjs:4` — `ignores: ["src/test/manual-qa-workspace/**"]` | Fixtures are not held to project style rules. |
| Mocha test runner (`npm test`) | `.vscode-test.mjs` glob `out/test/**/*.test.js` (implicit — fixtures are never emitted to `out/`) | The test runner cannot pick up anything inside this directory, even by accident. |

**Don't lift any of these.** Removing an exclusion makes the toolchain trip over deliberately-broken fixtures (e.g. `empty-file.ts`, `whitespace-only.ts`, the `unsupported/` rejection samples). The exclusions are what make those fixtures legal.

This directory must remain a *folder of files*, not a sub-project. **Don't** add a `package.json`, `tsconfig.json`, `.eslintrc`, or `.vscode/` inside it — any of those would re-attach the toolchain and break the invariant above.

## Fixture roles → code paths they exercise

This table is the unique value of this `CLAUDE.md` versus the sibling `README.md`. The README answers "where do I find a fixture for X?"; this one answers "if I touch *this code*, which fixture group regression-tests it?".

| Fixture group | Code site it exercises |
|---------------|------------------------|
| `src/components/*.{component,module,directive,pipe,service}.ts` | `src/snippets/languages/typescript.ts:generateAngularLegacyImportName` — Angular PascalCase substitution at style index 0 only |
| `styles/_*.scss`, `styles/_partials/_nested.scss`, `styles/components/_*.scss` | `src/snippets/languages/scss.ts:normalizePartialFilename` — leading-`_` strip on the *last* path segment |
| `with-imports.ts`, `with-requires.js`, `styles/with-imports.css`, `styles/with-uses.scss`, `pages/with-resources.html` | `src/editor/insert-snippet.ts:IMPORT_INDICATORS` — Bottom-placement landing across all 9 markers |
| `unsupported/{Main.java, styles.less, texture.bmp, render.avi, archive.zip}` | `src/commands/paste-import.ts` 11-clause gating conjunction; `texture.bmp` additionally hits the JSX/TSX/MDX `_react.ts:default:` branch |
| `empty-file.ts`, `whitespace-only.ts`, `single-char.ts`, `comments-only.ts` | Degenerate-document destinations; `comments-only.ts` specifically verifies that comment lines containing `import ` are correctly skipped by Bottom-placement (landing at line 0, not after the comment) |
| `my files/spaced.ts`, `unicode-paths/{日本語.ts, café-menu.tsx}` | `src/path/relative.ts:computeRelative` — non-ASCII + space-containing path computation |
| `deeply/nested/components/widgets/*`, `very-deep/level-01/.../level-09/extreme-leaf.ts` | `src/path/relative.ts` — multi-level `../` traversal (4 and 9 levels) |
| `src/legacy/*.js`, `src/lib/*.js`, `src/sibling.js`, `src/other.js` | JavaScript export-shape coverage for `src/snippets/languages/javascript.ts` (CommonJS `module.exports`, `exports.x`, IIFE, ES-module `export class`, `var require`/`const require`) |
| `src/types/*.ts`, `src/lib/*.ts`, `src/server/*.ts`, `src/models/*.ts` | TypeScript export-shape coverage for `src/snippets/languages/typescript.ts` (`interface`, `type`, `enum`, `const enum`, `namespace`, abstract class, default class/function, barrel re-export) |
| `src/components/*.{jsx,tsx}` | React-component shape coverage for `src/snippets/_react.ts:buildReactImport` (function component, class component, HOC, forwardRef, generic, memoized, default export) |
| `src/App.vue`, `src/App.svelte`, `src/App.astro` | `src/snippets/languages/framework-component.ts:buildSnippet` — Vue/Svelte/Astro destinations delegating to `buildTypeScriptImportSnippet` |
| `assets/{logo.png, icon.gif, photo.jpeg, photo.jpg, thumb.webp, icon.svg, banner.avif, font.woff2, regular.ttf}`, `assets/{images,icons,fonts}/*` | `IMAGE_FILE_EXTENSIONS` + font-extension paths through `src/snippets/_react.ts` and the non-script branches of `src/snippets/languages/{html,css,scss,markdown}.ts` |
| `assets/media/{clip.mp4, demo.webm, animation.mov, song.mp3, effect.ogg, voice.wav, track.m4a, captions.vtt}` | `MEDIA_FILE_EXTENSIONS` + `TEXT_TRACK_FILE_EXTENSIONS` paths through `src/snippets/_react.ts` (url import), `src/snippets/languages/html.ts` (video/audio/text-track tags), and `src/path/import-type.ts:determineImportType` |
| `data/{config.json, config.yaml, locale.yml, *.json, *.yaml}` | JSON/YAML branches in `src/snippets/_react.ts:buildReactImport`'s hardcoded non-script `switch` |
| `data/document.pdf` | `.pdf` branch in `src/snippets/_react.ts:buildReactImport` → `import ${1:name} from '<path>';` |
| `docs/example.mdx` | `.mdx` destination in `src/snippets/dispatch.ts` → falls through to `tsx.buildSnippet()` (identical semantics) |

When refactoring any of the code sites above, run the matching manual-QA checklist under `../manual-qa/` over the fixtures listed here before shipping.

## Baseline filenames are immutable

The ~37-name baseline list in `README.md:Maintenance notes` is referenced by every checklist in `../manual-qa/` (`01-sanity-and-keybindings.md` through `18-style-pickers.md`). Renaming a baseline produces a *silent* test break: the checklist will instruct the tester to copy a file that no longer exists at the named path, and nothing in the toolchain will warn.

**Workflow when a baseline must change:**

1. Rename / remove the file inside this workspace.
2. Update its entry in `README.md:Maintenance notes`.
3. Grep `../manual-qa/` for every reference to the old name and update each checklist.

Realistic-sibling fixtures (e.g., `api-client.ts`, the `Button.tsx` family, `_mixins.scss`, `data/feature-flags.json`) are *not* on the baseline list and are free to rename — they exist for ad-hoc exploratory QA only and are never quoted by a checklist.

## Binary files are zero-byte placeholders

Images (`.png` / `.jpg` / `.jpeg` / `.gif` / `.webp` / `.svg`) and fonts (`.woff` / `.woff2` / `.ttf` / `.eot`) hold zero bytes by design. The extension only reads the file extension (via `path.parse(...).ext` consumed inside `src/editor/file-path-info.ts`) — it never opens binary content. **Don't replace placeholders with real binaries:** the repo gets heavier for no behaviour change, and the diff noise hides the actual signal in future commits.

## Adding a new fixture

1. **Baseline fixture** (will be quoted by a checklist): add the file → append its name to `README.md:Maintenance notes` → reference it from the relevant `../manual-qa/NN-*.md`.
2. **Realistic sibling** (ad-hoc exploratory QA only, not quoted by any checklist): just add the file. No doc updates needed.
3. **Fixture for a brand-new file extension** (one not already in `src/types/file-extension.ts`): the three-site sync described in `src/types/CLAUDE.md` applies first — gating tables (`src/constants/extensions.ts`), destination dispatch (`src/snippets/dispatch.ts`), and the type union (`src/types/file-extension.ts`) must accept the new extension *before* any fixture is meaningful. Otherwise the fixture exists but the snippet builders silently fall through to their `default:` branch and the QA tester sees empty output.
4. Never add a `package.json`, `tsconfig.json`, `.eslintrc`, or `.vscode/` inside this directory — see "Excluded from every toolchain surface" above.
