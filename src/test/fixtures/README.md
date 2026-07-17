# src/test/fixtures

Self-contained fixture tree for the extension's **Mocha test suite**. The fixture-driven test files under `src/test/` resolve their `FIXTURE_ROOT` here and open these files as paste sources / destinations through the VS Code API. The tests own their fixtures outright; the tree is deliberately independent of the top-level `qa/` tree.

> **Data, not modules.** These files are *opened as documents* by the tests — never compiled or `import`ed. They're deliberately excluded from `tsc` and ESLint (see [`CLAUDE.md`](CLAUDE.md); many are intentionally invalid) and are never emitted to `out/`, so the runner glob (`out/test/**/*.test.js`) can't pick them up.

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

## Maintenance notes

- The baseline filenames (`foo.ts`, `bar.ts`, `helpers.ts`, `sibling.js`, `other.js`, `widget.tsx`, `badge.jsx`, `app-root.component.ts`, `auth.module.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `_partial.scss`, `_variables.scss`, `main.scss`, `secondary.scss`, `global.css`, `reset.css`, `_partials/_nested.scss`, `index.html`, `about.html`, `README.md`, `guide.md`, `logo.png`, `icon.gif`, `photo.jpeg`, `photo.jpg`, `thumb.webp`, `icon.svg`, `banner.avif`, `font.woff2`, `regular.ttf`, `config.json`, `config.yaml`, `locale.yml`, `empty-file.ts`, `comments-only.ts`, `with-imports.ts`, `with-requires.js`, `my files/spaced.ts`, `App.vue`, `App.svelte`, `App.astro`, `clip.mp4`, `song.mp3`, `captions.vtt`, `texture.bmp`, `theme.module.css`, `main.tex`) are **referenced directly by the fixture-driven test files under `src/test/`**. Renaming one silently breaks the suite — a test will try to open a fixture path that no longer exists.
- Realistic siblings (`api-client.ts`, the `Button.tsx` family, `_mixins.scss`, etc.) are free to rename — they're for ad-hoc exploratory QA.
- Image and font files are zero-byte placeholders. The extension only inspects file extensions, so real binary content is unnecessary.

See [`CLAUDE.md`](CLAUDE.md) in this directory for fixture-role mappings (which code path each fixture group exercises) and the "baselines are immutable" invariant. See [`../CLAUDE.md`](../CLAUDE.md) for the test-suite conventions and the `FIXTURE_ROOT` contract.
