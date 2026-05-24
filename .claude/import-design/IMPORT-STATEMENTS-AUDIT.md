# Import Statements Audit

> Working doc. Not committed-quality prose — opinions in plain English so we can decide what to keep, prune, and add.
>
> **Rubric:** decisions in this audit apply the criteria in [`IMPORT-STATEMENTS-CRITERIA.md`](IMPORT-STATEMENTS-CRITERIA.md). When in doubt about *why* a shape is in or out, that's the long-lived rubric; this audit is one application of it.
>
> **Goal:** the per-language "Final list (post-audit)" tables in this audit are the canonical target for the code's `*_IMPORT_OPTIONS` arrays in `src/snippets/_styles.ts`. Once execution lands, the code's current lists are to be replaced by these final lists — along with the byte-matching `package.json` enum entries (three-site sync), per-language `switch` cases in `src/snippets/*.ts`, the JSX/TSX/MDX source-extension dispatch in `src/snippets/_shared.ts`, the type unions in `src/types/file-extension.ts`, and the gating tables in `src/constants/extensions.ts`.

## Recommended defaults (post-audit)

Every `package.json` setting needs a `default`. Most stay; three change. Anything in **bold** is a change from today's `package.json`.

| Setting | Recommended default | Change? | Rationale |
|---------|---------------------|---------|-----------|
| `preferences.importStatementPlacement` | `"Bottom"` | — | Places imports after the existing import block; least disruptive to existing files. `"Top"` and `"Cursor"` remain available. |
| `script.preserveScriptFileExtension` | `false` | — | Default kept for back-compat with the bundler-era convention. **More relevant in 2026 than ever** — Node ESM, TS NodeNext, Deno, browser ESM all *require* extensions. Flipping the default is a separate decision — deferred to December 2026; design captured in [`IMPORT-EXTENSIONS-AUTO-DETECT.md`](IMPORT-EXTENSIONS-AUTO-DETECT.md). |
| `script.javascriptImportStyle` | `"import name from '_relativePath_';"` | — | Simplest shape; sensible first-run default. Named imports are equally common but require the user to know what to destructure on first paste. |
| `script.typescriptImportStyle` | `"import { name } from '_relativePath_';"` | — | Kept for back-compat with the legacy Angular filename convention: when this shape is selected and the path matches a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component` / `.directive` / `.pipe` / `.service` / `.module`), `app-root.component.ts` becomes `{ AppRootComponent }` automatically. Non-matching paths get the `$1` placeholder — newer (v17+) Angular and non-Angular users aren't penalised. |
| `styleSheet.preserveStylesheetFileExtension` | `false` | — | `.css` extension is *always* preserved for `.css` sources in `.scss` (Sass requirement, regardless of this flag); for everything else, omit. |
| `styleSheet.cssImportStyle` | `"@import '_relativePath_';"` | — | Most common shape; `@import url(...)` is valid but rarer. |
| `styleSheet.cssImageImportStyle` | `"url('_relativePath_')"` | — | Single canonical shape (CSS-spec fixed). |
| `styleSheet.scssImportStyle` | **`"@use '_relativePath_';"`** | **Change** | Sass team officially [deprecated `@import` in 2022](https://sass-lang.com/blog/the-module-system-is-launched/). Today's default ships the deprecated form to new users — fix it. |
| `styleSheet.scssImageImportStyle` | `"url('_relativePath_')"` | — | Single canonical shape (reuses CSS form). |
| `markup.htmlScriptImportStyle` | **`"<script src=\"_relativePath_\"></script>"`** | **Change** | `type="text/javascript"` is redundant in HTML5 (it's the default). Behavior identical; the new shape is just modern minimal. |
| `markup.htmlImageImportStyle` | `"<img src=\"_relativePath_\" alt=\"sample\">"` | — | Lazy-load variant becomes an opt-in option but stays out of the default — above-fold images shouldn't be lazy. |
| `markup.htmlStyleSheetImportStyle` | `"<link href=\"_relativePath_\" rel=\"stylesheet\">"` | — | Single canonical shape. |
| `markup.markdownImportStyle` | `"[text](_relativePath_)"` | — | Single canonical shape. |
| `markup.markdownImageImportStyle` | **`"![alt-text](_relativePath_)"`** | **Change** | Bare inline is the most common form in the wild; the title attribute is rarely used and belongs as an opt-in option. |
| `markup.htmlVideoImportStyle` | `"<video src=\"_relativePath_\" controls></video>"` | **New** | Accessibility-by-default (`controls` ensures keyboard access). Design: [`IMPORT-MEDIA-FILES.md`](IMPORT-MEDIA-FILES.md). |
| `markup.htmlAudioImportStyle` | `"<audio src=\"_relativePath_\" controls></audio>"` | **New** | Same accessibility rationale. Design: [`IMPORT-MEDIA-FILES.md`](IMPORT-MEDIA-FILES.md). |

**Three defaults change** — all three back-compat-affecting:

1. **SCSS** `@import '…';` → `@use '…';` (Sass deprecation fix)
2. **HTML script** drop redundant `type="text/javascript"` (modernization, no behavior change)
3. **Markdown image** drop `"Hover text"` title (matches common usage)

Existing users who customised these settings keep their persisted value — defaults only apply to fresh installs and explicit resets. Existing users on a **removed** value get automatic fallback to the new default; see [Removed-value fallback policy](#removed-value-fallback-policy) below.

---

## Per-language audit

Each section: current state → critique → recommended additions → **final list** (the post-audit `package.json` enum, default marked).

In every "Final list" table:

- **Position 1 is the default.** Always. Marked with `← **default**`.
- The order is the order to use in `package.json:contributes.configuration.properties.<setting>.enum` so implementation can copy directly.
- The **Status** column flags `new`, `legacy` (kept for back-compat), or blank for unchanged keepers.

### JavaScript (`JAVASCRIPT_IMPORT_OPTIONS`)

**Current (9 styles):**

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
- The two dynamic-import shapes ship a *misleading* pattern. `const name = import('./foo')` makes `name` a `Promise`, not the module; users have to learn this the hard way after pasting. The `await` form is the canonical one and should replace both.

**Recommended additions:**

| Shape | Why |
|-------|-----|
| `import name, { other } from '_relativePath_';` | Common when a local module exports both a default and named exports (`import Logger, { Level } from './logger';`, `import config, { defaults } from './config';`). JS culture doesn't enforce named-only exports as strictly as modern TS (no `verbatimModuleSyntax`, fewer ESLint defaults in that direction), so mixed-export local modules remain common in JS codebases. |
| `const name = await import('_relativePath_');` | Replaces the broken non-`await` shapes; matches how dynamic imports are actually written. |

**Net change:** 9 → 7 styles (4 removed, 2 added). Leaner picker focused on import operations only — re-exports moved out of scope (the extension generates *import* statements; export-side barrel maintenance is a different operation).

**Final list (post-audit):**

| # | Shape | Status |
|---|-------|--------|
| 1 | `import name from '_relativePath_';` | ← **default** |
| 2 | `import { name } from '_relativePath_';` | |
| 3 | `import name, { other } from '_relativePath_';` | new |
| 4 | `import * as name from '_relativePath_';` | |
| 5 | `import '_relativePath_';` | |
| 6 | `const name = require('_relativePath_');` | |
| 7 | `const name = await import('_relativePath_');` | new (replaces removed `var`/`const` non-`await` dynamic forms) |

---

### TypeScript (`TYPESCRIPT_IMPORT_OPTIONS`)

**Current (5 styles):**

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

**Final list (post-audit):**

| # | Shape | Status |
|---|-------|--------|
| 1 | `import { name } from '_relativePath_';` | ← **default** (Angular auto-naming) |
| 2 | `import name from '_relativePath_';` | |
| 3 | `import * as name from '_relativePath_';` | |
| 4 | `import '_relativePath_';` | |
| 5 | `import type { name } from '_relativePath_';` | new |
| 6 | `import { name, type Type } from '_relativePath_';` | new (TS 4.5+ inline modifier — mixed value + type imports) |
| 7 | `const name = await import('_relativePath_');` | new (dynamic import — sibling of JS shape 7) |

---

### JSX / TSX / MDX (`_shared.ts:buildReactImport` source-extension dispatch)

JSX/TSX/MDX have no `package.json` enum of their own. Script sources delegate to JS/TS finals (audited above); non-script sources flow through a hardcoded `switch` in `_shared.ts`. This section audits the non-script switch — the only React-family-specific surface area where corrections and additions apply.

**`.mdx` is a third React-family destination.** Treated synonymously with `.jsx` / `.tsx`: same shared algorithm, same source-extension dispatch, same column-0 placement. MDX content is JSX-with-Markdown-syntax; `.mdx` files canonically import React components (`import Chart from './chart.tsx'`) and other MDX docs (`import Intro from './intro.mdx'`). `src/snippets/mdx.ts` mirrors `tsx.ts`; `.mdx` lives in `ScriptFileExtension`, `SCRIPT_FILE_EXTENSIONS`, and `CROSS_IMPORT_DESTINATIONS`. As a *source*, `.mdx` flows through the default-import bucket below.

**Script-source delegation (no changes):** JSX uses `JAVASCRIPT_IMPORT_OPTIONS` for `.js/.jsx` sources; TSX and MDX use `TYPESCRIPT_IMPORT_OPTIONS` for `.ts/.tsx` and fall back to JS for `.js`. Every JS/TS pruning and addition flows through automatically — no React-family-specific work.

**Current non-script dispatch (2 buckets + 1 silent-reject row):**

| # | Source extensions | Emits | Verdict |
|---|-------------------|-------|---------|
| 0 | `.gif/.jpeg/.jpg/.png/.webp/.json/.html/.yml/.yaml/.md/.mdx` | `import ${1:name} from '…';` | Keep — default-import bucket |
| 1 | `.woff/.woff2/.ttf/.eot/.css/.scss` | `import '…';` (side-effect) | **Fix** — wrong shape for CSS Modules; narrow this bucket |
| — | `.svg`, `.avif`, `.pdf` | not in switch → `default:` → empty → `'not-supported'` toast | **Add** — all silently reject today |

**Critical notes:**

- **CSS Modules bug.** `Foo.module.css` and `Foo.module.scss` are routed into the side-effect bucket via the `.css`/`.scss` cases, producing `import './Foo.module.css';`. That is correct for *global* stylesheets but wrong for CSS Modules — the user needs `import styles from './Foo.module.css';` to access the class-name map (`styles.foo`). CSS Modules are the dominant pattern in modern React (Vite, Next.js, CRA, Remix all detect `.module.css`/`.module.scss` natively); the current behavior gives users garbage they have to hand-edit on every paste. Previously deferred as a follow-up — this audit brings it in scope.
- **SVG silently rejected.** SVG is the only common React asset format not in the switch. Pasting `logo.svg` into a `.tsx` today reaches `default:`, emits an empty `SnippetString`, and trips clauses 7/8 of `paste-import.ts`'s gating → `'not-supported'` toast. The default-import-as-URL shape (`import logo from './logo.svg';`, used as `<img src={logo}/>`) is portable across CRA, Vite, Next, and Webpack asset modules — that's the right neutral choice. Component-import shapes (`import { ReactComponent as Logo }`, `?react` suffix) are framework-specific and stay rejected per "Things I considered and rejected" below.
- **`.html` source for JSX/TSX/MDX** stays in the default-import bucket and emits `import name from './foo.html'`. Works only with raw-loader / Vite `?raw`. Niche but harmless — leave as-is.

**Recommended additions / corrections:**

| Shape | Why |
|-------|-----|
| `.module.css` / `.module.scss` → `import ${1:styles} from '_relativePath_';` (new bucket — must dispatch before the side-effect bucket because `.module.scss` matches the `.scss` last-segment) | Dominant modern React pattern (Vite, Next.js, CRA, Remix). Current behavior emits the wrong shape. |
| `.svg` → `import ${1:name} from '_relativePath_';` (default-import bucket) | Universal default-import-as-URL shape — works in CRA, Vite, Next, Webpack asset modules. Component-import is framework-specific (see rejected list). |
| `.avif` → `import ${1:name} from '_relativePath_';` (default-import bucket) | Modern image format — fully supported in all evergreen browsers since Safari 16.4 (March 2023). Naturally belongs alongside `.webp` in `IMAGE_FILE_EXTENSIONS`. Same default-import-as-URL shape and same plumbing as `.svg`. |
| `.pdf` → `import ${1:name} from '_relativePath_';` (default-import bucket) | Modern download/viewer pattern: `import pdfUrl from './manual.pdf';` then `<a href={pdfUrl} download>` or `react-pdf <Document file={pdfUrl}>`. Framework-portable (Vite, Next, CRA, webpack asset-modules). **JSX/TSX/MDX-only** — HTML conventionally uses `public/` for PDF downloads, not paste-import. New singleton `DocumentFileExtension = '.pdf'` union (no existing category fits documents). |

**Net change:** 2 buckets → 3 buckets. One bucket added (CSS-modules default import), three extensions added to the default-import bucket (`.svg`, `.avif`, `.pdf`), one side-effect bucket narrowed (now excludes `.module.*`).

**Final list (post-audit `_shared.ts` switch — three buckets, declaration order; first match wins):**

| # | Source extensions | Emits | Status |
|---|-------------------|-------|--------|
| 1 | `.module.css` / `.module.scss` (basename match) | `import ${1:styles} from '_relativePath_';` | new — CSS Modules default import |
| 2 | `.gif/.jpeg/.jpg/.png/.svg/.avif/.webp/.json/.html/.yml/.yaml/.md/.mdx/.pdf` | `import ${1:name} from '_relativePath_';` | `.svg`, `.avif`, `.pdf` added |
| 3 | `.woff/.woff2/.ttf/.eot/.css/.scss` | `import '_relativePath_';` (side-effect — global stylesheets only) | narrowed — `.module.*` peeled out via bucket 1 |

**Implementation footnote.** This step adds three file extensions across two type-union categories:

- **Images:** `.svg`, `.avif` → expand `types/file-extension.ts:ImageFileExtension` and `constants/extensions.ts:IMAGE_FILE_EXTENSIONS`. Auto-flows into the four `*_SUPPORTED_EXTENSIONS` tables via spread (HTML/CSS/SCSS/MD destinations accept them for free).
- **Documents:** `.pdf` → introduce a new `DocumentFileExtension = '.pdf'` singleton union in `types/file-extension.ts`; join it into `FileExtension`. **JSX/TSX/MDX-only by design** — no `*_SUPPORTED_EXTENSIONS` change (HTML uses `public/` for PDF downloads by convention; CSS/SCSS/MD have no natural PDF embed shape).

All three extensions get a case in the `_shared.ts` non-script switch and its `variants.ts` mirror, joining the default-import bucket.

CSS Modules detection is a basename test (`.endsWith('.module.css')` / `.endsWith('.module.scss')`) and must short-circuit **before** the extension-only `switch` — otherwise `.module.scss` falls into the side-effect bucket via the `.scss` case.

---

### CSS (`CSS_IMPORT_OPTIONS`)

**Current (2 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `@import '_relativePath_';` | Keep — canonical |
| 1 | `@import url('_relativePath_');` | Keep — canonical |

Critically: native CSS `@import` is performance-questionable in production (blocks parallel loading), but it's still the standard syntax and these are the only two canonical shapes. CSS cascade layers (`@import url('…') layer(name);`) exist but are advanced and rare. **No changes recommended.**

`CSS_IMAGE_IMPORT_OPTIONS` (`url('…')`) is fixed by spec — single entry is correct. Leave as-is.

**Final list (post-audit, unchanged):**

| # | Shape | Status |
|---|-------|--------|
| 1 | `@import '_relativePath_';` | ← **default** |
| 2 | `@import url('_relativePath_');` | |

CSS image: single entry `url('_relativePath_')` ← **default**.

---

### SCSS (`SCSS_IMPORT_OPTIONS`)

This is the section that needs the most work.

**Current (4 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `@import '_relativePath_';` | Keep but **demote** — Sass officially [deprecated `@import` in 2022](https://sass-lang.com/blog/the-module-system-is-launched/); kept for legacy codebases only |
| 1 | `@import url('_relativePath_');` | **Remove** — deprecated *and* an uncommon variant of a deprecated form |
| 2 | `@use '_relativePath_';` | Keep — the modern recommended form |
| 3 | `@use '_relativePath_' as *;` | Keep — wildcard alias |

**The default needs to change.** Right now the package.json default is `@import '_relativePath_';` — the deprecated form. New users get the deprecated style out of the box. Default should be `@use '_relativePath_';`.

**Recommended additions:**

| Shape | Why |
|-------|-----|
| `@use '_relativePath_' as name;` | Explicit named alias — common when you want a shorter prefix than the basename (e.g., `@use 'colors' as c;`). |
| `@forward '_relativePath_';` | Sass module re-export. The barrel pattern in modular SCSS codebases (`@forward 'colors'; @forward 'spacing';` in `_index.scss`). High frequency in any modern SCSS codebase. |

**Net change:** 4 → 5 styles (1 removed, 2 added), plus default flip.

`scssImageImportStyle` (single-entry, reuses CSS `url('…')`) is fine as-is.

**Final list (post-audit):**

| # | Shape | Status |
|---|-------|--------|
| 1 | `@use '_relativePath_';` | ← **new default** (was `@import`; Sass team deprecated `@import` in 2022) |
| 2 | `@use '_relativePath_' as *;` | |
| 3 | `@use '_relativePath_' as name;` | new |
| 4 | `@forward '_relativePath_';` | new |
| 5 | `@import '_relativePath_';` | legacy — kept for back-compat; Sass-deprecated |

SCSS image: single entry `url('_relativePath_')` ← **default** (reuses CSS form).

---

### HTML (three settings: script / image / stylesheet)

The "currently unused" framing — single-entry tables that exist for `package.json` UI parity — is exactly the wrong shape for HTML. There *are* legitimate modern alternatives users would want; the maintainer just hasn't added them. This audit is the trigger to expand them.

**Current (1 + 1 + 1 styles):**

| Setting | Current shape | Verdict |
|---------|---------------|---------|
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

Defaults: HTML script default should change to the modernized `<script src="…"></script>` form (no behavior difference vs. the current default — purely drops the redundant `type="text/javascript"`). Image default stays neutral (`<img src="…" alt="sample">`); the lazy-load and CLS-dimensions variants are opt-in. Stylesheet remains a single canonical shape. See the **Recommended defaults** table above.

**Final list (post-audit):**

`markup.htmlScriptImportStyle` — 5 options:

| # | Shape | Status |
|---|-------|--------|
| 1 | `<script src="_relativePath_"></script>` | ← **new default** (was `<script type="text/javascript" src="…"></script>`; modernized) |
| 2 | `<script src="_relativePath_" defer></script>` | new — modern best practice for non-critical scripts (preserves order; runs after parsing) |
| 3 | `<script type="module" src="_relativePath_"></script>` | new — ES modules in HTML |
| 4 | `<script src="_relativePath_" async></script>` | new — order-independent execution; right for analytics/ads/third-party tags |
| 5 | `<script type="text/javascript" src="_relativePath_"></script>` | legacy — was previous default; kept for back-compat |

`markup.htmlImageImportStyle` — 3 options:

| # | Shape | Status |
|---|-------|--------|
| 1 | `<img src="_relativePath_" alt="sample">` | ← **default** |
| 2 | `<img src="_relativePath_" alt="" loading="lazy">` | new — opt-in for below-fold images |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | new — Core Web Vitals CLS prevention; user fills in dimensions |

`markup.htmlStyleSheetImportStyle` — 1 option (unchanged):

| # | Shape | Status |
|---|-------|--------|
| 1 | `<link href="_relativePath_" rel="stylesheet">` | ← **default** |

---

### Markdown link (`MARKDOWN_IMPORT_OPTIONS`)

`[text](_relativePath_)` is the canonical inline link shape. There is no meaningful variant worth adding (reference-style links are real Markdown but rarely used for file references). **No changes.**

**Final list (post-audit, unchanged):**

| # | Shape | Status |
|---|-------|--------|
| 1 | `[text](_relativePath_)` | ← **default** |

---

### Markdown image (`MARKDOWN_IMAGE_IMPORT_OPTIONS`)

**Current (2 styles):**

| # | Shape | Verdict |
|---|-------|---------|
| 0 | `![alt-text](_relativePath_ "Hover text")` | Demote — keep as opt-in but no longer the default |
| 1 | `![alt-text][image] / [image]: _relativePath_ "Hover text"` | **Remove** |

**Critical issue with #1:** the snippet emits a single line containing a literal `/` separator. That is *not valid Markdown*. The reference-style is genuinely two lines:

```
![alt-text][image]

[image]: path "Hover text"
```

Pasting the current snippet gives the user garbage they have to manually split. Reference-style image syntax is also rarely the right call for file pastes anyway — recommendation is **remove** rather than fix.

**Missing high-ROI:** the bare inline form `![alt-text](_relativePath_)`. This is the most common Markdown image syntax in the wild — many README/doc images don't have a hover title. Should be the new default.

**Net change:** 2 → 2 styles (one removed, one added). Default flips from inline-with-title to bare inline.

**Final list (post-audit):**

| # | Shape | Status |
|---|-------|--------|
| 1 | `![alt-text](_relativePath_)` | ← **new default** — bare inline, most common form |
| 2 | `![alt-text](_relativePath_ "Hover text")` | was previous default; kept as opt-in for users who want the hover title |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | new — HTML embed for sizing; Core Web Vitals CLS prevention. Pure Markdown can't specify image dimensions; CommonMark / GFM / Pandoc / MkDocs / Docusaurus / VitePress / Astro all permit embedded HTML. |

---

### Media files (video / audio / text track)

Full design: [`IMPORT-MEDIA-FILES.md`](IMPORT-MEDIA-FILES.md). Criteria application and rejection ledger: [`decisions/media-files.md`](decisions/media-files.md). This section captures the audit-level target state.

**Source extensions:** `.mp4`, `.webm`, `.mov` (video); `.mp3`, `.ogg`, `.wav`, `.m4a` (audio); `.vtt` (text track / WebVTT captions).

**New type unions** (`src/types/file-extension.ts`): `VideoFileExtension`, `AudioFileExtension`, `TextTrackFileExtension`, `MediaFileExtension` (umbrella). All joined into `FileExtension`.

**Gating** (`src/constants/extensions.ts`): new `MEDIA_FILE_EXTENSIONS` and `TEXT_TRACK_FILE_EXTENSIONS` arrays. Spread into `HTML_SUPPORTED_EXTENSIONS` (HTML accepts `<video>`/`<audio>`/`<track>`). JSX/TSX/MDX accept via `CROSS_IMPORT_DESTINATIONS`. CSS / SCSS / Markdown do **not** gain media — no functional shape exists (CSS can't play video; Markdown has no native media syntax).

**`determineImportType`** (`src/path/import-type.ts`): gains `'video'`, `'audio'`, and `'text-track'` return values.

**JSX/TSX/MDX dispatch** — new media bucket in `_shared.ts` (promotion to dispatch per Criterion 5 exception — URL-import is the only shape; nothing to vary over in a picker):

| # | Source extensions | Emits |
|---|-------------------|-------|
| 4 | `.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a` / `.vtt` | `import ${1:url} from '_relativePath_';` |

**HTML video** — new `auto-import.importStatement.markup.htmlVideoImportStyle` setting (4 entries):

| # | Shape | Status |
|---|-------|--------|
| 1 | `<video src="_relativePath_" controls></video>` | ← **default** — accessibility-by-default |
| 2 | `<video src="_relativePath_" autoplay muted loop playsinline></video>` | new — silent autoplay (background video) |
| 3 | `<video src="_relativePath_" controls poster=""></video>` | new — poster image placeholder |
| 4 | `<video src="_relativePath_" controls preload="metadata"></video>` | new — avoids pre-buffering (Core Web Vitals) |

**HTML audio** — new `auto-import.importStatement.markup.htmlAudioImportStyle` setting (2 entries):

| # | Shape | Status |
|---|-------|--------|
| 1 | `<audio src="_relativePath_" controls></audio>` | ← **default** |
| 2 | `<audio src="_relativePath_" controls preload="metadata"></audio>` | new — network-friendly preload |

**HTML text track** — hardcoded, no picker setting (single canonical shape):

| # | Shape | Status |
|---|-------|--------|
| 1 | `<track src="_relativePath_" kind="subtitles" srclang="en" label="English"></track>` | ← **default** |

---

## Snippet placeholder spec (final)

Locked-in `SnippetString` shapes for every entry that survives this audit, grouped by language. Each table is the canonical implementation reference: rows are one-to-one with the post-audit `package.json` enum + `src/snippets/_styles.ts:ImportStyle[]` + the per-language `switch` in `src/snippets/*.ts` (the three sync sites — see `src/snippets/CLAUDE.md`). Removed entries appear in a footnote under each table; they fall through to the language's new default via the "Removed-value fallback policy" below.

**Notation.** `${path}` denotes the relative-path expression (in code, the `relativePath` parameter / closure variable). `$1`, `$2`, `${1:default-text}` are VS Code `SnippetString` tab stops — written verbatim into the emitted snippet (the doc-source representation may need to escape `$` against JS template-literal interpolation — e.g. `` `\${1:text}` ``). Entries marked **kept** preserve their current `switch`-case body byte-for-byte; **new** entries lock in the shape below; **new default** entries also change the index-1 / `default:`-branch fallback shape.

### JavaScript (`buildJavaScriptImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `import name from '_relativePath_';` | `` `import $1 from '${path}';` `` | ← **default** |
| 2 | `import { name } from '_relativePath_';` | `` `import { $1 } from '${path}';` `` | kept |
| 3 | `import name, { other } from '_relativePath_';` | `` `import $1, { $2 } from '${path}';` `` | new |
| 4 | `import * as name from '_relativePath_';` | `` `import * as $1 from '${path}';` `` | kept |
| 5 | `import '_relativePath_';` | `` `import '${path}';` `` | kept |
| 6 | `const name = require('_relativePath_');` | `` `const $1 = require('${path}');` `` | kept |
| 7 | `const name = await import('_relativePath_');` | `` `const $1 = await import('${path}');` `` | new |

**Removed entries (drop from all three sync sites):** `import { default as name } from '_relativePath_';`, `var name = require('_relativePath_');`, `var name = import('_relativePath_');`, `const name = import('_relativePath_');`.

### TypeScript (`buildTypeScriptImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `import { name } from '_relativePath_';` | `` `import { $1 } from '${path}';` `` — **Legacy-Angular auto-naming applies *only at this index*** (back-compat support for the pre-standalone Angular filename convention): when `${path}` matches a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component`, `.directive`, `.pipe`, `.service`, `.module`), `generateAngularLegacyImportName()` (`src/snippets/typescript.ts`) substitutes a PascalCase identifier derived from the basename in place of `$1` (e.g. `app-root.component.ts` → `{ AppRootComponent }`). The basename derivation strips a trailing `.ts` / `.tsx` / `.js` / `.jsx` *first* — load-bearing for `preserveScriptFileExtension: true`, which would otherwise fold the extension into the identifier (`AppRootComponentTs`). | ← **default** |
| 2 | `import name from '_relativePath_';` | `` `import $1 from '${path}';` `` | kept |
| 3 | `import * as name from '_relativePath_';` | `` `import * as $1 from '${path}';` `` | kept |
| 4 | `import '_relativePath_';` | `` `import '${path}';` `` | kept |
| 5 | `import type { name } from '_relativePath_';` | `` `import type { $1 } from '${path}';` `` | new |
| 6 | `import { name, type Type } from '_relativePath_';` | `` `import { $1, type $2 } from '${path}';` `` | new |
| 7 | `const name = await import('_relativePath_');` | `` `const $1 = await import('${path}');` `` | new |

**Removed entries (drop from all three sync sites):** `import { default as name } from '_relativePath_';`. The index-1 default remains TS's legacy-Angular auto-naming anchor — preserving its position is load-bearing for the back-compat support; do not reorder.

### SCSS (`buildScssImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `@use '_relativePath_';` | `` `@use '${path}';` `` | ← **new default** (was `@import`; Sass deprecated `@import` in 2022) |
| 2 | `@use '_relativePath_' as *;` | `` `@use '${path}' as ${1:*};` `` — wildcard `*` is the editable default; a keystroke replaces it with a named alias. | kept |
| 3 | `@use '_relativePath_' as name;` | `` `@use '${path}' as $1;` `` | new |
| 4 | `@forward '_relativePath_';` | `` `@forward '${path}';` `` — no user placeholder; `@forward` re-exports the whole module. | new |
| 5 | `@import '_relativePath_';` | `` `@import '${path}';` `` | legacy — kept for back-compat; Sass-deprecated |

All rows reuse SCSS's path-prep pipeline: `normalizePartialFilename()` strips a leading `_` from the basename; `determineScssExtension()` always preserves `.css`, and respects `preserveStylesheetFileExtension` for other source types.

**SCSS image:** no SCSS-specific shape — reuses `buildCssImageImportSnippet` from `css.ts` (see CSS image entry below).

**Removed entries (drop from all three sync sites):** `@import url('_relativePath_');`.

**Critical follow-on (separate file):** add `@forward` markers to the `importIndicators` array in `src/editor/insert-snippet.ts` so "Bottom" placement still detects `@forward`-only files.

### CSS (`buildCssImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `@import '_relativePath_';` | `` `@import '${path}';` `` | ← **default** |
| 2 | `@import url('_relativePath_');` | `` `@import url('${path}');` `` | kept |

**CSS image (`buildCssImageImportSnippet` — hardcoded, single entry; also used for SCSS image sources):**

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `url('_relativePath_')` | `` `url('${path}')` `` — no tab stop; single fixed shape (spec-fixed). | ← **default** |

### HTML script (new `buildHtmlScriptImportSnippetByStyle`)

`html.ts` currently has only hardcoded shapes — the execution checklist introduces this as a `byStyle` function.

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<script src="_relativePath_"></script>` | `` `<script src="${path}"></script>` `` | ← **new default** (was `<script type="text/javascript" src="…"></script>`; modernized — `type` is the HTML5 default) |
| 2 | `<script src="_relativePath_" defer></script>` | `` `<script src="${path}" defer></script>` `` | new |
| 3 | `<script type="module" src="_relativePath_"></script>` | `` `<script type="module" src="${path}"></script>` `` | new |
| 4 | `<script src="_relativePath_" async></script>` | `` `<script src="${path}" async></script>` `` — no user placeholder; `async` is an attribute, not a tab stop. | new |
| 5 | `<script type="text/javascript" src="_relativePath_"></script>` | `` `<script type="text/javascript" src="${path}"></script>` `` | legacy — was previous default; kept for back-compat |

### HTML image (new `buildHtmlImageImportSnippetByStyle`)

Same structural change as HTML script — currently hardcoded; the execution checklist introduces this as a `byStyle` function.

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<img src="_relativePath_" alt="sample">` | `` `<img src="${path}" alt="sample">` `` — preserved verbatim from the existing hardcode for default-position parity. | ← **default** |
| 2 | `<img src="_relativePath_" alt="" loading="lazy">` | `` `<img src="${path}" alt="$1" loading="lazy">` `` — tab stop on `alt`; empty default preserves the decorative-by-default semantic (a UX improvement over the index-1 hardcoded `alt="sample"`). | new |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | `` `<img src="${path}" alt="$1" width="$2" height="$3">` `` — three tab stops walk alt → width → height in semantic order. | new |

### HTML stylesheet (`buildHtmlStylesheetImportSnippet` — hardcoded, single entry)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<link href="_relativePath_" rel="stylesheet">` | `` `<link href="${path}" rel="stylesheet">` `` | ← **default** (unchanged by this audit) |

### Markdown link (`buildMarkdownImportSnippet` — hardcoded, single entry)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `[text](_relativePath_)` | `` `[${1:text}](${path})` `` — tab stop on link text with `text` as the editable default. | ← **default** (unchanged by this audit) |

### Markdown image (`buildMarkdownImageImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `![alt-text](_relativePath_)` | `` `![${1:alt-text}](${path})` `` | ← **new default** (bare inline — most common form in the wild) |
| 2 | `![alt-text](_relativePath_ "Hover text")` | `` `![alt-text](${path} "Hover text")` `` — preserved verbatim from the existing hardcode (no tab stops; was the previous default, now kept as opt-in for users who want the hover title). | kept |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | `` `<img src="${path}" alt="$1" width="$2" height="$3">` `` — three tab stops; same shape as the HTML image picker's CLS variant. | new — HTML embed for sizing; Core Web Vitals CLS prevention |

**Removed entries (drop from all three sync sites):** `![alt-text][image] / [image]: _relativePath_ "Hover text"`. The literal `/` separator is not valid Markdown — genuine reference-style is two lines, which doesn't fit the snippet model.

### JSX/TSX/MDX non-script sources (`_shared.ts:buildReactImport` — hardcoded `switch`, not a `byStyle` function)

Three buckets dispatched in declaration order; first match wins. **There is no `package.json` enum for this surface** — its three-site sync is `types/file-extension.ts` ↔ `constants/extensions.ts` ↔ `_shared.ts` (per `src/constants/CLAUDE.md`'s "Runtime mirror" invariant). Drift produces a silent `default:` → empty snippet → `'not-supported'` toast rather than the enum-mismatch failure mode that hits the other languages. The same `_shared.ts` dispatch serves all three React-family destinations — `src/snippets/{jsx,tsx,mdx}.ts` are thin wrappers that call `buildReactImport` with the appropriate script-source primary/fallback.

| # | Source extensions | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `.module.css` / `.module.scss` (**basename match — must dispatch before the extension switch**, otherwise `.module.scss` falls into bucket 3 via the `.scss` case) | `` `import ${1:styles} from '${path}';` `` — `styles` is the universal CSS-Modules naming convention. | new — CSS Modules default import (fixes the long-standing bug where `Foo.module.css` emitted the side-effect shape) |
| 2 | `.gif` / `.jpeg` / `.jpg` / `.png` / `.svg` / `.avif` / `.webp` / `.json` / `.html` / `.yml` / `.yaml` / `.md` / `.mdx` / `.pdf` | `` `import ${1:name} from '${path}';` `` | `.svg`, `.avif`, `.pdf` added to the existing default-import bucket |
| 3 | `.woff` / `.woff2` / `.ttf` / `.eot` / `.css` / `.scss` | `` `import '${path}';` `` — side-effect import; global stylesheets only. | narrowed — `.module.*` peeled out via bucket 1 |

JSX/TSX/MDX *script* sources delegate to JS/TS via `_shared.ts:buildReactImport`'s `primarySnippet` / `fallbackSnippet` parameters — every JS/TS shape from the tables above flows through automatically; no JSX/TSX/MDX-specific script work.

### JSX/TSX/MDX media sources (`_shared.ts:buildReactImport` — new bucket 4)

| # | Source extensions | `SnippetString` shape | Status |
|---|---|---|---|
| 4 | `.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a` / `.vtt` | `` `import ${1:url} from '${path}';` `` — `url` signals URL-ness; consistent across video/audio/text-track. | new — media + text-track URL-import bucket |

### HTML video (`buildHtmlVideoImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<video src="_relativePath_" controls></video>` | `` `<video src="${path}" controls></video>` `` | ← **default** — accessibility-by-default |
| 2 | `<video src="_relativePath_" autoplay muted loop playsinline></video>` | `` `<video src="${path}" autoplay muted loop playsinline></video>` `` | new — silent autoplay (background video) |
| 3 | `<video src="_relativePath_" controls poster=""></video>` | `` `<video src="${path}" controls poster="$1"></video>` `` — placeholder for poster path | new |
| 4 | `<video src="_relativePath_" controls preload="metadata"></video>` | `` `<video src="${path}" controls preload="metadata"></video>` `` | new — avoids pre-buffering |

### HTML audio (`buildHtmlAudioImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<audio src="_relativePath_" controls></audio>` | `` `<audio src="${path}" controls></audio>` `` | ← **default** |
| 2 | `<audio src="_relativePath_" controls preload="metadata"></audio>` | `` `<audio src="${path}" controls preload="metadata"></audio>` `` | new — network-friendly preload |

### HTML text track (`buildHtmlTextTrackImportSnippet` — hardcoded, single entry)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<track src="_relativePath_" kind="subtitles" srclang="en" label="English">` | `` `<track src="${path}" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>` `` — two tab stops: language code → label. | ← **default** |

---

## Implementation notes

### Doc-update sweep (post-code)

Doc updates are deferred to a single pass after all code changes land. The sweep covers:

- Each modified directory's `CLAUDE.md` and `README.md` under `src/` — update where behavior, invariants, gating tables, three-site-sync sites, or examples shifted. Typically `src/snippets/` for shape changes, `src/types/` + `src/constants/` for extension-union changes, `src/editor/` for `importIndicators`.
- The project's top-level `CLAUDE.md` — refresh whichever architecture section is now stale (notably the SCSS default, HTML script default, Markdown image default, new CSS Modules / `.svg` / `.avif` / `.pdf` source extensions, and new media file support after this audit lands).
- `src/path/` docs — `determineImportType` gains `'video'`, `'audio'`, `'text-track'` return values and `'script'` returns for `.vue`/`.svelte`/`.astro`.
- `src/snippets/` docs — new `vue.ts`, `svelte.ts`, `astro.ts` files; updated `dispatch.ts` switch and `_shared.ts` bucket 2.
- `src/constants/` + `src/types/` docs — new `FrameworkComponentFileExtension` umbrella union, `VUE_SUPPORTED_EXTENSIONS` / `SVELTE_SUPPORTED_EXTENSIONS` / `ASTRO_SUPPORTED_EXTENSIONS`, additions to `CROSS_IMPORT_DESTINATIONS` and `SCRIPT_FILE_EXTENSIONS`.
- `src/editor/` docs — Astro frontmatter-aware placement override (`shouldUseAstroFrontmatter`, `insertSnippetAtAstroFrontmatter`).
- `src/commands/` docs — three new gating clauses in `paste-import.ts` (`.vue`, `.svelte`, `.astro` destinations).
- The project's top-level `CLAUDE.md` refresh should also mention Vue/Svelte/Astro support.

Root `CHANGELOG.md` and root `README.md` are explicitly **out of scope** for this audit.

### Removed-value fallback policy

When a user's persisted `settings.json` value matches an enum entry that was removed in this audit, the system **automatically falls back to the language's default shape**. The existing flow already handles this:

1. `resolveStyleIndex(table, configValue)` returns `undefined` because the removed `description` no longer matches any entry in the new table.
2. The per-language `buildXImportSnippetByStyle` `switch` enters its `default:` branch.
3. That `default:` branch emits the post-audit default shape.

This is the desired behavior — removed-value users transparently get the new default with zero broken pastes.

**Critical invariant:** each `default:` branch must emit the **post-audit default**, not the old one. The audit's three default changes require three matching `default:` branch updates:

- `scss.ts:buildScssImportSnippetByStyle` — `default:` currently returns `@import '${relativePath}';`. **Change to `@use '${relativePath}';`** to match the new SCSS default.
- `markdown.ts:buildMarkdownImageImportSnippetByStyle` — `default:` currently returns inline-with-title. **Change to bare inline `![alt-text](${relativePath})`** to match the new Markdown image default.
- `html.ts:buildHtmlScriptImportSnippet` — currently hardcoded (no `byStyle` switch yet). When the table expands to 5 entries and a `byStyle` variant is added (per the three-site-sync rule), the new switch's `default:` branch must emit `<script src="${relativePath}"></script>` — the new minimal default — *not* the legacy `type="text/javascript"` form.

**Optional UX polish (separate concern):** emit a one-time `vscode.window.showInformationMessage` when a removed value is detected at paste time, telling the user their old setting is deprecated and which shape is now in use. Skip unless an issue surfaces.

### Default changes

Three defaults change in this audit:

- **SCSS** `scssImportStyle`: `@import '_relativePath_';` → `@use '_relativePath_';`
- **HTML script** `htmlScriptImportStyle`: `<script type="text/javascript" src="…"></script>` → `<script src="…"></script>`
- **Markdown image** `markdownImageImportStyle`: inline-with-title → bare inline

All three are improvements but visibly change behavior for new installs and for users on a removed-equivalent.

### Test coverage

Out of scope for this audit. Anything under `src/test/**` (unit tests in `by-style.test.ts` / `extension.test.ts` and the manual-QA sheets in `src/test/manual-qa/`) is the maintainer's responsibility on a separate cadence — execution batches do not modify test files.

### Execution checklist

**Rules for every step:**
- Read every referenced section and linked doc in full before writing code — the checklist is a to-do tracker, not the implementation spec. When a step has a "Read first:" block, start there; otherwise read the "Sections:" references in the audit above and any linked design docs or decision files (`decisions/*.md`)
- Each step gets its own plan-mode session where we read the *current* code state and build before/after diffs
- Each commit must leave `npm run compile && npm test` green
- Doc updates are deferred to Step 14 — code steps (1–13) touch only source code + `package.json`
- The "Snippet placeholder spec" tables above are the canonical `SnippetString` shapes — copy byte-exact
- Three-site sync: `package.json` enum ↔ `_styles.ts` table ↔ per-language `switch` — verify string equality

#### Step 1 — TS picker modernization (add 3, remove 1)

- [x] **Done**

**Sections:** "TypeScript (`TYPESCRIPT_IMPORT_OPTIONS`)" above (final list: 7 entries; shapes 5–7 are additions, verdict column marks the removal) · "TypeScript (`buildTypeScriptImportSnippetByStyle`)" snippet spec + removed-entry footnote · "Removed-value fallback policy" above — **Verify:** `npm run compile && npm test`

#### Step 2 — JS picker modernization (add 2, remove 4)

- [x] **Done**

**Sections:** "JavaScript (`JAVASCRIPT_IMPORT_OPTIONS`)" above (final list: 7 entries; shapes 3 and 7 are additions, verdict column marks removals) · "JavaScript (`buildJavaScriptImportSnippetByStyle`)" snippet spec + removed-entry footnote · "Removed-value fallback policy" above — **Verify:** `npm run compile && npm test`

#### Step 3 — Source extensions (.svg, .avif, .pdf)

- [x] **Done**

**Sections:** "JSX / TSX / MDX" above (bucket 2 additions + "Implementation footnote" for type/constant sync) · "JSX/TSX/MDX non-script sources" snippet spec (bucket 2) — **Verify:** `npm run compile && npm test`

#### Step 4 — Markdown image overhaul

- [x] **Done**

**Sections:** "Markdown image (`MARKDOWN_IMAGE_IMPORT_OPTIONS`)" above (final list: 3 entries, was 2) · "Markdown image (`buildMarkdownImageImportSnippetByStyle`)" snippet spec · "Removed-value fallback policy" above — **Verify:** `npm run compile && npm test`

#### Step 5 — SCSS overhaul

- [x] **Done**

**Sections:** "SCSS (`SCSS_IMPORT_OPTIONS`)" above (final list: 5 entries, was 4) · "SCSS (`buildScssImportSnippetByStyle`)" snippet spec (path pipeline note + `@forward` importIndicators follow-on) · "Removed-value fallback policy" above — **Verify:** `npm run compile && npm test`

#### Step 6 — HTML script modernization

- [x] **Done**

**Sections:** "HTML (three settings: script / image / stylesheet)" above (script subsection) · "HTML script (new `buildHtmlScriptImportSnippetByStyle`)" snippet spec · "Removed-value fallback policy" above — **Verify:** `npm run compile && npm test`

#### Step 7 — HTML image modernization

- [x] **Done**

**Sections:** "HTML (three settings: script / image / stylesheet)" above (image subsection) · "HTML image (new `buildHtmlImageImportSnippetByStyle`)" snippet spec — **Verify:** `npm run compile && npm test`

#### Step 8 — CSS Modules fix (behavior fix)

- [x] **Done**

Behavior change for existing users.

**Sections:** "JSX / TSX / MDX" above (bucket 1 in the final list + "Implementation footnote" for basename-check ordering) · "JSX/TSX/MDX non-script sources" snippet spec (bucket 1) — **Verify:** `npm run compile && npm test`

#### Step 9 — Media types + gating tables

- [x] **Done**

**Read first:** [`IMPORT-MEDIA-FILES.md`](IMPORT-MEDIA-FILES.md) (full design — extension unions, gating tables, `determineImportType` changes) · [`decisions/media-files.md`](decisions/media-files.md) (criteria application — which extensions passed and why; rejection ledger — what not to add)

**Sections:** "Media files (video / audio / text track)" above (audit-level target state for type unions, gating tables, `determineImportType`) — **Verify:** `npm run compile && npm test`

#### Step 10 — Media JSX/TSX/MDX + HTML dispatch

- [x] **Done**

**Read first:** [`IMPORT-MEDIA-FILES.md`](IMPORT-MEDIA-FILES.md) (per-destination snippets, snippet placeholder spec, implementation sketch — the full design for JSX/TSX/MDX dispatch bucket and HTML video/audio/text-track shapes) · [`decisions/media-files.md`](decisions/media-files.md) (cross-cutting design choices — why `controls` is the universal default, why video/audio settings are separate, why JSX/TSX/MDX uses dispatch not a picker)

**Sections:** "Media files" above (JSX/TSX/MDX dispatch bucket, HTML video/audio/text-track final lists) · "JSX/TSX/MDX media sources" snippet spec · "HTML video" / "HTML audio" / "HTML text track" snippet specs — **Verify:** `npm run compile && npm test`

#### Step 11 — Vue support (Phase 1)

- [x] **Done**

**Read first:** [`IMPORT-FRAMEWORK-COMPONENTS.md`](IMPORT-FRAMEWORK-COMPONENTS.md) Phase 1 — Vue (proposal at a glance, locked decisions, implementation sketch, stepped execution plan) · [`decisions/framework-components.md`](decisions/framework-components.md) (rejection ledger)

**Sections:** "Framework component files" bullet under "Things I considered and rejected" above (in-scope reference) — **Verify:** `npm run compile && npm test`

#### Step 12 — Svelte support (Phase 2)

- [x] **Done**

**Read first:** [`IMPORT-FRAMEWORK-COMPONENTS.md`](IMPORT-FRAMEWORK-COMPONENTS.md) Phase 2 — Svelte (proposal at a glance, locked decisions, implementation sketch, stepped execution plan) · [`decisions/framework-components.md`](decisions/framework-components.md) (rejection ledger)

**Sections:** "Framework component files" bullet under "Things I considered and rejected" above (in-scope reference) — **Verify:** `npm run compile && npm test`

#### Step 13 — Astro support (Phase 3)

- [x] **Done**

**Read first:** [`IMPORT-FRAMEWORK-COMPONENTS.md`](IMPORT-FRAMEWORK-COMPONENTS.md) Phase 3 — Astro (proposal at a glance, locked decisions, implementation sketch, stepped execution plan — 4 steps; includes the frontmatter-aware placement override in `src/editor/insert-snippet.ts`) · [`decisions/framework-components.md`](decisions/framework-components.md) (rejection ledger)

**Sections:** "Framework component files" bullet under "Things I considered and rejected" above (in-scope reference) — **Verify:** `npm run compile && npm test`

#### Step 14 — Doc-update sweep

- [ ] **Done**

**Sections:** "Doc-update sweep" above (starting-point list of known drift areas — not exhaustive).

**Exhaustive check:** after applying the fixed list, independently read every `CLAUDE.md` and `README.md` under `src/` and the project root `CLAUDE.md`. Diff each against the post-Step-13 code state — fix anything that drifted, not just items on the fixed list. A doc that wasn't on the list but references behavior that changed in Steps 1–13 is still stale.

**Verify:** Read each updated doc and confirm it matches the post-Step-13 code state.

#### Summary

| Step | Scope | Risk | Default flip? |
|------|-------|------|---------------|
| 1 | TS picker modernization (add 3, remove 1) | Low | No |
| 2 | JS picker modernization (add 2, remove 4) | Low | No |
| 3 | .svg/.avif/.pdf source extensions | Low (additive) | No |
| 4 | Markdown image overhaul | Medium (default flip + removal) | Yes |
| 5 | SCSS overhaul | Medium (default flip + removal + cross-dir) | Yes |
| 6 | HTML script modernization | Medium (structural + default flip) | Yes |
| 7 | HTML image modernization | Low (structural, no default flip) | No |
| 8 | CSS Modules behavior fix | Medium (behavior change) | No |
| 9 | Media types + gating tables | Low (additive) | No |
| 10 | Media JSX/TSX/MDX + HTML dispatch | Low (additive, new settings) | No |
| 11 | Vue support (Phase 1 — types, gating, dispatch, snippet builder, mixed-stack) | Low (additive) | No |
| 12 | Svelte support (Phase 2 — same pattern as Vue) | Low (additive) | No |
| 13 | Astro support (Phase 3 — adds frontmatter-aware placement override) | Medium (new placement logic) | No |
| 14 | Doc-update sweep | None (docs only) | No |

---

## Things I considered and rejected

Each bullet is tagged with the rejection criterion (A–F) or inclusion criterion (1–6) it fails — see [`IMPORT-STATEMENTS-CRITERIA.md`](IMPORT-STATEMENTS-CRITERIA.md) for the rubric.

- **Re-exports (`export { ... } from`, `export { default } from`, `export { default as name } from`, `export { name } from`, `export * from`, `export type { name } from`)** — *(Criterion C: Different feature wearing the same syntax — export, not import.)* Initially included as "barrel patterns" but moved out of scope on a re-pass. The extension generates *import* statements for paste-into-file workflows; export-side barrel maintenance is a different operation conceptually closer to refactoring. Users maintaining barrels can do so manually or via dedicated tools. Removing all re-export shapes also brings JS and TS down to 7 entries each — a leaner picker focused on the extension's actual job.
- **Destructured CJS (`const { name } = require('_relativePath_');`) for JavaScript** — *(Criterion F: Picker bloat with low marginal value.)* Common in modern Node CJS (`const { useState } = require('react')`, `const { Router } = require('express')`). The existing `const name = require(…)` entry is a strict prefix — paste, then change `name` → `{ thing }` to get the destructured form. Adding a dedicated entry pushes JS to 8 over the soft ~7 ceiling for a shape reachable with a one-keystroke edit. Skip; revisit if Node-CJS users request it.
- **Type-only default import (`import type name from '_relativePath_';`) for TypeScript** — *(Criterion 1: Frequency — uncommon in modern TS where named exports dominate + Criterion F: Picker bloat.)* Modern TS conventions push named exports (`@typescript-eslint/consistent-type-imports`, Google / Airbnb style guides) — default exports are rarer in TS than in JS, and the type-only default-import variant is rarer still. Adding pushes TS to 8 over the soft ~7 ceiling. Symmetric reasoning to `import type * as Namespace from '…'` which the audit also parks (under TypeScript section) as "Real but rare. Optional (skip unless asked)." Skip; revisit if a TS user requests it.
- **Mixed default+named (`import name, { other } from '_relativePath_';`) for TypeScript** — *(Criterion 1: Frequency — uncommon for relative paths in modern TS where named-only style dominates.)* Considered as a TS addition during the initial audit pass and originally included in the TS Recommended additions table; removed on a re-pass once the relative-path-only surface was weighed. Modern TS conventions push named-only exports (`@typescript-eslint/consistent-type-imports`, ESLint defaults, Google / Airbnb style guides); local modules rarely export both default *and* named. The NPM-library motivation (`import axios, { AxiosError } from 'axios'`) doesn't apply since this extension only generates relative-path imports. Dynamic `await import` took the slot instead (sibling of JS picker's slot 7). **Remains in the JS picker**, where local modules occasionally do export both shapes and JS culture doesn't enforce named-only as strictly. Skip for TS; revisit if a TS user requests it for a specific paste-and-output example.
- **Custom user-defined templates** — *(Criterion F: Picker bloat with low marginal value — open-ended template surface vs. a curated picker.)* Analyzed in earlier conversation. Low ROI, high maintenance cost, scope drift. Skip.
- **Removing `preserveScriptFileExtension` / `preserveStylesheetFileExtension`** — *(Not a rejection — keep decision. Full design + deferral rationale: [`IMPORT-EXTENSIONS-AUTO-DETECT.md`](IMPORT-EXTENSIONS-AUTO-DETECT.md), revisit December 2026.)* Script-side toggle is *more* relevant in 2026 (Node ESM, TS NodeNext, Deno, browser ESM all need extensions). Stylesheet-side is narrower but harmless.
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
- **Expanding `preserveScriptFileExtension` to a tri-state enum (`"never"` / `"always"` / `"auto"`) with auto-detect default** — *(Not a rejection — deferred decision.)* The current boolean produces broken imports for NodeNext users. Supersedes the simpler "flip default to `true`" framing — the fuller solution detects runtime from `tsconfig` / `package.json` / `deno.json` and rewrites `.ts` → `.js` where needed. Behavior change for existing users mitigated by migration (`true` → `"always"`, `false` → `"never"`, unset → `"auto"`). Design captured in [`IMPORT-EXTENSIONS-AUTO-DETECT.md`](IMPORT-EXTENSIONS-AUTO-DETECT.md).
- **JSX/TSX/MDX component-import shapes for SVG (`import { ReactComponent as Logo } from './logo.svg'`, `import Logo from './logo.svg?react'`)** — *(Criterion B: Bundler/framework-specific — CRA-deprecated; Vite-only `?react` suffix.)* The portable default-import-as-URL shape is in scope; component shapes are not.
- **Media files (`.mp4`, `.webm`, `.mov`, `.mp3`, `.ogg`, `.wav`, `.m4a`) and text tracks (`.vtt`)** — *(Now in scope — design locked in [`IMPORT-MEDIA-FILES.md`](IMPORT-MEDIA-FILES.md); execution steps in the checklist below.)* See the "Media files" per-language section above for the audit-level target state, and the snippet spec tables for canonical shapes.
- **Framework component files (`.vue`, `.svelte`, `.astro`)** — *(Now in scope — all phases locked in [`IMPORT-FRAMEWORK-COMPONENTS.md`](IMPORT-FRAMEWORK-COMPONENTS.md); execution steps in the checklist below.)* Each ecosystem's standard component format ships a default-import-as-component shape (`import MyComp from './MyComp.vue';` then `<MyComp />`) that's portable within its ecosystem. Each fails the strict reading of Criterion 3 (Framework-portable — requires the framework's own compiler) but in the same way `.jsx`/`.tsx` does, and the extension's existing scope already accepts that trade-off for React. Expansion is a strategic decision (which ecosystems to target) rather than a rubric application. Vue is the largest user base in 2026 and is the planned Phase 1; Svelte and Astro follow as Phase 2 and 3. Design captured in [`IMPORT-FRAMEWORK-COMPONENTS.md`](IMPORT-FRAMEWORK-COMPONENTS.md).
- **Treating `.mdx` as a Markdown variant (alternative design — rejected on re-pass)** — *(Superseded by treating `.mdx` synonymously with `.jsx`/`.tsx` as a third React-family destination.)* An earlier framing slotted `.mdx` into `MarkdownFileExtension`, appended it to `MARKDOWN_SUPPORTED_EXTENSIONS`, and routed `.md`-destination paste-imports of `.mdx` through `determineImportType → 'markdown'` to emit `[text](./foo.mdx)`. The new framing recognises that MDX content canonically imports React components — the JS-style default-import shape (`import Doc from './intro.mdx';`) is the correct destination behaviour, and treating `.mdx` as a Markdown variant misses the rich React-family dispatch (`_shared.ts:buildReactImport`, column-0 insertion, CSS Modules detection, default-import vs. side-effect bucketing) that the file actually deserves. Trade-off accepted: `.mdx → .md` paste-imports remain rejected (consistent with `.tsx → .md` being rejected — JSX/TSX/MDX form a closed React family that doesn't cross into `.md`). Revisit only if a concrete `.mdx → .md` cross-import use case surfaces, via the dispatch-promotion exception in Criterion 5.
- **3D model formats (`.gltf`, `.glb`)** — *(Fails Criterion 1: Frequency — niche to React Three Fiber / `@react-three/drei` / WebGPU work.)* Default-import-as-URL pattern is universally supported and would be a clean addition, but the audience is narrow in 2026. Add only if a 3D-focused user requests; revisit if React Three Fiber demand surfaces.
- **WebAssembly modules (`.wasm`) in JSX/TSX/MDX** — *(Fails Criterion 1: Frequency — niche audience in 2026.)* The default-import-as-URL pattern (`import wasmUrl from './module.wasm';` → `WebAssembly.instantiateStreaming(fetch(wasmUrl))`) is universally supported in Vite, Next.js, Webpack 5+, and esbuild — semantically identical to `.svg`/`.pdf` URL imports. Hits 4/5 picker criteria: Standards-current (W3C, baseline since 2017), Framework-portable, Single-path-paste fit, Modern best practice. The one near-fail is the strong one — audience is narrow (perf-critical React paths, scientific computing, Rust+WASM tooling like wasm-bindgen / wasm-pack). Skip; revisit if Rust+WASM React demand surfaces, or fold into the source-extensions step of the execution checklist alongside `.svg`/`.avif`/`.pdf` if a specific user requests it.
- **JPEG XL (`.jxl`) images** — *(Fails Criterion 3: Framework-portable — fragmented browser support in 2026.)* Modern high-efficiency image format (better compression than `.avif` for many use cases). Safari 17+ supports natively, but Chrome dropped support in version 110 (2023) and Firefox is still behind a flag. Until cross-browser support stabilises, including `.jxl` in the JSX/TSX/MDX image bucket would silently produce imports that work only in Safari. Skip; revisit if Chrome reverses its dropped-support decision or Firefox ships the flag-gated impl by default.
- **`.otf` fonts** — *(Criterion F: Picker bloat with low marginal value.)* `.woff2` has won modern font delivery; `.otf` imports in JSX/TSX/MDX would only land in the side-effect bucket, which is rarely useful for fonts (the real use is CSS `@font-face`). Skip.
- **Bundler-specific data formats (`.toml`, `.xml`, `.csv`, `.tsv`, `.txt`, `.proto`, `.graphql`/`.gql`)** — *(Criterion B: Bundler/framework-specific.)* Each needs a dedicated loader (toml-loader, xml-loader, csv-loader, `?raw` suffix, protobufjs-loader, graphql-tag/loader). No universal bare-import form. Skip.
- **SQL files (`.sql`) for Drizzle / Prisma / raw-query workflows** — *(Criterion B: Bundler/framework-specific.)* Modern ORM workflows (Drizzle migrations, Prisma raw-query helpers, Postgres `pg-promise` SQL files) sometimes import `.sql` as raw strings via Vite's `?raw` suffix, webpack's `raw-loader`, or framework-specific loaders. No universal bare-import form — each pipeline requires explicit loader config. Skip; users on Drizzle / Prisma can hand-write the `?raw` import once and rarely paste-import migrations.
- **Worker construction via `new Worker(new URL('./worker.ts', import.meta.url));`** — *(Criterion C: Different feature wearing the same syntax — runtime API call referencing a path, not an import declaration.)* The `.ts`/`.js` source is already covered by the script picker; the `new Worker` pattern is orthogonal and belongs in a separate audit if ever in scope.
- **JS import attributes (`import json from './data.json' with { type: 'json' };`)** — *(Criterion D: Source-type-conditional — applies only to JSON.)* TC39 Stage 3, shipping in Node 22+, V8, and Deno; legacy `assert { type: 'json' }` is being phased out. Doesn't slot into the "user picks a style" registry model — a JSON-only style mostly duplicates the existing default-import shape with a clause that's ignored for every non-JSON source. Skip; revisit if Node ESM JSON imports become mandatory in mainstream toolchains.
- **Raw / data-loader imports for `.graphql`, `.gql`, `.txt`, `.csv` in JSX/TSX/MDX** — *(Criterion B: Bundler/framework-specific.)* Skip.
