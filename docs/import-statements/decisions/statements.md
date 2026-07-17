# Import Statements — Design Decisions

> These are the design decisions taken while specifying v1 (the criteria applied, the shapes locked in, and the alternatives rejected); living gate, it stays open for new rows.
>
> **Status: LIVING gate.** The per-language picker audit shipped — defaults, enums, and snippet shapes are live. This file records *why* each shape is in or out; it stays open so a new shape can still be evaluated and earn its own row.
>
> **What the spec describes:** the shipped picker shapes, defaults, and snippet placeholders live in [statements.md](../spec/statements.md). This file is the rationale companion.
>
> **Rubric:** every decision below applies the criteria in [../CRITERIA.md](../CRITERIA.md). When in doubt about *why* a shape is in or out, that's the long-lived rubric; this file is one application of it.
>
> **Provenance:** the audit was executed as stepped commits (each leaving `npm run compile && npm test` green); that per-step execution history — read-first blocks, before/after diffs, risk table, doc-update sweep — lives in git, not here.

## Criteria application — the recommended-defaults rationale

Every `package.json` setting needs a `default`. Most stay; **the changed and new rows are flagged in bold** — anything in **bold** is a change from the pre-audit `package.json`. The default *values* are specified in [statements.md](../spec/statements.md); the Change?/Rationale columns below are why each default is what it is.

> **Key namespaces.** Rows read `<group>.<name>`. Every group nests under `auto-import.importStatement.` **except** `preferences`, the top-level `auto-import.preferences` namespace — so placement's full key is `auto-import.preferences.importStatementPlacement`, **not** `auto-import.importStatement.preferences.…`.

| Setting | Recommended default | Change? | Rationale |
|---------|---------------------|---------|-----------|
| `preferences.importStatementPlacement` | `"Bottom"` | — | Places imports after the existing import block; least disruptive to existing files. `"Top"` and `"Cursor"` remain available. |
| `script.preserveScriptFileExtension` | `false` | — | Default kept for back-compat with the bundler-era convention. **More relevant in 2026 than ever** — Node ESM, TS NodeNext, Deno, browser ESM all *require* extensions. Flipping the default is a separate decision — deferred to December 2026; design captured in [../future/auto-detect-extensions.md](../future/auto-detect-extensions.md). |
| `script.javascriptImportStyle` | `"import name from '_relativePath_';"` | — | Simplest shape; sensible first-run default. Named imports are equally common but require the user to know what to destructure on first paste. |
| `script.typescriptImportStyle` | `"import { name } from '_relativePath_';"` | — | Kept for back-compat with the legacy Angular filename convention: when this shape is selected and the path matches a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component` / `.directive` / `.pipe` / `.service` / `.module`), `app-root.component.ts` becomes `{ ${1:AppRootComponent} }` automatically (a pre-filled, editable tab stop). Non-matching paths get the bare `$1` placeholder — newer (v17+) Angular and non-Angular users aren't penalised. |
| `styleSheet.preserveStylesheetFileExtension` | `false` | — | `.css` extension is *always* preserved for `.css` sources in `.scss` (Sass requirement, regardless of this flag); for everything else, omit. |
| `styleSheet.cssImportStyle` | `"@import '_relativePath_';"` | — | Most common shape; `@import url(...)` is valid but rarer. |
| `styleSheet.cssImageImportStyle` | `"url('_relativePath_')"` | — | Single canonical shape (CSS-spec fixed). |
| `styleSheet.scssImportStyle` | **`"@use '_relativePath_';"`** | **Changed** | Sass team officially [deprecated `@import` in 2022](https://sass-lang.com/blog/the-module-system-is-launched/). The pre-audit default shipped the deprecated form to new users — fixed. |
| `styleSheet.scssImageImportStyle` | `"url('_relativePath_')"` | — | Single canonical shape (reuses CSS form). |
| `markup.htmlScriptImportStyle` | **`"<script src=\"_relativePath_\"></script>"`** | **Changed** | `type="text/javascript"` is redundant in HTML5 (it's the default). Behavior identical; the new shape is just modern minimal. |
| `markup.htmlImageImportStyle` | `"<img src=\"_relativePath_\" alt=\"sample\">"` | — | Lazy-load variant becomes an opt-in option but stays out of the default — above-fold images shouldn't be lazy. |
| `markup.htmlStyleSheetImportStyle` | `"<link href=\"_relativePath_\" rel=\"stylesheet\">"` | — | Single canonical shape. |
| `markup.markdownImportStyle` | `"[text](_relativePath_)"` | — | Single canonical shape. |
| `markup.markdownImageImportStyle` | **`"![alt-text](_relativePath_)"`** | **Changed** | Bare inline is the most common form in the wild; the title attribute is rarely used and belongs as an opt-in option. |
| `markup.htmlVideoImportStyle` | `"<video src=\"_relativePath_\" controls></video>"` | **New** | Accessibility-by-default (`controls` ensures keyboard access). Design: [../spec/media-files.md](../spec/media-files.md) · [media-files.md](media-files.md). |
| `markup.htmlAudioImportStyle` | `"<audio src=\"_relativePath_\" controls></audio>"` | **New** | Same accessibility rationale. Design: [../spec/media-files.md](../spec/media-files.md) · [media-files.md](media-files.md). |

**The flagged rows:**

*Changed (all back-compat-affecting):*

1. **SCSS** `@import '…';` → `@use '…';` (Sass deprecation fix)
2. **HTML script** drop redundant `type="text/javascript"` (modernization, no behavior change)
3. **Markdown image** drop `"Hover text"` title (matches common usage)

*New (settings that did not exist pre-audit):*

4. **HTML video** `<video src="…" controls></video>` (new `htmlVideoImportStyle` setting)
5. **HTML audio** `<audio src="…" controls></audio>` (new `htmlAudioImportStyle` setting)

Existing users who customised these settings keep their persisted value — defaults only apply to fresh installs and explicit resets. Existing users on a **removed** value get automatic fallback to the new default (the [Removed-value fallback policy](../spec/statements.md) is shipped behavior, specified alongside the picker shapes).

---

## Per-language audit — why each shape is in or out

Each section below preserves the audit's *reasoning*: current state → critique → recommended additions → net change. The resulting shipped enums (the "Final list (post-audit)" tables, defaults, and snippet placeholders) are specified in [statements.md](../spec/statements.md).

### JavaScript (`JAVASCRIPT_IMPORT_OPTIONS`)

**Pre-audit (9 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `import name from '…';` | Keep — bread and butter |
| 1 | `import { name } from '…';` | Keep — bread and butter |
| 2 | `import { default as name } from '…';` | **Remove** — niche; nobody writes this as an *import* (its real use case is `export { default as Foo } from '…'` re-exports) |
| 3 | `import * as name from '…';` | Keep — useful for utility modules and "import everything" cases |
| 4 | `import '…';` | Keep — polyfills, side-effect CSS, registration code |
| 5 | `var name = require('…');` | **Remove** — `var` in 2026 is dead; ESLint defaults flag it everywhere |
| 6 | `const name = require('…');` | Keep — CJS still alive in Node scripts and Electron main |
| 7 | `var name = import('…');` | **Remove** — `var` + assigning a `Promise` without `await` is doubly wrong |
| 8 | `const name = import('…');` | **Remove** — assigns a `Promise` to `name`, almost never what users want; replace with `await` form |

**Critical notes:**

- The `default as name` form has one defensible niche (forced uniform destructuring style in some house guides), but it's so uncommon that pruning it loses ~1% of users and removes confusion for the other 99%.
- The two dynamic-import shapes ship a *misleading* pattern. `const name = import('./foo')` makes `name` a `Promise`, not the module; users have to learn this the hard way after pasting. The `await` form is the canonical one and replaces both.

**Recommended additions:**

| Shape | Why |
|-------|-----|
| `import name, { other } from '_relativePath_';` | Common when a local module exports both a default and named exports (`import Logger, { Level } from './logger';`, `import config, { defaults } from './config';`). JS culture doesn't enforce named-only exports as strictly as modern TS (no `verbatimModuleSyntax`, fewer ESLint defaults in that direction), so mixed-export local modules remain common in JS codebases. |
| `const name = await import('_relativePath_');` | Replaces the broken non-`await` shapes; matches how dynamic imports are actually written. |

**Net change:** 9 → 7 styles (4 removed, 2 added). Leaner picker focused on import operations only — re-exports moved out of scope (the extension generates *import* statements; export-side barrel maintenance is a different operation).

### TypeScript (`TYPESCRIPT_IMPORT_OPTIONS`)

**Pre-audit (5 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `import name from '…';` | Keep |
| 1 | `import { name } from '…';` | Keep — flagship Angular auto-naming feature |
| 2 | `import { default as name } from '…';` | **Remove** — same logic as JS |
| 3 | `import * as name from '…';` | Keep |
| 4 | `import '…';` | Keep |

**The big gap: no type-only imports.**

Modern TypeScript (3.8+) ships `import type` and (4.5+) inline `type` modifiers. They're not a "nice to have" — codebases using `verbatimModuleSyntax` (TS 5.0+) or the `@typescript-eslint/consistent-type-imports` rule essentially *require* them. They:

1. Get erased at compile time (zero runtime cost, zero bundle impact)
2. Avoid runtime circular-dependency cycles when only types are shared
3. Make intent visible to readers (this import is type-only)

Missing them is the most significant gap in the entire registry. Every modern TS user wants these in the picker.

**Recommended additions:**

| Shape | Why |
|-------|-----|
| `import type { name } from '_relativePath_';` | The classic type-only import (TS 3.8+). |
| `import { name, type Type } from '_relativePath_';` | The modern inline form (TS 4.5+) — designed for mixing value and type imports from one module. Sharper than the single-inline form, which is semantically equivalent to `import type { name } from` (already in the list). |
| `const name = await import('_relativePath_');` | Code-splitting / lazy-load shape — Vite, Next, Angular lazy routes. Sibling of JS picker's slot 7; gives TS the same dynamic-import coverage. Mixed default+named (`import name, { other }`) was considered but skipped for TS — uncommon for relative paths in modern TS where named-only style dominates; the NPM-library motivation (`import axios, { AxiosError }`) doesn't apply to relative paths. Remains in the JS picker. |

**Net change:** 5 → 7 styles (1 removed, 3 added). Every addition (type-only import, mixed value+type import, dynamic await import) is high-frequency in modern TS. Re-exports moved out of scope; the extension generates *import* statements.

**Optional (skip unless asked):** `import type * as Namespace from '…';`. Real but rare.

The TS default at position 1 (`import { name }`, the code's first `switch` case) is a Tiebreaker-1 back-compat anchor: legacy-Angular auto-naming (`generateAngularLegacyImportName`) fires **only on this shape** — for paths matching a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component` / `.directive` / `.pipe` / `.service` / `.module`), validated against `/^[A-Za-z_$][\w$]*$/`, else `$1`. Every other shape uses `$1`. A *named* import is the TS default precisely because of this anchor; do not reorder position 1.

### JSX / TSX / MDX (`_react.ts:buildReactImport` source-extension dispatch)

JSX/TSX/MDX have no `package.json` enum of their own. Script sources delegate to JS/TS finals (audited above); non-script sources flow through `buildAssetImportStatement(sourceFileExt, importPath)` in `src/snippets/_react.ts`. This section audits that non-script asset switch — the only React-family-specific surface area where corrections and additions apply.

**`.mdx` is a third React-family destination.** Treated synonymously with `.jsx` / `.tsx`: same shared algorithm, same source-extension dispatch, same column-0 placement. MDX content is JSX-with-Markdown-syntax; `.mdx` files canonically import React components (`import Chart from './chart.tsx'`) and other MDX docs (`import Intro from './intro.mdx'`). `src/snippets/languages/tsx.ts` serves `.mdx` destinations (`.mdx` falls through to `tsx.ts` in `dispatch.ts` — identical import semantics); `.mdx` lives in `ScriptFileExtension`, `SCRIPT_FILE_EXTENSIONS`, and `CROSS_IMPORT_DESTINATIONS`. As a *source*, `.mdx` flows through the default-import group below.

**Script-source delegation (no changes):** JSX uses `JAVASCRIPT_IMPORT_OPTIONS` for `.js/.jsx` sources; TSX and MDX use `TYPESCRIPT_IMPORT_OPTIONS` for `.ts/.tsx` and fall back to JS for `.js`. Every JS/TS pruning and addition flows through automatically — no React-family-specific work.

**Pre-audit non-script dispatch (2 buckets + 1 silent-reject row):**

| # | Source extensions | Emits | Verdict |
|---|-------------------|-------|---------|
| 0 | `.gif/.jpeg/.jpg/.png/.webp/.json/.html/.yml/.yaml/.md/.mdx` | `import ${1:name} from '…';` | Keep — default-import group |
| 1 | `.woff/.woff2/.ttf/.eot/.css/.scss` | `import '…';` (side-effect) | **Fix** — wrong shape for CSS Modules; narrow this group |
| — | `.svg`, `.avif`, `.pdf` | not in switch → `default:` → empty → `'not-supported'` toast | **Add** — all silently reject pre-audit |

**Critical notes:**

- **CSS Modules bug.** `Foo.module.css` and `Foo.module.scss` were routed into the side-effect group via the `.css`/`.scss` cases, producing `import './Foo.module.css';`. That is correct for *global* stylesheets but wrong for CSS Modules — the user needs `import styles from './Foo.module.css';` to access the class-name map (`styles.foo`). CSS Modules are the dominant pattern in modern React (Vite, Next.js, CRA, Remix all detect `.module.css`/`.module.scss` natively); the pre-audit behavior gave users garbage they had to hand-edit on every paste. Previously deferred as a follow-up — this audit brought it in scope.
- **SVG silently rejected.** SVG was the only common React asset format not in the switch. Pasting `logo.svg` into a `.tsx` pre-audit reached `default:`, emitted an empty `SnippetString`, and tripped the gating in `src/gating.ts` → `'not-supported'` toast. The default-import-as-URL shape (`import logo from './logo.svg';`, used as `<img src={logo}/>`) is portable across CRA, Vite, Next, and Webpack asset modules — that's the right neutral choice. Component-import shapes (`import { ReactComponent as Logo }`, `?react` suffix) are framework-specific and stay rejected per the rejection ledger below.
- **`.html` source for JSX/TSX/MDX** stays in the default-import group and emits `import name from './foo.html'`. Works only with raw-loader / Vite `?raw`. Niche but harmless — left as-is.

**Recommended additions / corrections:**

| Shape | Why |
|-------|-----|
| `.module.css` / `.module.scss` → `import ${1:styles} from '_relativePath_';` (basename guard — must dispatch *before* the `switch` because `.module.scss` matches the `.scss` last-segment) | Dominant modern React pattern (Vite, Next.js, CRA, Remix). Pre-audit behavior emitted the wrong shape. |
| `.svg` → `import ${1:name} from '_relativePath_';` (default-import group) | Universal default-import-as-URL shape — works in CRA, Vite, Next, Webpack asset modules. Component-import is framework-specific (see rejected list). |
| `.avif` → `import ${1:name} from '_relativePath_';` (default-import group) | Modern image format — fully supported in all evergreen browsers since Safari 16.4 (March 2023). Naturally belongs alongside `.webp` in `IMAGE_FILE_EXTENSIONS`. Same default-import-as-URL shape and same plumbing as `.svg`. |
| `.pdf` → `import ${1:name} from '_relativePath_';` (default-import group) | Modern download/viewer pattern: `import pdfUrl from './manual.pdf';` then `<a href={pdfUrl} download>` or `react-pdf <Document file={pdfUrl}>`. Framework-portable (Vite, Next, CRA, webpack asset-modules). **JSX/TSX/MDX-scoped in this audit** — HTML conventionally uses `public/` for PDF downloads, not paste-import. New singleton `DocumentFileExtension = '.pdf'` union (no existing category fits documents). *(The LaTeX `.tex` destination separately admits `.pdf` as a graphics source — see [latex.md](latex.md) / [../spec/latex.md](../spec/latex.md).)* |

**Net change:** 2 buckets → a basename guard + a default-import group + a side-effect group. The CSS-Modules basename guard was added before the switch; three extensions added to the default-import group (`.svg`, `.avif`, `.pdf`); the side-effect group narrowed (now excludes `.module.*`).

**Type-union footprint of the additions.** The audit added file extensions across two type-union categories:

- **Images:** `.svg`, `.avif` → expand `types/file-extension.ts:ImageFileExtension` and `constants/extensions.ts:IMAGE_FILE_EXTENSIONS`. Auto-flows into the `*_SUPPORTED_EXTENSIONS` tables via spread (HTML/CSS/SCSS/MD destinations accept them for free).
- **Documents:** `.pdf` → a `DocumentFileExtension = '.pdf'` singleton union in `types/file-extension.ts`, joined into `FileExtension`. **JSX/TSX/MDX-scoped in this audit** — no `*_SUPPORTED_EXTENSIONS` change here (HTML uses `public/` for PDF downloads by convention; CSS/SCSS/MD have no natural PDF embed shape). *(The LaTeX `.tex` destination separately carries `.pdf` as an engine-renderable graphics source — `TEX_GRAPHICS_FILE_EXTENSIONS` / `TEX_SUPPORTED_EXTENSIONS`; see [latex.md](latex.md).)*

CSS Modules detection is a basename test (`.endsWith('.module.css')` / `.endsWith('.module.scss')`) and short-circuits **before** the extension-only `switch` — otherwise `.module.scss` would fall into the side-effect group via the `.scss` case.

### CSS (`CSS_IMPORT_OPTIONS`)

**Pre-audit (2 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `@import '_relativePath_';` | Keep — canonical |
| 1 | `@import url('_relativePath_');` | Keep — canonical |

Critically: native CSS `@import` is performance-questionable in production (blocks parallel loading), but it's still the standard syntax and these are the only two canonical shapes. CSS cascade layers (`@import url('…') layer(name);`) exist but are advanced and rare. **No changes.**

`CSS_IMAGE_IMPORT_OPTIONS` (`url('…')`) is fixed by spec — single entry is correct. Left as-is.

### SCSS (`SCSS_IMPORT_OPTIONS`)

This is the section that needed the most work.

**Pre-audit (4 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `@import '_relativePath_';` | Keep but **demote** — Sass officially [deprecated `@import` in 2022](https://sass-lang.com/blog/the-module-system-is-launched/); kept for legacy codebases only |
| 1 | `@import url('_relativePath_');` | **Remove** — deprecated *and* an uncommon variant of a deprecated form |
| 2 | `@use '_relativePath_';` | Keep — the modern recommended form |
| 3 | `@use '_relativePath_' as *;` | Keep — wildcard alias |

**The default needed to change.** The pre-audit package.json default was `@import '_relativePath_';` — the deprecated form. New users got the deprecated style out of the box. Default is now `@use '_relativePath_';`.

**Recommended additions:**

| Shape | Why |
|-------|-----|
| `@use '_relativePath_' as name;` | Explicit named alias — common when you want a shorter prefix than the basename (e.g., `@use 'colors' as c;`). |
| `@forward '_relativePath_';` | Sass module re-export. The barrel pattern in modular SCSS codebases (`@forward 'colors'; @forward 'spacing';` in `_index.scss`). High frequency in any modern SCSS codebase. |

**Net change:** 4 → 5 styles (1 removed, 2 added), plus default flip.

`scssImageImportStyle` (single-entry, reuses CSS `url('…')`) is fine as-is.

> **Follow-on (cross-directory):** `@forward` markers were added to the `IMPORT_INDICATORS` array in `src/editor/placement.ts` so "Bottom" placement still detects `@forward`-only files.

### HTML (three settings: script / image / stylesheet)

The "parity-only" framing — single-entry tables that exist for `package.json` UI parity — is exactly the wrong shape for HTML. There *are* legitimate modern alternatives users would want; the maintainer just hadn't added them. This audit was the trigger to expand them.

**Pre-audit (1 + 1 + 1 styles):**

| Setting | Pre-audit shape | Verdict |
|---------|-----------------|---------|
| Script | `<script type="text/javascript" src="…"></script>` | Modernize — `type="text/javascript"` is redundant in HTML5 (it's the default) |
| Image | `<img src="…" alt="sample">` | Keep, but offer a lazy-load variant |
| Stylesheet | `<link href="…" rel="stylesheet">` | Keep — canonical |

**Recommended additions:**

| Setting | Shape | Why |
|---------|-------|-----|
| Script | `<script src="_relativePath_"></script>` | Modern minimal (HTML5 default type). |
| Script | `<script src="_relativePath_" defer></script>` | `defer` is the modern best practice for non-critical scripts: preserves order, runs after parsing. |
| Script | `<script type="module" src="_relativePath_"></script>` | ES modules in HTML — increasingly common with Vite, native ESM, and modern bundler-less workflows. |
| Script | `<script src="_relativePath_" async></script>` | `async` is the right choice for analytics, ad tags, and third-party scripts where execution order doesn't matter. Not strictly inferior to `defer` — different semantics: `async` runs as soon as it downloads (may block parsing); `defer` runs after parsing, preserves order. Both deserve a slot. |
| Image | `<img src="_relativePath_" alt="" loading="lazy">` | `loading="lazy"` is broadly supported and a no-brainer for below-fold images. Empty `alt=""` is the correct semantic for decorative images (better than `alt="sample"`). |
| Image | `<img src="_relativePath_" alt="" width="" height="">` | Core Web Vitals best practice since 2021 — explicit `width`/`height` prevents Cumulative Layout Shift, a Lighthouse audit and SEO signal. User fills in dimensions on paste; placeholders walk alt → width → height in tab order. |

Defaults: HTML script default changed to the modernized `<script src="…"></script>` form (no behavior difference vs. the pre-audit default — purely drops the redundant `type="text/javascript"`). Image default stays neutral (`<img src="…" alt="sample">`); the lazy-load and CLS-dimensions variants are opt-in. Stylesheet remains a single canonical shape. See the **Criteria application — recommended-defaults** table above.

### Markdown link (`MARKDOWN_IMPORT_OPTIONS`)

`[text](_relativePath_)` is the canonical inline link shape. There is no meaningful variant worth adding (reference-style links are real Markdown but rarely used for file references). **No changes.**

### Markdown image (`MARKDOWN_IMAGE_IMPORT_OPTIONS`)

**Pre-audit (2 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `![alt-text](_relativePath_ "Hover text")` | Demote — keep as opt-in but no longer the default |
| 1 | `![alt-text][image] / [image]: _relativePath_ "Hover text"` | **Remove** |

**Critical issue with #1:** the snippet emitted a single line containing a literal `/` separator. That is *not valid Markdown*. The reference-style is genuinely two lines:

```
![alt-text][image]

[image]: path "Hover text"
```

Pasting the old snippet gave the user garbage they had to manually split. Reference-style image syntax is also rarely the right call for file pastes anyway — recommendation was **remove** rather than fix.

**Missing high-ROI:** the bare inline form `![alt-text](_relativePath_)`. This is the most common Markdown image syntax in the wild — many README/doc images don't have a hover title. It is now the default.

**Net change:** 2 → 3 styles (one removed, two added). Default flips from inline-with-title to bare inline.

### Media files (video / audio / text track)

Full design: [../spec/media-files.md](../spec/media-files.md). Criteria application and rejection ledger: [media-files.md](media-files.md). The audit-level decision was to bring `.mp4` / `.webm` / `.mov` (video), `.mp3` / `.ogg` / `.wav` / `.m4a` (audio), and `.vtt` (text track / WebVTT captions) in scope — each ecosystem's standard format ships a default-import-as-URL shape for JSX/TSX/MDX and `controls`-by-default `<video>`/`<audio>` for HTML, with `<track>` hardcoded. CSS / SCSS / Markdown do **not** gain media — no functional shape exists (CSS can't play video; Markdown has no native media syntax). The video and audio settings are both well under the ~7 ceiling. See [media-files.md](media-files.md) for the per-shape criteria evaluation.

### Framework component files (`.vue` / `.svelte` / `.astro`)

Full design: [../spec/framework-components.md](../spec/framework-components.md). Criteria application, locked-in decisions, and rejection ledger: [framework-components.md](framework-components.md). The audit brought each ecosystem's standard component format in scope with a default-import-as-component shape, shipped through one shared `framework-component.ts` builder. The decision rationale (Criterion 3 tension, picker-reuse, ecosystem ROI) lives in that companion.

---

## Removed-value fallback — why it's safe

When a user's persisted `settings.json` value matches an enum entry that was removed in this audit, the system automatically falls back to the language's default shape (`resolveStyleIndex` returns `undefined` → the per-language `switch` enters its `default:` branch → emits the post-audit default). This is the desired behavior — removed-value users transparently get the new default with zero broken pastes. The mechanism and the byte-exact `description`↔`package.json` enum contract are specified as shipped behavior in [statements.md](../spec/statements.md).

**Critical invariant decided here:** each `default:` branch must emit the **post-audit default**, not the old one. The audit's three default changes required three matching `default:` branch updates — `scss.ts` (`@use`), `markdown.ts` (bare inline image), and `html.ts` (the newly-introduced script `byStyle` switch emitting `<script src="…"></script>`).

**Optional UX polish (decided against for v1):** emit a one-time `vscode.window.showInformationMessage` when a removed value is detected at paste time, telling the user their old setting is deprecated and which shape is now in use. Skipped unless an issue surfaces.

---

## Things considered and rejected

Each bullet is tagged with the rejection criterion (A–F) or inclusion criterion (1–6) it fails — see [../CRITERIA.md](../CRITERIA.md) for the rubric.

- **Re-exports (`export { ... } from`, `export { default } from`, `export { default as name } from`, `export { name } from`, `export * from`, `export type { name } from`)** — *(Criterion C: Different feature wearing the same syntax — export, not import.)* Initially included as "barrel patterns" but moved out of scope on a re-pass. The extension generates *import* statements for paste-into-file workflows; export-side barrel maintenance is a different operation conceptually closer to refactoring. Users maintaining barrels can do so manually or via dedicated tools. Removing all re-export shapes also brings JS and TS down to 7 entries each — a leaner picker focused on the extension's actual job.
- **Destructured CJS (`const { name } = require('_relativePath_');`) for JavaScript** — *(Criterion F: Picker bloat with low marginal value.)* Common in modern Node CJS (`const { useState } = require('react')`, `const { Router } = require('express')`). The existing `const name = require(…)` entry is a strict prefix — paste, then change `name` → `{ thing }` to get the destructured form. Adding a dedicated entry pushes JS to 8 over the soft ~7 ceiling for a shape reachable with a one-keystroke edit. Skip; revisit if Node-CJS users request it.
- **Type-only default import (`import type name from '_relativePath_';`) for TypeScript** — *(Criterion 1: Frequency — uncommon in modern TS where named exports dominate + Criterion F: Picker bloat.)* Modern TS conventions push named exports (`@typescript-eslint/consistent-type-imports`, Google / Airbnb style guides) — default exports are rarer in TS than in JS, and the type-only default-import variant is rarer still. Adding pushes TS to 8 over the soft ~7 ceiling. Symmetric reasoning to `import type * as Namespace from '…'` which the audit also parks (under TypeScript section) as "Real but rare. Optional (skip unless asked)." Skip; revisit if a TS user requests it.
- **Mixed default+named (`import name, { other } from '_relativePath_';`) for TypeScript** — *(Criterion 1: Frequency — uncommon for relative paths in modern TS where named-only style dominates.)* Considered as a TS addition during the initial audit pass and originally included in the TS Recommended additions table; removed on a re-pass once the relative-path-only surface was weighed. Modern TS conventions push named-only exports (`@typescript-eslint/consistent-type-imports`, ESLint defaults, Google / Airbnb style guides); local modules rarely export both default *and* named. The NPM-library motivation (`import axios, { AxiosError } from 'axios'`) doesn't apply since this extension only generates relative-path imports. Dynamic `await import` took the slot instead (sibling of JS picker's slot 7). **Remains in the JS picker**, where local modules occasionally do export both shapes and JS culture doesn't enforce named-only as strictly. Skip for TS; revisit if a TS user requests it for a specific paste-and-output example.
- **Custom user-defined templates** — *(Criterion F: Picker bloat with low marginal value — open-ended template surface vs. a curated picker.)* Analyzed in earlier conversation. Low ROI, high maintenance cost, scope drift. Skip.
- **Removing `preserveScriptFileExtension` / `preserveStylesheetFileExtension`** — *(Not a rejection — keep decision. Full design + deferral rationale: [../future/auto-detect-extensions.md](../future/auto-detect-extensions.md), revisit December 2026.)* Script-side toggle is *more* relevant in 2026 (Node ESM, TS NodeNext, Deno, browser ESM all need extensions). Stylesheet-side is narrower but harmless.
- **Fixing the broken Markdown reference-style image** — *(Fails Criterion 1: Frequency — reference-style is rarely used for file pastes.)* Could split it into two lines (`SnippetString` supports `\n`) but removing is cleaner than fixing.
- **CSS cascade layers (`@import url('…') layer(name);`)** — *(Fails Criterion 1: Frequency.)* Real and modern (Baseline since 2022). Adoption rose with Tailwind v4 (Jan 2024) and shadcn/ui patterns, but the **import-with-layer** form remains niche even in cascade-layer-heavy codebases — layers are mostly declared in own CSS (`@layer name { ... }` blocks), not imported across files. Add when the import-with-layer form itself hits Frequency, not when cascade layers do generally.
- **Sass module configuration (`@use '_relativePath_' with ($key: $value);`) for SCSS** — *(Fails Criterion 1: Frequency — common in design-system / theming work, rare elsewhere.)* Modern Sass module-system feature for overriding `!default` variables in the imported module (Material UI Sass, Bootstrap 5 customization). Hits 4/5 picker criteria: Standards-current (modern Sass module system), Framework-portable (dart-sass — the only active implementation), Single-path-paste fit, User-picks-a-style fit. The strong criterion (Frequency) is borderline. SCSS is at 5/7 entries with room to grow per the bloat-ceiling table, so the ceiling isn't the blocker — but the multi-placeholder config syntax (`@use 'path' with ($1: $2);`) adds friction on every paste even for users who do want this shape. Skip; revisit if design-system SCSS users request it.
- **Reference-style Markdown link `[text][ref]`** — *(Fails Criterion 1: Frequency.)* Real Markdown but rarely used for file references. Skip.
- **HTML `<picture>` element and `<img srcset>`** — *(Fails Criterion 4: Single-path-paste fit + Tiebreaker 4: Single-path beats expressiveness.)* Modern responsive-image patterns, but require multiple paths per element.
- **HTML `<img decoding="async">` / `<img loading="eager">`** — *(Criterion F: Picker bloat with low marginal value.)* Real performance hints but niche; `loading="lazy"` covers 90% of the value.
- **HTML fetch priority hints (`<img src="…" alt="" fetchpriority="high">`, `<script src="…" fetchpriority="high"></script>`)** — *(Fails Criterion 1: Frequency — awareness rising via Core Web Vitals education but not yet dominant.)* HTML Living Standard attribute (Baseline 2023) that signals resource criticality to the browser — `fetchpriority="high"` for LCP-candidate hero images / critical scripts, `fetchpriority="low"` for deferrable resources. Hits 4/5 picker criteria: Standards-current, Framework-portable (browser feature, not framework-specific), Single-path-paste fit, Modern best practice (web.dev / Lighthouse explicitly recommends for LCP optimization). Most compelling for the `<img>` case (LCP is the marquee Core Web Vital); less so for `<script>`, where `defer` / `async` cover the common cases. Skip; revisit if Core Web Vitals tooling makes the attribute a Lighthouse-default expectation.
- **HTML `<link rel="preload">` / `<link rel="modulepreload">` / `<link rel="prefetch">`** — *(Criterion C: Different feature wearing the same syntax — resource hint, not import.)* Belongs in a separate audit if added.
- **HTML `<script nomodule>`** — *(Criterion F: Picker bloat with low marginal value — fading legacy.)* IE/legacy-Edge support is dropping in 2026; `<script type="module">` covers the modern path.
- **HTML `<link rel="stylesheet" media="(prefers-color-scheme: dark)">`** — *(Criterion F: Picker bloat — borderline ROI.)* Modern conditional CSS, but mostly relevant to theme files and component libraries.
- **Expanding `preserveScriptFileExtension` to a tri-state enum (`"never"` / `"always"` / `"auto"`) with auto-detect default** — *(Not a rejection — deferred decision; NOT shipped.)* The current boolean produces broken imports for NodeNext users. Supersedes the simpler "flip default to `true`" framing — the fuller solution detects runtime from `tsconfig` / `package.json` / `deno.json` and rewrites `.ts` → `.js` where needed. Behavior change for existing users mitigated by migration (`true` → `"always"`, `false` → `"never"`, unset → `"auto"`). Design captured in [../future/auto-detect-extensions.md](../future/auto-detect-extensions.md) — still a plain boolean (`default false`) in `package.json`; revisit December 2026.
- **JSX/TSX/MDX component-import shapes for SVG (`import { ReactComponent as Logo } from './logo.svg'`, `import Logo from './logo.svg?react'`)** — *(Criterion B: Bundler/framework-specific — CRA-deprecated; Vite-only `?react` suffix.)* The portable default-import-as-URL shape is in scope; component shapes are not.
- **Media files (`.mp4`, `.webm`, `.mov`, `.mp3`, `.ogg`, `.wav`, `.m4a`) and text tracks (`.vtt`)** — *(Now in scope — shipped; design in [../spec/media-files.md](../spec/media-files.md).)* See the "Media files" decision section above for the audit-level target state, and [media-files.md](media-files.md) for the per-shape criteria evaluation and rejection ledger.
- **Framework component files (`.vue`, `.svelte`, `.astro`)** — *(Now in scope — shipped; design in [../spec/framework-components.md](../spec/framework-components.md).)* Each ecosystem's standard component format ships a default-import-as-component shape (`import MyComp from './MyComp.vue';` then `<MyComp />`) that's portable within its ecosystem. Each fails the strict reading of Criterion 3 (Framework-portable — requires the framework's own compiler) but in the same way `.jsx`/`.tsx` does, and the extension's existing scope already accepts that trade-off for React. Expansion is a strategic decision (which ecosystems to target) rather than a rubric application. Vue is the largest user base in 2026 and was the planned Phase 1; Svelte and Astro followed as Phase 2 and 3. As built, all three ship through one shared `framework-component.ts` builder. See [framework-components.md](framework-components.md) for the locked-in decisions and rejection ledger.
- **Treating `.mdx` as a Markdown variant (alternative design — rejected on re-pass)** — *(Superseded by treating `.mdx` synonymously with `.jsx`/`.tsx` as a third React-family destination.)* An earlier framing slotted `.mdx` into `MarkdownFileExtension`, appended it to `MARKDOWN_SUPPORTED_EXTENSIONS`, and routed `.md`-destination paste-imports of `.mdx` through `determineImportType → 'markdown'` to emit `[text](./foo.mdx)`. The new framing recognises that MDX content canonically imports React components — the JS-style default-import shape (`import Doc from './intro.mdx';`) is the correct destination behaviour, and treating `.mdx` as a Markdown variant misses the rich React-family dispatch (`_react.ts:buildReactImport`, column-0 insertion, CSS Modules detection, default-import vs. side-effect grouping) that the file actually deserves. Trade-off accepted: `.mdx → .md` paste-imports remain rejected (consistent with `.tsx → .md` being rejected — JSX/TSX/MDX form a closed React family that doesn't cross into `.md`). Revisit only if a concrete `.mdx → .md` cross-import use case surfaces, via the dispatch-promotion exception in Criterion 5.
- **3D model formats (`.gltf`, `.glb`)** — *(Fails Criterion 1: Frequency — niche to React Three Fiber / `@react-three/drei` / WebGPU work.)* Default-import-as-URL pattern is universally supported and would be a clean addition, but the audience is narrow in 2026. Add only if a 3D-focused user requests; revisit if React Three Fiber demand surfaces.
- **WebAssembly modules (`.wasm`) in JSX/TSX/MDX** — *(Fails Criterion 1: Frequency — niche audience in 2026.)* The default-import-as-URL pattern (`import wasmUrl from './module.wasm';` → `WebAssembly.instantiateStreaming(fetch(wasmUrl))`) is universally supported in Vite, Next.js, Webpack 5+, and esbuild — semantically identical to `.svg`/`.pdf` URL imports. Hits 4/5 picker criteria: Standards-current (W3C, baseline since 2017), Framework-portable, Single-path-paste fit, Modern best practice. The one near-fail is the strong one — audience is narrow (perf-critical React paths, scientific computing, Rust+WASM tooling like wasm-bindgen / wasm-pack). Skip; revisit if Rust+WASM React demand surfaces, or fold into a source-extensions step alongside `.svg`/`.avif`/`.pdf` if a specific user requests it.
- **JPEG XL (`.jxl`) images** — *(Fails Criterion 3: Framework-portable — fragmented browser support in 2026.)* Modern high-efficiency image format (better compression than `.avif` for many use cases). Safari 17+ supports natively, but Chrome dropped support in version 110 (2023) and Firefox is still behind a flag. Until cross-browser support stabilises, including `.jxl` in the JSX/TSX/MDX image group would silently produce imports that work only in Safari. Skip; revisit if Chrome reverses its dropped-support decision or Firefox ships the flag-gated impl by default.
- **`.otf` fonts** — *(Criterion F: Picker bloat with low marginal value.)* `.woff2` has won modern font delivery; `.otf` imports in JSX/TSX/MDX would only land in the side-effect group, which is rarely useful for fonts (the real use is CSS `@font-face`). Skip.
- **Bundler-specific data formats (`.toml`, `.xml`, `.csv`, `.tsv`, `.txt`, `.proto`, `.graphql`/`.gql`)** — *(Criterion B: Bundler/framework-specific.)* Each needs a dedicated loader (toml-loader, xml-loader, csv-loader, `?raw` suffix, protobufjs-loader, graphql-tag/loader). No universal bare-import form. Skip.
- **SQL files (`.sql`) for Drizzle / Prisma / raw-query workflows** — *(Criterion B: Bundler/framework-specific.)* Modern ORM workflows (Drizzle migrations, Prisma raw-query helpers, Postgres `pg-promise` SQL files) sometimes import `.sql` as raw strings via Vite's `?raw` suffix, webpack's `raw-loader`, or framework-specific loaders. No universal bare-import form — each pipeline requires explicit loader config. Skip; users on Drizzle / Prisma can hand-write the `?raw` import once and rarely paste-import migrations.
- **Worker construction via `new Worker(new URL('./worker.ts', import.meta.url));`** — *(Criterion C: Different feature wearing the same syntax — runtime API call referencing a path, not an import declaration.)* The `.ts`/`.js` source is already covered by the script picker; the `new Worker` pattern is orthogonal and belongs in a separate audit if ever in scope.
- **JS import attributes (`import json from './data.json' with { type: 'json' };`)** — *(Criterion D: Source-type-conditional — applies only to JSON.)* TC39 Stage 3, shipping in Node 22+, V8, and Deno; legacy `assert { type: 'json' }` is being phased out. Doesn't slot into the "user picks a style" registry model — a JSON-only style mostly duplicates the existing default-import shape with a clause that's ignored for every non-JSON source. Skip; revisit if Node ESM JSON imports become mandatory in mainstream toolchains.
- **Raw / data-loader imports for `.graphql`, `.gql`, `.txt`, `.csv` in JSX/TSX/MDX** — *(Criterion B: Bundler/framework-specific.)* Skip.
- **Explicit ESM/CJS module extensions (`.mts`, `.cts`, `.mjs`, `.cjs`) as source and destination** — *(Criterion 1: Frequency — below threshold; audience is minority NodeNext/Deno/Node ESM users.)* Standards-current (TS 4.7+, Node 12+) and Framework-portable, but the extension's user base is overwhelmingly bundler-context where these extensions don't appear. No user signal as of 2026-05-26. VS Code maps `.mts`/`.cts` to language `typescript` and `.mjs`/`.cjs` to language `javascript`, so the extension activates for these files but gating silently rejects — zero user reports of this behavior. The auto-detect design ([../future/auto-detect-extensions.md](../future/auto-detect-extensions.md)) already accounts for `.mts`/`.cts` rewriting (`.mts` → `.mjs`, `.cts` → `.cjs` in NodeNext) — add full extension support as part of that feature's Phase 1+2 when a revisit trigger fires. Same calendar checkpoint: December 2026.

## See also

- [statements.md](../spec/statements.md) — the shipped picker shapes, defaults, and snippet placeholders (what this file explains the *why* for)
- [../CRITERIA.md](../CRITERIA.md) — the rubric every decision above applies
- [media-files.md](media-files.md) · [framework-components.md](framework-components.md) · [latex.md](latex.md) — sibling decision ledgers for the media, framework, and LaTeX expansions
- [../future/auto-detect-extensions.md](../future/auto-detect-extensions.md) — the deferred tri-state extension-preservation design
