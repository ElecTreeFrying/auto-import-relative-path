# Import Statements Audit

> Temporary working doc. Not committed-quality prose — opinions in plain English so we can decide what to keep, prune, and add. Delete after the changes land.

## TL;DR

| Action | Where | Item |
|--------|-------|------|
| **Remove** | JS | `var name = require('_relativePath_');` |
| **Remove** | JS | `var name = import('_relativePath_');` |
| **Remove** | JS | `const name = import('_relativePath_');` *(replaced by `await` form)* |
| **Remove** | JS | `import { default as name } from '_relativePath_';` |
| **Remove** | TS | `import { default as name } from '_relativePath_';` |
| **Remove** | SCSS | `@import url('_relativePath_');` |
| **Remove** | MD image | Reference-style entry — emits literal `/` on one line, isn't valid Markdown, rarely used for file pastes |
| **Fix** | JSX/TSX | `.module.css` / `.module.scss` → emit default import (`import styles from '…'`), not side-effect (CSS Modules need the class-name map) |
| **Default change** | SCSS | `@import '…';` → `@use '…';` (Sass team deprecated `@import`) |
| **Default change** | HTML script | Drop redundant `type="text/javascript"` |
| **Default change** | MD image | Inline-with-title → bare inline `![alt-text](_relativePath_)` |
| **Add** | JS, TS | `import name, { other } from '_relativePath_';` (mixed default + named) |
| **Add** | JS | `const name = await import('_relativePath_');` (corrected dynamic import) |
| **Add** | TS | `import type { name } from '_relativePath_';` (type-only import) |
| **Add** | TS | `import { name, type Type } from '_relativePath_';` (TS 4.5+ inline `type` modifier — mixed value + type imports) |
| **Add** | SCSS | `@use '_relativePath_' as name;` (named namespace) |
| **Add** | SCSS | `@forward '_relativePath_';` (Sass module re-export) |
| **Add** | HTML | `<script src="_relativePath_"></script>` (modern, no redundant `type`) |
| **Add** | HTML | `<script src="_relativePath_" defer></script>` |
| **Add** | HTML | `<script type="module" src="_relativePath_"></script>` |
| **Add** | HTML | `<img src="_relativePath_" alt="" loading="lazy">` |
| **Add** | MD image | `![alt-text](_relativePath_)` (bare inline — most common form) |
| **Add** | JSX/TSX | `.svg` source → `import ${1:name} from '_relativePath_';` (default-import bucket) |

CSS, Markdown link, and the two preserve-extension boolean settings pass the audit cleanly — no removals or additions recommended. JSX/TSX inherit JS/TS pruning automatically for script sources; the non-script dispatch in `_shared.ts` is audited separately below (CSS Modules fix + `.svg` addition).

---

## Recommended defaults (post-audit)

Every `package.json` setting needs a `default`. Most stay; three change. Anything in **bold** is a change from today's `package.json`.

| Setting | Recommended default | Change? | Rationale |
|---------|---------------------|---------|-----------|
| `preferences.importStatementPlacement` | `"Bottom"` | — | Places imports after the existing import block; least disruptive to existing files. `"Top"` and `"Cursor"` remain available. |
| `script.preserveScriptFileExtension` | `false` | — | Default kept for back-compat with the bundler-era convention. **More relevant in 2026 than ever** — Node ESM, TS NodeNext, Deno, browser ESM all *require* extensions. Flipping the default is a separate decision; see "Preserve-extension settings" below. |
| `script.javascriptImportStyle` | `"import name from '_relativePath_';"` | — | Simplest shape; sensible first-run default. Named imports are equally common but require the user to know what to destructure on first paste. |
| `script.typescriptImportStyle` | `"import { name } from '_relativePath_';"` | — | Kept because Angular auto-naming (the flagship value-add) only fires on this shape — `app-root.component.ts` becomes `{ AppRootComponent }` automatically. Non-Angular paths still get the `$1` placeholder, so non-Angular users aren't penalised. |
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

**Three defaults change** — all three back-compat-affecting and worth a single CHANGELOG entry under "Defaults updated":

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
| `import name, { other } from '_relativePath_';` | The canonical React pattern (`import React, { useState } from 'react'`); also common with libraries that ship both a default and named exports. High frequency. |
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
| `import name, { other } from '_relativePath_';` | Same React/library pattern as JS. |

**Net change:** 5 → 7 styles (1 removed, 3 added). Every addition (mixed default+named, type-only import, mixed value+type import) is high-frequency in modern TS. Re-exports moved out of scope; the extension generates *import* statements.

**Optional (skip unless asked):** `import type * as Namespace from '…';`. Real but rare.

**Final list (post-audit):**

| # | Shape | Status |
|---|-------|--------|
| 1 | `import { name } from '_relativePath_';` | ← **default** (Angular auto-naming) |
| 2 | `import name from '_relativePath_';` | |
| 3 | `import name, { other } from '_relativePath_';` | new |
| 4 | `import * as name from '_relativePath_';` | |
| 5 | `import '_relativePath_';` | |
| 6 | `import type { name } from '_relativePath_';` | new |
| 7 | `import { name, type Type } from '_relativePath_';` | new (TS 4.5+ inline modifier — mixed value + type imports) |

---

### JSX / TSX (`_shared.ts:buildReactImport` source-extension dispatch)

JSX/TSX have no `package.json` enum of their own. Script sources delegate to JS/TS finals (audited above); non-script sources flow through a hardcoded `switch` in `_shared.ts`. This section audits the non-script switch — the only JSX/TSX-specific surface area where corrections and additions apply.

**Script-source delegation (no changes):** JSX uses `JAVASCRIPT_IMPORT_OPTIONS` for `.js/.jsx` sources; TSX uses `TYPESCRIPT_IMPORT_OPTIONS` for `.ts/.tsx` and falls back to JS for `.js`. Every JS/TS pruning and addition flows through automatically — no JSX/TSX-specific work.

**Current non-script dispatch (2 buckets + 1 silent-reject row):**

| # | Source extensions | Emits | Verdict |
|---|-------------------|-------|---------|
| 0 | `.gif/.jpeg/.jpg/.png/.webp/.json/.html/.yml/.yaml/.md` | `import ${1:name} from '…';` | Keep — default-import bucket |
| 1 | `.woff/.woff2/.ttf/.eot/.css/.scss` | `import '…';` (side-effect) | **Fix** — wrong shape for CSS Modules; narrow this bucket |
| — | `.svg` | not in switch → `default:` → empty → `'not-supported'` toast | **Add** — silently rejects today |

**Critical notes:**

- **CSS Modules bug.** `Foo.module.css` and `Foo.module.scss` are routed into the side-effect bucket via the `.css`/`.scss` cases, producing `import './Foo.module.css';`. That is correct for *global* stylesheets but wrong for CSS Modules — the user needs `import styles from './Foo.module.css';` to access the class-name map (`styles.foo`). CSS Modules are the dominant pattern in modern React (Vite, Next.js, CRA, Remix all detect `.module.css`/`.module.scss` natively); the current behavior gives users garbage they have to hand-edit on every paste. Previously deferred as a follow-up — this audit brings it in scope.
- **SVG silently rejected.** SVG is the only common React asset format not in the switch. Pasting `logo.svg` into a `.tsx` today reaches `default:`, emits an empty `SnippetString`, and trips clauses 7/8 of `paste-import.ts`'s gating → `'not-supported'` toast. The default-import-as-URL shape (`import logo from './logo.svg';`, used as `<img src={logo}/>`) is portable across CRA, Vite, Next, and Webpack asset modules — that's the right neutral choice. Component-import shapes (`import { ReactComponent as Logo }`, `?react` suffix) are framework-specific and stay rejected per "Things I considered and rejected" below.
- **`.html` source for JSX/TSX** stays in the default-import bucket and emits `import name from './foo.html'`. Works only with raw-loader / Vite `?raw`. Niche but harmless — leave as-is.

**Recommended additions / corrections:**

| Shape | Why |
|-------|-----|
| `.module.css` / `.module.scss` → `import ${1:styles} from '_relativePath_';` (new bucket — must dispatch before the side-effect bucket because `.module.scss` matches the `.scss` last-segment) | Dominant modern React pattern (Vite, Next.js, CRA, Remix). Current behavior emits the wrong shape. |
| `.svg` → `import ${1:name} from '_relativePath_';` (default-import bucket) | Universal default-import-as-URL shape — works in CRA, Vite, Next, Webpack asset modules. Component-import is framework-specific (see rejected list). |

**Net change:** 2 buckets → 3 buckets. One bucket added (CSS-modules default import), one extension added to the default-import bucket (`.svg`), one side-effect bucket narrowed (now excludes `.module.*`).

**Final list (post-audit `_shared.ts` switch — three buckets, declaration order; first match wins):**

| # | Source extensions | Emits | Status |
|---|-------------------|-------|--------|
| 1 | `.module.css` / `.module.scss` (basename match) | `import ${1:styles} from '_relativePath_';` | new — CSS Modules default import |
| 2 | `.gif/.jpeg/.jpg/.png/.svg/.webp/.json/.html/.yml/.yaml/.md` | `import ${1:name} from '_relativePath_';` | `.svg` added |
| 3 | `.woff/.woff2/.ttf/.eot/.css/.scss` | `import '_relativePath_';` (side-effect — global stylesheets only) | narrowed — `.module.*` peeled out via bucket 1 |

**Implementation footnote.** Adding `.svg` is a three-site sync per `src/constants/CLAUDE.md`: add to `types/file-extension.ts:ImageFileExtension`, add to `constants/extensions.ts:IMAGE_FILE_EXTENSIONS` (which auto-flows into the four `*_SUPPORTED_EXTENSIONS` tables via spread, so HTML/CSS/SCSS/MD destinations accept SVG sources for free), and add the `.svg` case to the `_shared.ts` non-script switch. CSS Modules detection is a basename test (`.endsWith('.module.css')` / `.endsWith('.module.scss')`) and must short-circuit **before** the extension-only `switch` — otherwise `.module.scss` falls into the side-effect bucket via the `.scss` case.

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
| Image | `<img src="_relativePath_" alt="" loading="lazy">` | `loading="lazy"` is broadly supported and a no-brainer for below-fold images. Empty `alt=""` is the correct semantic for decorative images (better than `alt="sample"`). |

Defaults: HTML script default should change to the modernized `<script src="…"></script>` form (no behavior difference vs. the current default — purely drops the redundant `type="text/javascript"`). Image default stays neutral (`<img src="…" alt="sample">`); the lazy-load variant is opt-in. Stylesheet remains a single canonical shape. See the **Recommended defaults** table above.

**`async` script variant** is plausible but lower-ROI than `defer` (most authors should default to `defer`). Skip unless requested.

**Final list (post-audit):**

`markup.htmlScriptImportStyle` — 4 options:

| # | Shape | Status |
|---|-------|--------|
| 1 | `<script src="_relativePath_"></script>` | ← **new default** (was `<script type="text/javascript" src="…"></script>`; modernized) |
| 2 | `<script src="_relativePath_" defer></script>` | new — modern best practice for non-critical scripts |
| 3 | `<script type="module" src="_relativePath_"></script>` | new — ES modules in HTML |
| 4 | `<script type="text/javascript" src="_relativePath_"></script>` | legacy — was previous default; kept for back-compat |

`markup.htmlImageImportStyle` — 2 options:

| # | Shape | Status |
|---|-------|--------|
| 1 | `<img src="_relativePath_" alt="sample">` | ← **default** |
| 2 | `<img src="_relativePath_" alt="" loading="lazy">` | new — opt-in for below-fold images |

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

---

## Snippet placeholder spec (new entries)

The audit specifies enum `description` strings but doesn't define the `SnippetString` placeholder positions consumed by `buildXImportSnippetByStyle` (or the hardcoded shape in `html.ts` / `markdown.ts` / `_shared.ts` for the non-`byStyle` paths). Locked-in shapes for the entries this audit adds, grouped by language:

**JS (`buildJavaScriptImportSnippetByStyle`):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `import name, { other } from '_relativePath_';` | `` `import $1, { $2 } from '${path}';` `` |
| `const name = await import('_relativePath_');` | `` `const $1 = await import('${path}');` `` |

**TS (`buildTypeScriptImportSnippetByStyle`):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `import name, { other } from '_relativePath_';` | `` `import $1, { $2 } from '${path}';` `` |
| `import type { name } from '_relativePath_';` | `` `import type { $1 } from '${path}';` `` |
| `import { name, type Type } from '_relativePath_';` | `` `import { $1, type $2 } from '${path}';` `` |

**SCSS (`buildScssImportSnippetByStyle`):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `@use '_relativePath_' as name;` | `` `@use '${path}' as $1;` `` |
| `@forward '_relativePath_';` | `` `@forward '${path}';` `` (no user placeholder — `@forward` re-exports the whole module) |

**HTML script (new `buildHtmlScriptImportSnippetByStyle` — see PR 4 note below; `html.ts` currently has only hardcoded shapes):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `<script src="_relativePath_"></script>` (new default) | `` `<script src="${path}"></script>` `` |
| `<script src="_relativePath_" defer></script>` | `` `<script src="${path}" defer></script>` `` |
| `<script type="module" src="_relativePath_"></script>` | `` `<script type="module" src="${path}"></script>` `` |

**HTML image (new `buildHtmlImageImportSnippetByStyle` — same structural change as HTML script):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `<img src="_relativePath_" alt="" loading="lazy">` | `` `<img src="${path}" alt="$1" loading="lazy">` `` (placeholder lets the user type alt-text immediately; empty default preserves the decorative-by-default semantic — a UX improvement over the existing hardcoded `alt="sample"`) |

**Markdown image (`buildMarkdownImageImportSnippetByStyle`):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `![alt-text](_relativePath_)` (new default) | `` `![${1:alt-text}](${path})` `` |

**JSX/TSX (hardcoded `switch` in `_shared.ts` — not a `byStyle` function):**

| Source-extension bucket | `SnippetString` shape |
|-------------------------|----------------------|
| `.module.css` / `.module.scss` (basename match — runs **before** the extension switch) | `` `import ${1:styles} from '${path}';` `` (`styles` follows the universal CSS-Modules naming convention) |
| `.svg` (joins existing default-import bucket) | `` `import ${1:name} from '${path}';` `` (same shape as the existing default-import bucket) |

Existing entries retain their current `SnippetString` shapes (defined in the current `switch` cases of `javascript.ts` / `typescript.ts` / `scss.ts` / `markdown.ts` and the hardcoded shapes in `html.ts` / `_shared.ts`) — the tables cover only the entries this audit adds.

JS/TS shapes flow through to JSX/TSX automatically via `_shared.ts:buildReactImport`'s `primarySnippet` / `fallbackSnippet` parameters for script sources; non-script sources are governed by the JSX/TSX block above.

---

## Preserve-extension settings (verdict: keep both)

Worth a separate callout because removing these came up as a question.

**`script.preserveScriptFileExtension`** (boolean, default `false`): **Strongly keep.** *More* relevant in 2026 than when added. The original `false` default reflects a webpack/Babel-era world where bundlers resolved extensions for you. That world is shrinking — anyone using **Node ESM** (`"type": "module"`), **TypeScript NodeNext / node16** module resolution, **Deno**, or **plain browser-native ESM** (`<script type="module">`) requires extensions on relative imports. Without them, imports fail at runtime or compile time. Removing the toggle silently breaks all of those users.

**`styleSheet.preserveStylesheetFileExtension`** (boolean, default `false`): **Keep.** Narrower use case. The asymmetric SCSS rule already auto-handles the only critical case (`.css` always preserved inside `.scss`, regardless of this flag). What's left — preserving `.scss` in SCSS, or `.css` in CSS — is uncommon but real for some preprocessor pipelines. Maintenance cost is one boolean, so removing it buys nothing.

**Known gap (separate follow-up):** TS NodeNext imports `.ts` files using `.js` extensions (the post-compile name). The current boolean just preserves whatever extension the source has, so pasting `foo.ts` into a NodeNext project gives you `'./foo.ts'` — wrong; should be `'./foo.js'`. That's an extension-rewriting problem, not a reason to remove the toggle. Worth tracking as a separate issue.

**Defaults:** keep both at `false` for back-compat. Flipping `preserveScriptFileExtension` to `true` is defensible given the Node ESM trajectory but is a behavior change for existing users — separate decision, outside this audit.

---

## Implementation notes

### Three-site sync (per `src/snippets/CLAUDE.md`)

Each add/remove touches all three of:

1. `package.json` → `contributes.configuration.properties.<setting>.enum` (and `enumDescriptions`)
2. `src/snippets/_styles.ts` → matching `ImportStyle[]` entry (with `tag` for the QuickPick)
3. The per-language module's `switch` in `buildXImportSnippetByStyle`

Drift causes silent `undefined` → `default:` fallthrough. **Verify each `description` string is byte-identical across the three sites.**

**JSX/TSX have a different three-site sync.** The `_shared.ts` non-script switch is not driven by a `package.json` enum — it's a hardcoded source-extension dispatch — so its add/remove cycle is a sync of `types/file-extension.ts` ↔ `constants/extensions.ts` ↔ `_shared.ts` (per `src/constants/CLAUDE.md`'s "Runtime mirror" invariant). Drift here causes a silent `default:` → empty-snippet → `'not-supported'` toast rather than a `description`-string mismatch.

### Removed-value fallback policy

When a user's persisted `settings.json` value matches an enum entry that was removed in this audit, the system **automatically falls back to the language's default shape**. The existing flow already handles this:

1. `resolveStyleIndex(table, configValue)` returns `undefined` because the removed `description` no longer matches any entry in the new table.
2. The per-language `buildXImportSnippetByStyle` `switch` enters its `default:` branch.
3. That `default:` branch emits the post-audit default shape.

This is the desired behavior — removed-value users transparently get the new default with zero broken pastes.

**Critical invariant:** each `default:` branch must emit the **post-audit default**, not the old one. The audit's three default changes require three matching `default:` branch updates:

- `scss.ts:buildScssImportSnippetByStyle` — `default:` currently returns `@import '${relativePath}';`. **Change to `@use '${relativePath}';`** to match the new SCSS default.
- `markdown.ts:buildMarkdownImageImportSnippetByStyle` — `default:` currently returns inline-with-title. **Change to bare inline `![alt-text](${relativePath})`** to match the new Markdown image default.
- `html.ts:buildHtmlScriptImportSnippet` — currently hardcoded (no `byStyle` switch yet). When the table expands to 4 entries and a `byStyle` variant is added (per the three-site-sync rule), the new switch's `default:` branch must emit `<script src="${relativePath}"></script>` — the new minimal default — *not* the legacy `type="text/javascript"` form.

CHANGELOG entry under "Defaults updated" should call out: (a) which enum values were removed, (b) the closest-equivalent in the new table users may want to switch to, and (c) the automatic fallback so users know nothing is broken.

**Optional UX polish (separate concern):** emit a one-time `vscode.window.showInformationMessage` when a removed value is detected at paste time, telling the user their old setting is deprecated and which shape is now in use. Skip unless an issue surfaces.

### Default changes

Three defaults change in this audit:

- **SCSS** `scssImportStyle`: `@import '_relativePath_';` → `@use '_relativePath_';`
- **HTML script** `htmlScriptImportStyle`: `<script type="text/javascript" src="…"></script>` → `<script src="…"></script>`
- **Markdown image** `markdownImageImportStyle`: inline-with-title → bare inline

All three are improvements but visibly change behavior for new installs and for users on a removed-equivalent. Mention in CHANGELOG under "Defaults updated."

### Test coverage

The existing test suite (`src/test/extension.test.ts`) covers many of the per-style switch cases. After this audit:

- New `ImportStyle` entries → add a `describe`/`it` per style asserting the produced snippet shape.
- Removed entries → drop their tests; add a "fallthrough on legacy enum value" test asserting the **new default** is emitted (the back-compat fallback policy above).
- SCSS, HTML script, and MD image default changes → update any test asserting the default-style output.
- **HTML script/image `byStyle` introduction (PR 4)** — per-style assertions for the new `defer`, `module`, and `loading="lazy"` shapes, plus a fallthrough-on-legacy-value test asserting the new default emits `<script src="…">` (the modernized minimal form) rather than the legacy `type="text/javascript"`. Image-side fallthrough still emits `<img src="…" alt="sample">` since the image default doesn't change in this audit.
- **JSX/TSX non-script dispatch (PR 6)** — four cases:
  1. `.module.css` / `.module.scss` source → `import ${1:styles} from '<path>';` (default import, not side-effect).
  2. Non-module `.css` / `.scss` source → `import '<path>';` (side-effect bucket still fires for global stylesheets).
  3. `.svg` source → `import ${1:name} from '<path>';` (un-rejection; previously hit the `'not-supported'` toast).
  4. **Basename-ordering regression** — assert `.module.scss` does **not** fall through to the side-effect bucket via the `.scss` case; the basename short-circuit must run before the extension switch.

Also re-run the manual QA in `src/test/manual-qa/` — at minimum the new style-picker manual (`18-style-pickers.md`) and the regression sheet (`17-edge-cases-and-regression.md`).

### Estimated PR shape

This is too large for one PR. Reasonable carving:

1. **PR 1 — TS type imports** (highest ROI, additive only, no removals). Adds the four type-related TS shapes.
2. **PR 2 — JS/TS additions** (mixed default+named, `await import`). Additive, no removals.
3. **PR 3 — Removals + default changes** (the back-compat-affecting changes; SCSS, HTML script, MD image). Bundle so users see one CHANGELOG entry. Includes the three `default:` branch updates so removed values fall back correctly.
4. **PR 4 — HTML modernization** (`defer`/`module` script, lazy image). Additive in shape, but **structural** in plumbing: introduces two new `buildHtmlScriptImportSnippetByStyle` / `buildHtmlImageImportSnippetByStyle` functions (until now `html.ts` has only hardcoded shapes via `buildHtmlScriptImportSnippet` / `buildHtmlImageImportSnippet`), and wires both through `_styles.ts` `resolveStyleIndex` so the existing three-site-sync mechanism applies. The `default:` branch of each new switch must emit the post-audit default (modernized `<script src="…">` for script; the current `<img src="…" alt="sample">` for image — image default doesn't change in this audit).
5. **PR 5 — Markdown image cleanup** (drop reference-style, add bare inline; could fold into PR 3).
6. **PR 6 — JSX/TSX non-script dispatch** (CSS Modules default import + `.svg` support). Additive for `.svg`; behavior fix for CSS Modules (existing pastes that emitted side-effect imports will now emit default imports — flag in CHANGELOG under "Behavior fixes"). Touches `_shared.ts`, `types/file-extension.ts`, `constants/extensions.ts` — three-site sync per `src/constants/CLAUDE.md`'s runtime-mirror invariant. Adds new tests per the Test coverage section — CSS Modules short-circuit, non-module stylesheet stays side-effect, `.svg` no longer rejects, basename-ordering regression (`.module.scss` must not fall to the side-effect bucket via the `.scss` case).

Each PR is independent; order is suggestion, not requirement.

---

## Things I considered and rejected

- **Re-exports (`export { ... } from`, `export { default } from`, `export { default as name } from`, `export { name } from`, `export * from`, `export type { name } from`)** — initially included as "barrel patterns" but moved out of scope on a re-pass. The extension generates *import* statements for paste-into-file workflows; export-side barrel maintenance is a different operation conceptually closer to refactoring. Users maintaining barrels can do so manually or via dedicated barrel-management tools. Removing all re-export shapes also brings JS and TS down to 7 entries each — a leaner picker focused on the extension's actual job.
- **Custom user-defined templates** — analyzed in earlier conversation. Low ROI, high maintenance cost, scope drift. Skip.
- **Removing `preserveScriptFileExtension` / `preserveStylesheetFileExtension`** — both keep their weight. Script-side toggle is *more* relevant in 2026 (Node ESM, TS NodeNext, Deno, browser ESM all need extensions). Stylesheet-side is narrower but harmless. See the dedicated section above.
- **Fixing the broken Markdown reference-style image** — could split it into two lines (`SnippetString` supports `\n`) but reference-style image syntax is rarely used for file pastes. Removing is cleaner than fixing.
- **CSS cascade layers (`@import url('…') layer(name);`)** — real and modern (2022+) but advanced; most CSS authors don't use them. Add only if a user requests.
- **`async` script variant for HTML** — exists, has uses, but `defer` covers the common case better. Skip unless requested.
- **Reference-style Markdown link `[text][ref]`** — real Markdown but rarely used for file references. Skip.
- **Flipping `preserveScriptFileExtension` default to `true`** — defensible given Node ESM trajectory, but a behavior change for existing users. Separate decision.
- **JSX/TSX component-import shapes for SVG (`import { ReactComponent as Logo } from './logo.svg'`, `import Logo from './logo.svg?react'`)** — framework-specific (CRA-deprecated; Vite-only suffix). The portable default-import-as-URL shape is in scope; component shapes are not.
- **JS import attributes (`import json from './data.json' with { type: 'json' };`)** — TC39 Stage 3, shipping in Node 22+, V8, and Deno; legacy `assert { type: 'json' }` is being phased out. Real and modern, but source-type-conditional: the attribute applies only to JSON (and a few CSS-modules-in-ESM proposals). Doesn't slot into the "user picks a style" registry model — a JSON-only style mostly duplicates the existing default-import shape with a clause that's ignored for every non-JSON source. Skip; revisit if Node ESM JSON imports become mandatory in mainstream toolchains (today only required under strict-loader configs).
- **Raw / data-loader imports for `.graphql`, `.gql`, `.txt`, `.csv` in JSX/TSX** — too framework-specific. Skip.
