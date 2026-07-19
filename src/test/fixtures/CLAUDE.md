# src/test/fixtures/CLAUDE.md

Fixture files opened as documents by the **Mocha test suite** — every fixture-driven test under `src/test/` resolves its `FIXTURE_ROOT` here (only the referenced files are opened). Never compiled, never linted, never imported as modules; the only code path *into* this directory is a test calling `vscode.workspace.openTextDocument(...)`. The tree is deliberately independent of the top-level `qa/` tree.

## DO NOT scan this tree wholesale

The tree is large, static, and yields no signal you can't get from this file:

- **Never** `find`, `grep`, or `ls -R` across the workspace. The files in this tree are placeholders — there is no needle in this haystack.
- If a task names a specific fixture, `Edit` or `Write` precisely that file. Don't survey the surrounding tree first.
- If a task asks "where is X covered?", read the `Layout` and `Coverage matrix` sections below — they are the index.
- If a task asks "if I touch *this code*, which fixtures regression-test it?", read the `Fixture roles` table below.

## Excluded from every toolchain surface

| Surface | Where the exclusion lives | What it means |
|---------|---------------------------|---------------|
| TypeScript compilation (`tsc -p .`) | `tsconfig.json` — `"exclude": ["src/test/fixtures"]` (overrides the `"include": ["src/**/*"]` that would otherwise pull this dir in) | `tsc` never compiles the `.ts/.tsx/.js/.jsx` fixtures — many import uninstalled packages, reference undeclared globals, or are syntactically invalid. |
| ESLint (`npm run lint`) | `eslint.config.mjs` — `ignores: [… "src/test/fixtures/**"]` | Fixtures are not held to project style rules. |
| Mocha test runner (`npm test`) | excluded from `tsc` → never emitted to `out/`, so the `out/test/**/*.test.js` glob can't reach it | The runner cannot pick up anything inside this directory, even by accident. |

**Don't lift any of these.** Because this tree lives *under* `src/`, the `tsconfig` exclude and eslint ignore are **load-bearing** — without them `"include": ["src/**/*"]` pulls these in and the toolchain trips over deliberately-broken fixtures (`empty-file.ts`, `whitespace-only.ts`, the `unsupported/` rejection samples). The exclusions are what make those fixtures legal.

This directory must remain a *folder of files*, not a sub-project. **Don't** add a `package.json`, `tsconfig.json`, `.eslintrc`, or `.vscode/` inside it — any of those would re-attach the toolchain and break the invariant above.

## Layout

```
workspace/
├── empty-file.ts                       0-byte (edge case)
├── whitespace-only.ts                  whitespace-only (edge case)
├── single-char.ts                      1-byte (edge case)
├── comments-only.ts                    Bottom-placement heuristic false-positive
├── with-imports.ts                     existing import statements (Bottom landing)
├── with-requires.js                    existing require()/var require/const require (Bottom landing)
├── src/                                application source
│   ├── foo.ts, bar.ts, helpers.ts      baseline source files (referenced by tests)
│   ├── sibling.js, other.js            CommonJS baseline
│   ├── widget.tsx, badge.jsx           React baseline
│   ├── App.vue, App.svelte, App.astro  framework-component destinations
│   ├── styled.vue, styled.svelte, styled.astro   framework SFCs with populated <style> blocks (style-block dialect)
│   ├── theme.css, base.scss, _variables.scss, palette.module.css   stylesheet sources for SFC <style>-block imports
│   ├── api-client.ts, http.ts          realistic library layer
│   ├── logger.ts, env.ts
│   ├── format-date.ts, format-currency.ts, validators.ts
│   ├── components/
│   │   ├── app-root.component.{ts,html,scss}    Angular component (paired template + styles)
│   │   ├── auth.module.ts                       Angular module
│   │   ├── highlight.directive.ts               Angular directive
│   │   ├── trim.pipe.ts                         Angular pipe
│   │   ├── user.service.ts                      Angular service
│   │   ├── nav-bar.component.ts, shared.module.ts   extra Angular surface
│   │   ├── Button.tsx, Card.tsx, Modal.tsx, Avatar.tsx, Spinner.tsx     React TSX (function components)
│   │   ├── ClassButton.tsx, MemoizedList.tsx, GenericList.tsx           TSX class / memo / generic
│   │   ├── ForwardRefInput.tsx, withTheme.tsx, DefaultPage.tsx          TSX forwardRef / HOC / default-export
│   │   ├── test.component.tsx                                           Angular-style class in a .tsx file
│   │   ├── Layout.jsx, NavBar.jsx, Footer.jsx, PageHeader.jsx           React JSX (function components)
│   │   ├── ClassComponent.jsx, withLogging.jsx                          JSX class component / HOC
│   │   └── ForwardedInput.jsx, DefaultPage.jsx                          JSX forwardRef / default-export
│   ├── hooks/                          custom React hooks (TypeScript)
│   ├── utils/                          array/string/object/number/url helpers
│   ├── models/                         TS interfaces (.model.ts naming)
│   ├── types/                          enum / const enum / type aliases / utility types / event-map interface
│   ├── lib/                            abstract class, default-class export, namespace, decorator, barrel re-export
│   ├── server/                         default-function export + named middleware exports
│   └── legacy/                         CommonJS, IIFE, modern ES-module class
├── styles/
│   ├── main.scss, secondary.scss, theme.scss, tokens.scss
│   ├── _partial.scss, _variables.scss, _mixins.scss, _functions.scss, _placeholders.scss
│   ├── global.css, reset.css, normalize.css, design-tokens.css
│   ├── with-imports.css                existing @import (Bottom landing)
│   ├── with-uses.scss                  existing @use + @import (Bottom landing)
│   ├── _partials/_nested.scss          nested partial (path-computation tests)
│   └── components/_button.scss, _card.scss, _modal.scss, _spinner.scss
├── pages/
│   ├── index.html, about.html          baseline HTML files
│   ├── contact.html, pricing.html, 404.html   realistic page siblings (exploratory)
│   └── with-resources.html             existing <script>, <link>, <img> (Bottom landing)
├── docs/
│   ├── README.md, guide.md, CHANGELOG.md, CONTRIBUTING.md, architecture.md, api-reference.md
│   ├── tutorials/getting-started.md, advanced-usage.md
│   └── example.mdx                     MDX destination fixture
├── paper/
│   └── main.tex                        LaTeX (.tex) destination — forced-cursor placement
├── assets/
│   ├── logo.png, icon.gif, photo.jpeg, photo.jpg, thumb.webp     baseline images
│   ├── icon.svg, banner.avif                                      SVG + AVIF image sources
│   ├── font.woff2, regular.ttf                                    baseline fonts
│   ├── images/                         realistic image set (hero, avatar, og-image, favicon, …)
│   ├── icons/                          icon set across image extensions
│   ├── fonts/                          all four font extensions (woff, woff2, ttf, eot)
│   └── media/                          video, audio, text-track sources
│       ├── clip.mp4, demo.webm, animation.mov   video sources
│       ├── song.mp3, effect.ogg, voice.wav, track.m4a   audio sources
│       └── captions.vtt                          text-track source
├── data/
│   ├── config.json, config.yaml, locale.yml                       baseline data
│   ├── feature-flags.json, translations.yaml, package-meta.json   realistic data
│   └── document.pdf                     PDF source for JSX/TSX/MDX
├── unsupported/
│   ├── Main.java                       arbitrary unsupported language (cross-import-gate fixture)
│   ├── styles.less                     close-to-supported but rejected (allow-list reject fixture)
│   ├── texture.bmp                     image-like but unsupported (JSX/TSX/MDX `default:` fixture)
│   ├── render.avi                      media-like but unsupported (binary unsupported)
│   └── archive.zip                     binary unsupported
├── my files/spaced.ts                  path with a literal space
├── unicode-paths/                      path with non-ASCII characters
│   ├── 日本語.ts
│   └── café-menu.tsx
├── deeply/nested/components/widgets/   moderate relative-path traversal (4 levels)
│   ├── deep-widget.tsx
│   └── deep-styles.scss
└── very-deep/level-01/.../level-09/    extreme relative-path stress (9 levels)
    └── extreme-leaf.ts
```

## Coverage matrix

Every cell of the source-extension × destination-extension matrix is reachable from this fixture. Each gating clause in `src/gating.ts:isPairSupported` has at least one positive and one negative fixture — **except** the `.tex` / LaTeX clause, covered by hand-built `FilePathInfo` in `gating.test.ts` and `snippets/languages/latex.test.ts` (the LaTeX builder reads no files, so it needs no fixture).

| Capability | Where to look |
|------------|---------------|
| Every destination snippet builder except LaTeX (`.ts/.tsx/.js/.jsx/.mdx/.css/.scss/.html/.md/.vue/.svelte/.astro`) | `src/` has destinations for these: `.ts/.js/.jsx/.tsx` (baseline), `.vue/.svelte/.astro` (`App.*`), `.mdx` (`docs/example.mdx`); `styles/` for `.css/.scss`; `pages/` for `.html`; `docs/` for `.md`. The remaining destination's snippet builder, **LaTeX (`.tex`)**, is exercised **fixture-free** in `snippets/languages/latex.test.ts` (hand-built `FilePathInfo` — the LaTeX builder reads no files); the `paper/main.tex` fixture exists only for the **placement** tests (`editor/placement-parity.test.ts`, `editor/insert-snippet.test.ts`), which need a real `.tex` document open. |
| Style-picker variants for `pasteImportWithStyle` + `setDefaultImportStyle` (every applicable shape per source/destination pair) | same fixtures as the row above — both pickers reuse the destination switch in `snippets/variants.ts:buildImportSnippetVariants` |
| Every Angular auto-naming suffix (`.component`, `.module`, `.directive`, `.pipe`, `.service`) | `src/components/` |
| Non-Angular TS file (negative auto-name case) | `src/helpers.ts`, `src/utils/*.ts`, `src/lib/` |
| ES modules vs CommonJS (`module.exports`, `exports.x`, `var require`, `const require`) | `src/legacy/*.js`, `with-requires.js`, `src/sibling.js`, `src/other.js` |
| `_partial.scss` filename normalization | `styles/_partial.scss`, `styles/_variables.scss`, `styles/components/_*.scss` |
| Nested-partial path (`_partials/` directory keeps underscore) | `styles/_partials/_nested.scss` |
| Every image extension (`.gif/.jpeg/.jpg/.png/.svg/.avif/.webp`) | `assets/` (baseline), `assets/images/`, `assets/icons/` |
| Every media extension (`.mp4/.webm/.mov/.mp3/.ogg/.wav/.m4a`) | `assets/media/` |
| Text-track (`.vtt`) | `assets/media/captions.vtt` |
| Every font extension (`.woff/.woff2/.ttf/.eot`) | `assets/fonts/` |
| `.json/.yaml/.yml` data sources for JSX/TSX/MDX | `data/` |
| `.pdf` data source for JSX/TSX/MDX | `data/document.pdf` |
| Bottom-placement landing across every `IMPORT_INDICATORS` marker | `with-imports.ts`, `with-requires.js`, `styles/with-imports.css`, `styles/with-uses.scss`, `pages/with-resources.html` |
| Empty / whitespace / single-char / comments-only edge cases | root-level files |
| Path with space, Unicode path, deep traversal | `my files/`, `unicode-paths/`, `deeply/...`, `very-deep/level-01/.../level-09/` |
| Unsupported-extension rejection (the cross-import gate, the per-destination allow-lists, JSX/TSX/MDX `default:`) | `unsupported/{Main.java, styles.less, texture.bmp, render.avi, archive.zip}` |
| TypeScript export shapes — `const`, `function`, `interface`, `type`, `enum`, `const enum`, `class`, `abstract class`, `namespace`, `default class`, `default function`, barrel re-export | `src/types/`, `src/lib/`, `src/server/`, `src/models/`, `src/utils/` |
| JavaScript export shapes — `module.exports = {}`, `exports.x =`, `module.exports.x =`, ES-module `export class` / `export default`, IIFE, `var function` decl | `src/sibling.js`, `src/other.js`, `src/legacy/{analytics,feature-flags,tracker,iife,utils-old}.js`, `src/lib/{event-bus-modern,calculator}.js` |
| JSX component shapes — function component, class component, HOC, forwardRef, `export default function` | `src/components/{Layout,NavBar,Footer,PageHeader,ClassComponent,withLogging,ForwardedInput,DefaultPage}.jsx` |
| TSX component shapes — function, class, generic, memoized, HOC, forwardRef, `export default function`, Angular-style class | `src/components/{Button,Card,Modal,Avatar,Spinner,ClassButton,MemoizedList,GenericList,withTheme,ForwardRefInput,DefaultPage,test.component}.tsx` |

## Fixture roles → code paths they exercise

The `Coverage matrix` above answers "where do I find a fixture for X?"; this table answers "if I touch *this code*, which fixture group regression-tests it?".

| Fixture group | Code site it exercises |
|---------------|------------------------|
| `src/components/*.{component,module,directive,pipe,service}.ts` | `src/snippets/languages/typescript.ts:generateAngularLegacyImportName` — Angular PascalCase substitution at style index 0 only |
| `styles/_*.scss`, `styles/_partials/_nested.scss`, `styles/components/_*.scss` | `src/snippets/languages/scss.ts:normalizePartialFilename` — leading-`_` strip on the *last* path segment |
| `with-imports.ts`, `with-requires.js`, `styles/with-imports.css`, `styles/with-uses.scss`, `pages/with-resources.html` | `src/editor/placement.ts:IMPORT_INDICATORS` — Bottom-placement landing across every marker |
| `unsupported/{Main.java, styles.less, texture.bmp, render.avi, archive.zip}` | `src/gating.ts:isPairSupported` clauses + inline empty-snippet checks; `texture.bmp` additionally hits the JSX/TSX/MDX `_react.ts:default:` branch |
| `empty-file.ts`, `whitespace-only.ts`, `single-char.ts`, `comments-only.ts` | Degenerate-document destinations; `comments-only.ts` specifically verifies that comment lines containing `import ` are correctly skipped by Bottom-placement (landing at line 0, not after the comment) |
| `my files/spaced.ts`, `unicode-paths/{日本語.ts, café-menu.tsx}` | `src/path/relative.ts:computeRelative` — non-ASCII + space-containing path computation |
| `deeply/nested/components/widgets/*`, `very-deep/level-01/.../level-09/extreme-leaf.ts` | `src/path/relative.ts` — multi-level `../` traversal (4 and 9 levels) |
| `src/legacy/*.js`, `src/lib/*.js`, `src/sibling.js`, `src/other.js` | JavaScript export-shape coverage for `src/snippets/languages/javascript.ts` (CommonJS `module.exports`, `exports.x`, IIFE, ES-module `export class`, `var require`/`const require`) |
| `src/types/*.ts`, `src/lib/*.ts`, `src/server/*.ts`, `src/models/*.ts` | TypeScript export-shape coverage for `src/snippets/languages/typescript.ts` (`interface`, `type`, `enum`, `const enum`, `namespace`, abstract class, default class/function, barrel re-export) |
| `src/components/*.{jsx,tsx}` | React-component shape coverage for `src/snippets/_react.ts:buildReactImport` (function component, class component, HOC, forwardRef, generic, memoized, default export) |
| `src/App.vue`, `src/App.svelte`, `src/App.astro` | `src/snippets/languages/framework-component.ts:buildSnippet` — Vue/Svelte/Astro destinations delegating to `buildTypeScriptImportSnippet`; also the framework-component **source** branch of `languages/{typescript,javascript}.ts` (SFC into `.ts`/`.js`) |
| `src/styled.{vue,svelte,astro}` (populated `<style>` blocks) + `src/{theme.css, base.scss, _variables.scss, palette.module.css}` (stylesheet sources) | `src/snippets/languages/framework-component.ts:buildSnippet` — the `<style>`-block stylesheet dialect (`insideStyleBlock`); `src/editor/placement.ts:{findEnclosingStyleBounds, isStyleBlockContext, computeStyleBlockPlacement}` and the drop/command placement parity for it |
| `assets/{logo.png, icon.gif, photo.jpeg, photo.jpg, thumb.webp, icon.svg, banner.avif, font.woff2, regular.ttf}`, `assets/{images,icons,fonts}/*` | `IMAGE_FILE_EXTENSIONS` + font-extension paths through `src/snippets/_react.ts` and the non-script branches of `src/snippets/languages/{html,css,scss,markdown}.ts` |
| `assets/media/{clip.mp4, demo.webm, animation.mov, song.mp3, effect.ogg, voice.wav, track.m4a, captions.vtt}` | `MEDIA_FILE_EXTENSIONS` + `TEXT_TRACK_FILE_EXTENSIONS` paths through `src/snippets/_react.ts` (url import), `src/snippets/languages/html.ts` (video/audio/text-track tags), and `src/path/import-type.ts:determineImportType` |
| `data/{config.json, config.yaml, locale.yml, *.json, *.yaml}` | JSON/YAML branches in `src/snippets/_react.ts:buildReactImport`'s hardcoded non-script `switch` |
| `data/document.pdf` | `.pdf` branch in `src/snippets/_react.ts:buildReactImport` → `import ${1:name} from '<path>';` |
| `docs/example.mdx` | `.mdx` destination in `src/snippets/dispatch.ts` → falls through to `tsx.buildSnippet()` (identical semantics) |

When refactoring any of the code sites above, run the matching test(s) under `src/test/` (and, for manual confirmation, the corresponding checklist in the `qa/` tree) over the fixtures listed here before shipping.

## Baseline filenames are immutable

The baseline filenames (`foo.ts`, `bar.ts`, `helpers.ts`, `sibling.js`, `other.js`, `widget.tsx`, `badge.jsx`, `app-root.component.ts`, `auth.module.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `_partial.scss`, `_variables.scss`, `main.scss`, `secondary.scss`, `global.css`, `reset.css`, `_partials/_nested.scss`, `index.html`, `about.html`, `README.md`, `guide.md`, `logo.png`, `icon.gif`, `photo.jpeg`, `photo.jpg`, `thumb.webp`, `icon.svg`, `banner.avif`, `font.woff2`, `regular.ttf`, `config.json`, `config.yaml`, `locale.yml`, `empty-file.ts`, `comments-only.ts`, `with-imports.ts`, `with-requires.js`, `my files/spaced.ts`, `App.vue`, `App.svelte`, `App.astro`, `styled.vue`, `styled.svelte`, `styled.astro`, `theme.css`, `base.scss`, `palette.module.css`, `clip.mp4`, `song.mp3`, `captions.vtt`, `texture.bmp`, `theme.module.css`, `main.tex`) are referenced directly by the fixture-driven test files under `src/test/`. Renaming a baseline produces a *silent* break: a test will try to open a fixture path that no longer exists, and nothing in the toolchain will warn until the suite runs.

**Workflow when a baseline must change:**

1. Rename / remove the file inside this fixture tree.
2. Update its entry in the baseline list above.
3. Grep the `src/test/` tree for every reference to the old name and update each test.

Realistic-sibling fixtures (e.g., `api-client.ts`, the `Button.tsx` family, `_mixins.scss`, `data/feature-flags.json`) are *not* on the baseline list and are free to rename — they exist for ad-hoc exploratory coverage only and are never quoted by a test.

## Binary files are zero-byte placeholders

Images (`.png` / `.jpg` / `.jpeg` / `.gif` / `.webp` / `.svg`) and fonts (`.woff` / `.woff2` / `.ttf` / `.eot`) hold zero bytes by design. The extension only reads the file extension (via `path.parse(...).ext` consumed inside `src/editor/file-path-info.ts`) — it never opens binary content. **Don't replace placeholders with real binaries:** the repo gets heavier for no behaviour change, and the diff noise hides the actual signal in future commits.

## Adding a new fixture

1. **Baseline fixture** (referenced by a test): add the file → append its name to the baseline list in "Baseline filenames are immutable" → reference it from the relevant test under `src/test/`.
2. **Realistic sibling** (ad-hoc exploratory coverage only, not referenced by any test): just add the file. No doc updates needed.
3. **Fixture for a brand-new file extension** (one not already in `src/types/file-extension.ts`): the four-site sync described in [`src/types/CLAUDE.md`](../../types/CLAUDE.md) applies first — the type union (`src/types/file-extension.ts`), gating tables (`src/constants/extensions.ts`), destination dispatch (`src/snippets/dispatch.ts`), and style-picker variants (`src/snippets/variants.ts`) must accept the new extension *before* any fixture is meaningful. Otherwise the fixture exists but the snippet builders silently fall through to their `default:` branch and the QA tester sees empty output.
4. Never add a `package.json`, `tsconfig.json`, `.eslintrc`, or `.vscode/` inside this directory — see "Excluded from every toolchain surface" above.
