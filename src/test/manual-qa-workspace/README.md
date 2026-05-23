# manual-qa-workspace

Self-contained fixture workspace for the **Auto Import Relative Path** extension's manual-QA suite. Open this directory as a VS Code workspace inside the Extension Development Host (F5 from the parent project) and walk the checklists in `../manual-qa/` against it.

> **Not test code.** Nothing in here is compiled or imported by the Mocha test runner — every file exists purely as a paste source or destination. The runner glob (`out/test/**/*.test.js`) ignores this directory.

## Layout

```
manual-qa-workspace/
├── empty-file.ts                       0-byte (edge case)
├── whitespace-only.ts                  whitespace-only (edge case)
├── single-char.ts                      1-byte (edge case)
├── comments-only.ts                    Bottom-placement heuristic false-positive
├── with-imports.ts                     existing import statements (Bottom landing)
├── with-requires.js                    existing require()/var require/const require (Bottom landing)
├── src/                                application source
│   ├── foo.ts, bar.ts, helpers.ts      manual-QA baseline (referenced by checklists)
│   ├── sibling.js, other.js            CommonJS baseline
│   ├── widget.tsx, badge.jsx           React baseline
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
│   ├── index.html, about.html, contact.html, pricing.html, 404.html
│   └── with-resources.html             existing <script>, <link>, <img> (Bottom landing)
├── docs/
│   ├── README.md, guide.md, CHANGELOG.md, CONTRIBUTING.md, architecture.md, api-reference.md
│   └── tutorials/getting-started.md, advanced-usage.md
├── assets/
│   ├── logo.png, icon.gif, photo.jpeg, photo.jpg, thumb.webp     baseline images
│   ├── font.woff2, regular.ttf                                    baseline fonts
│   ├── icon.svg                                                   UNSUPPORTED — gating fixture
│   ├── images/                         realistic image set (hero, avatar, og-image, favicon, …)
│   ├── icons/                          icon set across image extensions
│   └── fonts/                          all four font extensions (woff, woff2, ttf, eot)
├── data/
│   ├── config.json, config.yaml, locale.yml                       baseline data
│   └── feature-flags.json, translations.yaml, package-meta.json   realistic data
├── unsupported/
│   ├── Main.java                       arbitrary unsupported language (clause-1 fixture)
│   ├── styles.less                     close-to-supported but rejected (clause-6 fixture)
│   ├── animation.mov                   binary unsupported
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

Every cell of the source-extension × destination-extension matrix is reachable from this fixture. Each gating clause in `commands/paste-import.ts` has at least one positive and one negative fixture.

| Capability | Where to look |
|------------|---------------|
| All 9 destination snippet builders (`.ts/.tsx/.js/.jsx/.mdx/.css/.scss/.html/.md`) | every directory above contains at least one destination of each kind except `.mdx` (fixture pending — code-supported, no fixture file yet) |
| Style-picker variants for `pasteImportWithStyle` + `setDefaultImportStyle` (every applicable shape per source/destination pair) | same fixtures as the row above — both pickers reuse the destination switch in `snippets/variants.ts:buildImportSnippetVariants` |
| All 5 Angular auto-naming suffixes (`.component`, `.module`, `.directive`, `.pipe`, `.service`) | `src/components/` |
| Non-Angular TS file (negative auto-name case) | `src/helpers.ts`, `src/utils/*.ts`, `src/lib-style modules` |
| ES modules vs CommonJS (`module.exports`, `exports.x`, `var require`, `const require`) | `src/legacy/*.js`, `with-requires.js`, `src/sibling.js`, `src/other.js` |
| `_partial.scss` filename normalization | `styles/_partial.scss`, `styles/_variables.scss`, `styles/components/_*.scss` |
| Nested-partial path (`_partials/` directory keeps underscore) | `styles/_partials/_nested.scss` |
| All 5 image extensions (`.gif/.jpeg/.jpg/.png/.webp`) | `assets/`, `assets/images/`, `assets/icons/` |
| All 4 font extensions (`.woff/.woff2/.ttf/.eot`) | `assets/fonts/` |
| `.json/.yaml/.yml` data sources for JSX/TSX/MDX | `data/` |
| Bottom-placement landing across all 10 `importIndicators` | `with-imports.ts`, `with-requires.js`, `styles/with-imports.css`, `styles/with-uses.scss`, `pages/with-resources.html` |
| Empty / whitespace / single-char / comments-only edge cases | root-level files |
| Path with space, Unicode path, deep traversal | `my files/`, `unicode-paths/`, `deeply/...`, `very-deep/level-01/.../level-09/` |
| Unsupported-extension rejection (clause 1, clause 3–6, JSX/TSX/MDX `default:`) | `unsupported/`, `assets/icon.svg` |
| TypeScript export shapes — `const`, `function`, `interface`, `type`, `enum`, `const enum`, `class`, `abstract class`, `namespace`, `default class`, `default function`, barrel re-export | `src/types/`, `src/lib/`, `src/server/`, `src/models/`, `src/utils/` |
| JavaScript export shapes — `module.exports = {}`, `exports.x =`, `module.exports.x =`, ES-module `export class` / `export default`, IIFE, `var function` decl | `src/sibling.js`, `src/other.js`, `src/legacy/{analytics,feature-flags,tracker,iife,utils-old}.js`, `src/lib/{event-bus-modern,calculator}.js` |
| JSX component shapes — function component, class component, HOC, forwardRef, `export default function` | `src/components/{Layout,NavBar,Footer,PageHeader,ClassComponent,withLogging,ForwardedInput,DefaultPage}.jsx` |
| TSX component shapes — function, class, generic, memoized, HOC, forwardRef, `export default function`, Angular-style class | `src/components/{Button,Card,Modal,Avatar,Spinner,ClassButton,MemoizedList,GenericList,withTheme,ForwardRefInput,DefaultPage,test.component}.tsx` |

## Maintenance notes

- The baseline filenames (`foo.ts`, `bar.ts`, `helpers.ts`, `sibling.js`, `other.js`, `widget.tsx`, `badge.jsx`, `app-root.component.ts`, `auth.module.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `_partial.scss`, `_variables.scss`, `main.scss`, `secondary.scss`, `global.css`, `reset.css`, `_partials/_nested.scss`, `index.html`, `about.html`, `README.md`, `guide.md`, `logo.png`, `icon.gif`, `photo.jpeg`, `photo.jpg`, `thumb.webp`, `font.woff2`, `regular.ttf`, `icon.svg`, `config.json`, `config.yaml`, `locale.yml`, `empty-file.ts`, `comments-only.ts`, `my files/spaced.ts`) are **referenced by every checklist in `../manual-qa/`** (`01-sanity-and-keybindings.md` through `18-style-pickers.md`). Renaming them silently breaks the checklists — the tester will be told to copy a file that no longer exists at that path.
- Realistic siblings (`api-client.ts`, the `Button.tsx` family, `_mixins.scss`, etc.) are free to rename — they're for ad-hoc exploratory QA.
- Image and font files are zero-byte placeholders. The extension only inspects file extensions, so real binary content is unnecessary.

See `CLAUDE.md` in this directory for fixture-role mappings (which code path each fixture group exercises) and the "baselines are immutable" invariant. See `../manual-qa/README.md` for the checklist run-order and master sign-off.
