# Import Statements — Specification (v1)

> **Status:** Shipped. **Code:** `src/snippets/_styles.ts` (the `*_IMPORT_OPTIONS` tables + `resolveStyleIndex`), `src/snippets/languages/*.ts` (per-language `byStyle` switches), `src/snippets/_react.ts:buildAssetImportStatement` (the JSX/TSX/MDX non-script dispatch).
> **Why these shapes:** [decisions/statements.md](../decisions/statements.md) · **Rubric:** [../CRITERIA.md](../CRITERIA.md)

## Overview

Each destination language exposes a curated picker of import shapes — a `package.json` enum surfaced as a VS Code QuickPick. The selected shape becomes a VS Code `SnippetString` with tab stops. This document is the shipped per-language inventory: for each language, the **picker shapes** (the enum, in `package.json` order), the **default** (position 1), and the **snippet placeholder spec** (the exact `SnippetString` body). The per-language "Final list" tables here are the canonical target for the code's `*_IMPORT_OPTIONS` arrays in `src/snippets/_styles.ts`; the byte-matching `package.json` enum entries (three-site sync), the per-language `switch` cases in `src/snippets/languages/*.ts`, the JSX/TSX/MDX source-extension dispatch in `src/snippets/_react.ts`, the type unions in `src/types/file-extension.ts`, and the gating tables in `src/constants/extensions.ts` all match these tables as shipped.

In every "Final list" table, **position 1 is the default** (marked `← **default**`); the order is the `package.json:contributes.configuration.properties.<setting>.enum` order so the code copies directly. The **Status** column flags `new`, `legacy` (kept for back-compat), or blank for unchanged keepers.

## Default per setting

Every `package.json` setting carries a `default`. These are the shipped defaults. **5 are flagged below**: 3 are back-compat-affecting, 2 back new media settings. (Why each default is what it is, and the back-compat framing, lives in [decisions/statements.md](../decisions/statements.md).)

| Setting | Default |
|---------|---------|
| `preferences.importStatementPlacement` | `"Bottom"` |
| `script.preserveScriptFileExtension` | `false` |
| `script.javascriptImportStyle` | `"import name from '_relativePath_';"` |
| `script.typescriptImportStyle` | `"import { name } from '_relativePath_';"` |
| `styleSheet.preserveStylesheetFileExtension` | `false` |
| `styleSheet.cssImportStyle` | `"@import '_relativePath_';"` |
| `styleSheet.cssImageImportStyle` | `"url('_relativePath_')"` |
| `styleSheet.scssImportStyle` | **`"@use '_relativePath_';"`** (changed) |
| `styleSheet.scssImageImportStyle` | `"url('_relativePath_')"` |
| `markup.htmlScriptImportStyle` | **`"<script src=\"_relativePath_\"></script>"`** (changed) |
| `markup.htmlImageImportStyle` | `"<img src=\"_relativePath_\" alt=\"sample\">"` |
| `markup.htmlStyleSheetImportStyle` | `"<link href=\"_relativePath_\" rel=\"stylesheet\">"` |
| `markup.markdownImportStyle` | `"[text](_relativePath_)"` |
| `markup.markdownImageImportStyle` | **`"![alt-text](_relativePath_)"`** (changed) |
| `markup.htmlVideoImportStyle` | `"<video src=\"_relativePath_\" controls></video>"` (new) |
| `markup.htmlAudioImportStyle` | `"<audio src=\"_relativePath_\" controls></audio>"` (new) |

**The 5 flagged rows:**

*3 changed (all back-compat-affecting):*

1. **SCSS** `@import '…';` → `@use '…';`
2. **HTML script** drops the redundant `type="text/javascript"`
3. **Markdown image** drops the `"Hover text"` title — bare inline

*2 new media settings:*

4. **HTML video** `<video src="…" controls></video>` (new `htmlVideoImportStyle` setting)
5. **HTML audio** `<audio src="…" controls></audio>` (new `htmlAudioImportStyle` setting)

Existing users who customised a setting keep their persisted value — defaults apply only to fresh installs and explicit resets. Existing users on a **removed** value fall back automatically to the new default; see [Removed-value fallback policy](#removed-value-fallback-policy).

## Picker inventory (counts)

Per-setting enum size, as shipped. (The soft picker-bloat ceiling and its rationale live in [../CRITERIA.md](../CRITERIA.md).)

| Setting | Entries | Notes |
|---------|---------|-------|
| JS | 7 | At sweet spot |
| TS | 7 | At sweet spot |
| SCSS | 5 | Room to grow if a high-ROI shape lands |
| HTML script | 5 | At sweet spot |
| HTML image | 3 | Room to grow |
| HTML video | 4 | Media setting (default `<video controls>`) |
| HTML audio | 2 | Media setting (default `<audio controls>`) |
| CSS | 2 | `@import` quoted-path vs. `url()` |
| MD image | 3 | HTML `<img>` escape hatch for CLS dimensions; pure Markdown can't express them |
| CSS image, MD link, HTML stylesheet | 1 | UI-parity-only — single hardcoded shape, never hits `resolveStyleIndex` (syntax ceiling: nothing canonical to add) |
| **JSX/TSX/MDX non-script dispatch** (hardcoded `_react.ts:buildAssetImportStatement` switch) | 1 guard + 3 switch groups (CSS Modules guard / default-import / media+text-track URL / side-effect) | Not a `package.json` setting — groups are coarser-grained than enum entries (each group covers many source extensions). The CSS-Modules basename guard sits *before* the switch; within the switch, default-import is the 1st group, media+text-track URL the 2nd (the 3rd distinct shape overall), side-effect the 3rd, with a `null` default for anything that slipped past gating. Each group carves a genuinely-distinct semantic (default-import vs. side-effect vs. URL vs. CSS-Modules-class-map), not a per-extension variant. |

> The `scssImageImportStyle` setting exists in `package.json` for UI parity but is **not consumed** at runtime — there is no `SCSS_IMAGE_IMPORT_OPTIONS` table; SCSS image sources reuse `buildCssImageImportSnippet`. It is therefore not a distinct row above.

---

## Per-language picker shapes

Each section: the shipped enum (the "Final list"), with position 1 as the default.

### JavaScript (`JAVASCRIPT_IMPORT_OPTIONS`)

| # | Shape | Status |
|---|-------|--------|
| 1 | `import name from '_relativePath_';` | ← **default** |
| 2 | `import { name } from '_relativePath_';` | |
| 3 | `import name, { other } from '_relativePath_';` | new |
| 4 | `import * as name from '_relativePath_';` | |
| 5 | `import '_relativePath_';` | |
| 6 | `const name = require('_relativePath_');` | |
| 7 | `const name = await import('_relativePath_');` | new (replaces removed `var`/`const` non-`await` dynamic forms) |

### TypeScript (`TYPESCRIPT_IMPORT_OPTIONS`)

| # | Shape | Status |
|---|-------|--------|
| 1 | `import { name } from '_relativePath_';` | ← **default** (Angular auto-naming) |
| 2 | `import name from '_relativePath_';` | |
| 3 | `import * as name from '_relativePath_';` | |
| 4 | `import '_relativePath_';` | |
| 5 | `import type { name } from '_relativePath_';` | new |
| 6 | `import { name, type Type } from '_relativePath_';` | new (TS 4.5+ inline modifier — mixed value + type imports) |
| 7 | `const name = await import('_relativePath_');` | new (dynamic import — sibling of JS shape 7) |

The TS default at index 1 (`import { name }`) is a back-compat anchor: legacy-Angular auto-naming (`generateAngularLegacyImportName`) fires **only at this index** — for paths matching a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component` / `.directive` / `.pipe` / `.service` / `.module`), validated against `/^[A-Za-z_$][\w$]*$/`, else `$1`. Indices 2–7 use `$1`. A *named* import is the TS default precisely because of this anchor; index 1 is not reordered.

### CSS (`CSS_IMPORT_OPTIONS`)

| # | Shape | Status |
|---|-------|--------|
| 1 | `@import '_relativePath_';` | ← **default** |
| 2 | `@import url('_relativePath_');` | |

CSS image: single entry `url('_relativePath_')` ← **default**.

### SCSS (`SCSS_IMPORT_OPTIONS`)

| # | Shape | Status |
|---|-------|--------|
| 1 | `@use '_relativePath_';` | ← **default** (Sass deprecated `@import` in 2022) |
| 2 | `@use '_relativePath_' as *;` | |
| 3 | `@use '_relativePath_' as name;` | new |
| 4 | `@forward '_relativePath_';` | new |
| 5 | `@import '_relativePath_';` | legacy — kept for back-compat; Sass-deprecated |

SCSS image: single entry `url('_relativePath_')` ← **default** (reuses CSS form).

### HTML script (`markup.htmlScriptImportStyle`) — 5 options

| # | Shape | Status |
|---|-------|--------|
| 1 | `<script src="_relativePath_"></script>` | ← **default** (modernized; `type` is the HTML5 default) |
| 2 | `<script src="_relativePath_" defer></script>` | new — modern best practice for non-critical scripts (preserves order; runs after parsing) |
| 3 | `<script type="module" src="_relativePath_"></script>` | new — ES modules in HTML |
| 4 | `<script src="_relativePath_" async></script>` | new — order-independent execution; right for analytics/ads/third-party tags |
| 5 | `<script type="text/javascript" src="_relativePath_"></script>` | legacy — was previous default; kept for back-compat |

### HTML image (`markup.htmlImageImportStyle`) — 3 options

| # | Shape | Status |
|---|-------|--------|
| 1 | `<img src="_relativePath_" alt="sample">` | ← **default** |
| 2 | `<img src="_relativePath_" alt="" loading="lazy">` | new — opt-in for below-fold images |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | new — Core Web Vitals CLS prevention; user fills in dimensions |

### HTML stylesheet (`markup.htmlStyleSheetImportStyle`) — 1 option

| # | Shape | Status |
|---|-------|--------|
| 1 | `<link href="_relativePath_" rel="stylesheet">` | ← **default** |

### Markdown link (`MARKDOWN_IMPORT_OPTIONS`)

| # | Shape | Status |
|---|-------|--------|
| 1 | `[text](_relativePath_)` | ← **default** |

### Markdown image (`MARKDOWN_IMAGE_IMPORT_OPTIONS`)

| # | Shape | Status |
|---|-------|--------|
| 1 | `![alt-text](_relativePath_)` | ← **default** — bare inline, most common form |
| 2 | `![alt-text](_relativePath_ "Hover text")` | was previous default; kept as opt-in for users who want the hover title |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | new — HTML embed for sizing; Core Web Vitals CLS prevention. Pure Markdown can't specify image dimensions; CommonMark / GFM / Pandoc / MkDocs / Docusaurus / VitePress / Astro all permit embedded HTML. |

### JSX / TSX / MDX non-script dispatch (`_react.ts:buildAssetImportStatement`)

JSX/TSX/MDX have no `package.json` enum of their own. Script sources delegate to the JS/TS finals above; non-script sources flow through `buildAssetImportStatement(sourceFileExt, importPath)`. The shape is a `.module.css`/`.module.scss` basename **guard before the switch**, then a 3-group `switch`; first match wins. `.mdx` destinations fall through to `tsx.ts` in `dispatch.ts` (identical import semantics); `.mdx` lives in `ScriptFileExtension`, `SCRIPT_FILE_EXTENSIONS`, and `CROSS_IMPORT_DESTINATIONS`. As a *source*, `.mdx` flows through the default-import group.

| # | Source extensions | Emits | Status |
|---|-------------------|-------|--------|
| guard | `.module.css` / `.module.scss` (basename match, *before* the switch) | `import ${1:styles} from '_relativePath_';` | CSS Modules default import |
| group 1 (default-import) | `.gif` / `.jpeg` / `.jpg` / `.png` / `.svg` / `.avif` / `.webp` / `.json` / `.html` / `.yml` / `.yaml` / `.md` / `.mdx` / `.pdf` (and `.vue` / `.svelte` / `.astro` — see [framework-components.md](framework-components.md)) | `import ${1:name} from '_relativePath_';` | `.svg`, `.avif`, `.pdf` added |
| group 2 (media + text-track) | `.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a` / `.vtt` (see [media-files.md](media-files.md)) | `import ${1:url} from '_relativePath_';` | media URL-import group |
| group 3 (side-effect) | `.woff` / `.woff2` / `.ttf` / `.eot` / `.css` / `.scss` | `import '_relativePath_';` (global stylesheets only) | narrowed — `.module.*` peeled out via the guard |
| `default:` | anything else | `null` → empty `SnippetString` (means an unsupported pair slipped past gating) | unchanged |

> **Structure note.** `buildAssetImportStatement` is **not** "four peer buckets." It is a `.module.css`/`.module.scss` basename **guard before the switch** (`src/snippets/_react.ts:52-54` → `import ${1:styles}`), then a 3-group `switch` (default-import `_react.ts:57-74`, media + text-track `_react.ts:75-83`, side-effect `_react.ts:84-90`), then a `null` `default:` (`_react.ts:91-92`). The CSS-module guard is pre-switch; within the `switch` the order is default-import, then media + text-track (the **2nd** of the three switch groups, the 3rd distinct shape overall), then side-effect (the **3rd** switch group). The media + text-track group's full design lives in [media-files.md](media-files.md). The same `buildAssetImportStatement` serves all three React-family destinations; `src/snippets/languages/{jsx,tsx}.ts` are thin wrappers that call `buildReactImport` with the appropriate script-source primary/fallback.

This surface has **no `package.json` enum** — its three-site sync is `types/file-extension.ts` ↔ `constants/extensions.ts` ↔ `_react.ts` (per `src/constants/CLAUDE.md`'s "Runtime mirror" invariant). Drift produces a silent `default:` → `null` → empty snippet → `'not-supported'` toast rather than the enum-mismatch failure mode that hits the other languages. CSS Modules detection is a basename test (`.endsWith('.module.css')` / `.endsWith('.module.scss')`) and short-circuits **before** the extension-only `switch` — otherwise `.module.scss` would fall into the side-effect group via the `.scss` case.

The `.svg`, `.avif`, and `.pdf` additions span two type-union categories: **images** (`.svg`, `.avif` → `types/file-extension.ts:ImageFileExtension` + `constants/extensions.ts:IMAGE_FILE_EXTENSIONS`; auto-flows into the `*_SUPPORTED_EXTENSIONS` tables via spread, so HTML/CSS/SCSS/MD destinations accept them for free) and **documents** (`.pdf` → a `DocumentFileExtension = '.pdf'` singleton union joined into `FileExtension`, **JSX/TSX/MDX-only by design** — no `*_SUPPORTED_EXTENSIONS` change). All three get a case in the `_react.ts:buildAssetImportStatement` non-script switch and its `variants.ts` mirror, joining the default-import group.

### Media files (video / audio / text track)

Full design: [media-files.md](media-files.md). As shipped:

- **Source extensions:** `.mp4`, `.webm`, `.mov` (video); `.mp3`, `.ogg`, `.wav`, `.m4a` (audio); `.vtt` (text track / WebVTT captions).
- **Type unions** (`src/types/file-extension.ts`): `VideoFileExtension`, `AudioFileExtension`, `TextTrackFileExtension`, `MediaFileExtension` (umbrella), all joined into `FileExtension`.
- **Gating** (`src/constants/extensions.ts`): `MEDIA_FILE_EXTENSIONS` (video + audio only — 7 entries) and `TEXT_TRACK_FILE_EXTENSIONS` (`.vtt`); both are spread together into `HTML_SUPPORTED_EXTENSIONS`. JSX/TSX/MDX accept via `CROSS_IMPORT_DESTINATIONS`. CSS / SCSS / Markdown do **not** gain media — no functional shape exists.
- **`determineImportType`** (`src/path/import-type.ts`): three new return values — `'video'`, `'audio'`, `'text-track'`.
- **JSX/TSX/MDX dispatch** — the media + text-track group in `_react.ts:buildAssetImportStatement`:

| Source extensions | Emits |
|-------------------|-------|
| `.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a` / `.vtt` | `import ${1:url} from '_relativePath_';` |

**HTML video** — `markup.htmlVideoImportStyle` (4 entries):

| # | Shape | Status |
|---|-------|--------|
| 1 | `<video src="_relativePath_" controls></video>` | ← **default** — accessibility-by-default |
| 2 | `<video src="_relativePath_" autoplay muted loop playsinline></video>` | new — silent autoplay (background video) |
| 3 | `<video src="_relativePath_" controls poster=""></video>` | new — poster image placeholder |
| 4 | `<video src="_relativePath_" controls preload="metadata"></video>` | new — avoids pre-buffering (Core Web Vitals) |

**HTML audio** — `markup.htmlAudioImportStyle` (2 entries):

| # | Shape | Status |
|---|-------|--------|
| 1 | `<audio src="_relativePath_" controls></audio>` | ← **default** |
| 2 | `<audio src="_relativePath_" controls preload="metadata"></audio>` | new — network-friendly preload |

**HTML text track** — hardcoded, no picker setting (single canonical shape):

| # | Shape | Status |
|---|-------|--------|
| 1 | `<track src="_relativePath_" kind="subtitles" srclang="en" label="English"></track>` | ← **default** |

---

## Snippet placeholder spec

The locked-in `SnippetString` shapes for every shipped entry, grouped by language. Each table is the canonical implementation reference: rows are one-to-one with the shipped `package.json` enum + `src/snippets/_styles.ts:ImportStyle[]` + the per-language `switch` in `src/snippets/languages/*.ts` (the three sync sites — see `src/snippets/CLAUDE.md`). Removed entries appear in a footnote under each table; they fall through to the language's default via the [Removed-value fallback policy](#removed-value-fallback-policy).

**Notation.** `${path}` denotes the relative-path expression (in code, the `relativePath` parameter / closure variable). `$1`, `$2`, `${1:default-text}` are VS Code `SnippetString` tab stops — written verbatim into the emitted snippet (the doc-source representation may need to escape `$` against JS template-literal interpolation — e.g. `` `\${1:text}` ``). Entries marked **kept** preserve their `switch`-case body byte-for-byte; **new** entries lock in the shape below; entries that are the new default also set the index-1 / `default:`-branch fallback shape.

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

**Removed entries (dropped from all three sync sites):** `import { default as name } from '_relativePath_';`, `var name = require('_relativePath_');`, `var name = import('_relativePath_');`, `const name = import('_relativePath_');`.

### TypeScript (`buildTypeScriptImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `import { name } from '_relativePath_';` | `` `import { $1 } from '${path}';` `` — **Legacy-Angular auto-naming applies *only at this index*** (back-compat support for the pre-standalone Angular filename convention): when `${path}` matches a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component`, `.directive`, `.pipe`, `.service`, `.module`), `generateAngularLegacyImportName()` (`src/snippets/languages/typescript.ts`) fills the `$1` tab stop with a PascalCase identifier derived from the basename, emitted as an **editable** placeholder `${1:…}` (e.g. `app-root.component.ts` → `import { ${1:AppRootComponent} } from '…'` — pre-filled but editable, exactly like a detected class name), validated against `/^[A-Za-z_$][\w$]*$/` (falls back to a bare `$1` if the derived name is not a legal identifier). The basename derivation strips a trailing `.ts` / `.tsx` / `.js` / `.jsx` *first* — load-bearing for `preserveScriptFileExtension: true`, which would otherwise fold the extension into the identifier (`AppRootComponentTs`). | ← **default** |
| 2 | `import name from '_relativePath_';` | `` `import $1 from '${path}';` `` | kept |
| 3 | `import * as name from '_relativePath_';` | `` `import * as $1 from '${path}';` `` | kept |
| 4 | `import '_relativePath_';` | `` `import '${path}';` `` | kept |
| 5 | `import type { name } from '_relativePath_';` | `` `import type { $1 } from '${path}';` `` | new |
| 6 | `import { name, type Type } from '_relativePath_';` | `` `import { $1, type $2 } from '${path}';` `` | new |
| 7 | `const name = await import('_relativePath_');` | `` `const $1 = await import('${path}');` `` | new |

**Removed entries (dropped from all three sync sites):** `import { default as name } from '_relativePath_';`. The index-1 default remains TS's legacy-Angular auto-naming anchor — preserving its position is load-bearing for the back-compat support; index 1 is not reordered.

### SCSS (`buildScssImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `@use '_relativePath_';` | `` `@use '${path}';` `` | ← **default** (was `@import`; Sass deprecated `@import` in 2022) |
| 2 | `@use '_relativePath_' as *;` | `` `@use '${path}' as ${1:*};` `` — wildcard `*` is the editable default; a keystroke replaces it with a named alias. | kept |
| 3 | `@use '_relativePath_' as name;` | `` `@use '${path}' as $1;` `` | new |
| 4 | `@forward '_relativePath_';` | `` `@forward '${path}';` `` — no user placeholder; `@forward` re-exports the whole module. | new |
| 5 | `@import '_relativePath_';` | `` `@import '${path}';` `` | legacy — kept for back-compat; Sass-deprecated |

All rows reuse SCSS's path-prep pipeline: `normalizePartialFilename()` strips a leading `_` from the basename; `determineScssExtension()` always preserves `.css`, and respects `preserveStylesheetFileExtension` for other source types.

**SCSS image:** no SCSS-specific shape — reuses `buildCssImageImportSnippet` from `css.ts` (see CSS image entry below).

**Removed entries (dropped from all three sync sites):** `@import url('_relativePath_');`.

**Follow-on (separate file):** `@forward` markers were added to the `IMPORT_INDICATORS` array in `src/editor/placement.ts` so "Bottom" placement still detects `@forward`-only files.

### CSS (`buildCssImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `@import '_relativePath_';` | `` `@import '${path}';` `` | ← **default** |
| 2 | `@import url('_relativePath_');` | `` `@import url('${path}');` `` | kept |

**CSS image (`buildCssImageImportSnippet` — hardcoded, single entry; also used for SCSS image sources):**

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `url('_relativePath_')` | `` `url('${path}')` `` — no tab stop; single fixed shape (spec-fixed). | ← **default** |

### HTML script (`buildHtmlScriptImportSnippetByStyle`)

`html.ts` previously had only hardcoded shapes — this surface introduced the `byStyle` function.

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<script src="_relativePath_"></script>` | `` `<script src="${path}"></script>` `` | ← **default** (was `<script type="text/javascript" src="…"></script>`; modernized — `type` is the HTML5 default) |
| 2 | `<script src="_relativePath_" defer></script>` | `` `<script src="${path}" defer></script>` `` | new |
| 3 | `<script type="module" src="_relativePath_"></script>` | `` `<script type="module" src="${path}"></script>` `` | new |
| 4 | `<script src="_relativePath_" async></script>` | `` `<script src="${path}" async></script>` `` — no user placeholder; `async` is an attribute, not a tab stop. | new |
| 5 | `<script type="text/javascript" src="_relativePath_"></script>` | `` `<script type="text/javascript" src="${path}"></script>` `` | legacy — was previous default; kept for back-compat |

### HTML image (`buildHtmlImageImportSnippetByStyle`)

Same structural change as HTML script — previously hardcoded; this surface introduced the `byStyle` function.

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<img src="_relativePath_" alt="sample">` | `` `<img src="${path}" alt="sample">` `` — preserved verbatim from the existing hardcode for default-position parity. | ← **default** |
| 2 | `<img src="_relativePath_" alt="" loading="lazy">` | `` `<img src="${path}" alt="$1" loading="lazy">` `` — tab stop on `alt`; empty default preserves the decorative-by-default semantic (a UX improvement over the index-1 hardcoded `alt="sample"`). | new |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | `` `<img src="${path}" alt="$1" width="$2" height="$3">` `` — three tab stops walk alt → width → height in semantic order. | new |

### HTML stylesheet (`buildHtmlStylesheetImportSnippet` — hardcoded, single entry)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `<link href="_relativePath_" rel="stylesheet">` | `` `<link href="${path}" rel="stylesheet">` `` | ← **default** |

### Markdown link (`buildMarkdownImportSnippet` — hardcoded, single entry)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `[text](_relativePath_)` | `` `[${1:text}](${path})` `` — tab stop on link text with `text` as the editable default. | ← **default** |

### Markdown image (`buildMarkdownImageImportSnippetByStyle`)

| # | Enum `description` | `SnippetString` shape | Status |
|---|---|---|---|
| 1 | `![alt-text](_relativePath_)` | `` `![${1:alt-text}](${path})` `` | ← **default** (bare inline — most common form in the wild) |
| 2 | `![alt-text](_relativePath_ "Hover text")` | `` `![alt-text](${path} "Hover text")` `` — preserved verbatim from the existing hardcode (no tab stops; was the previous default, now kept as opt-in for users who want the hover title). | kept |
| 3 | `<img src="_relativePath_" alt="" width="" height="">` | `` `<img src="${path}" alt="$1" width="$2" height="$3">` `` — three tab stops; same shape as the HTML image picker's CLS variant. | new — HTML embed for sizing; Core Web Vitals CLS prevention |

**Removed entries (dropped from all three sync sites):** `![alt-text][image] / [image]: _relativePath_ "Hover text"`. The literal `/` separator is not valid Markdown — genuine reference-style is two lines, which doesn't fit the snippet model.

### JSX/TSX/MDX non-script sources (`_react.ts:buildAssetImportStatement` — a basename guard + hardcoded `switch`, not a `byStyle` function)

A CSS-module basename guard before the switch, then three switch groups in declaration order; first match wins. **There is no `package.json` enum for this surface** — its three-site sync is `types/file-extension.ts` ↔ `constants/extensions.ts` ↔ `_react.ts` (per `src/constants/CLAUDE.md`'s "Runtime mirror" invariant). Drift produces a silent `default:` → `null` → empty snippet → `'not-supported'` toast rather than the enum-mismatch failure mode that hits the other languages. The same `buildAssetImportStatement` serves all three React-family destinations — `src/snippets/languages/{jsx,tsx}.ts` are thin wrappers that call `buildReactImport` with the appropriate script-source primary/fallback (`.mdx` destinations fall through to `tsx.ts`).

| # | Source extensions | `SnippetString` shape | Status |
|---|---|---|---|
| guard | `.module.css` / `.module.scss` (**basename match — dispatched before the switch** at `_react.ts:52-54`, otherwise `.module.scss` would fall into the side-effect group via the `.scss` case) | `` `import ${1:styles} from '${path}';` `` — `styles` is the universal CSS-Modules naming convention. | CSS Modules default import (fixes the bug where `Foo.module.css` emitted the side-effect shape) |
| group 1 (default-import, `_react.ts:57-74`) | `.gif` / `.jpeg` / `.jpg` / `.png` / `.svg` / `.avif` / `.webp` / `.json` / `.html` / `.yml` / `.yaml` / `.md` / `.mdx` / `.pdf` / `.vue` / `.svelte` / `.astro` | `` `import ${1:name} from '${path}';` `` | `.svg`, `.avif`, `.pdf` added to the existing default-import group (`.vue`/`.svelte`/`.astro` joined later — see [framework-components.md](framework-components.md)) |
| group 2 (media + text-track, `_react.ts:75-83`) | `.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a` / `.vtt` | `` `import ${1:url} from '${path}';` `` — `url` signals URL-ness; consistent across video/audio/text-track. | media + text-track URL-import group (see [media-files.md](media-files.md)) |
| group 3 (side-effect, `_react.ts:84-90`) | `.woff` / `.woff2` / `.ttf` / `.eot` / `.css` / `.scss` | `` `import '${path}';` `` — side-effect import; global stylesheets only. | narrowed — `.module.*` peeled out via the guard |
| `default:` (`_react.ts:91-92`) | anything else | `null` → `buildReactImport` wraps as an empty `SnippetString` | unchanged |

JSX/TSX/MDX *script* sources delegate to JS/TS via `_react.ts:buildReactImport`'s `primarySnippet` / `fallbackSnippet` parameters — every JS/TS shape from the tables above flows through automatically; no JSX/TSX/MDX-specific script work.

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

## Removed-value fallback policy

When a user's persisted `settings.json` value matches an enum entry that was removed, the system **automatically falls back to the language's default shape**:

1. `resolveStyleIndex(table, configValue)` (`src/snippets/_styles.ts:7`) returns `undefined` because the removed `description` no longer matches any entry in the table.
2. The per-language `buildXImportSnippetByStyle` `switch` enters its `default:` branch.
3. That `default:` branch emits the default shape.

Removed-value users transparently get the new default with zero broken pastes. This is also the byte-exact `description` ↔ `package.json` enum contract: drift = a silent `undefined`.

**Invariant:** each `default:` branch emits the **shipped default**, not the old one. The three default changes required three matching `default:` branch states:

- `scss.ts:buildScssImportSnippetByStyle` — `default:` returns `@use '${relativePath}';` (was `@import '${relativePath}';`).
- `markdown.ts:buildMarkdownImageImportSnippetByStyle` — `default:` returns bare inline `![alt-text](${relativePath})` (was inline-with-title).
- `html.ts:buildHtmlScriptImportSnippetByStyle` — introduced as a new `byStyle` switch (per the three-site-sync rule); its `default:` branch emits `<script src="${relativePath}"></script>` — the minimal default — *not* the legacy `type="text/javascript"` form.

---

## Code map

- `src/snippets/_styles.ts` — the `*_IMPORT_OPTIONS` tables (canonical target for the "Final list" tables above), `ImportStyle[]`, and `resolveStyleIndex` at `_styles.ts:7` (undefined-on-no-match routes to the per-language `default:` branch).
- `src/snippets/languages/*.ts` — per-language `buildXImportSnippetByStyle` switches (`typescript.ts` also holds `generateAngularLegacyImportName` + `LEGACY_ANGULAR_FILE_SUFFIXES`; `css.ts` holds `buildCssImageImportSnippet`).
- `src/snippets/_react.ts` — `buildReactImport` (`_react.ts:17`) and the JSX/TSX/MDX non-script `buildAssetImportStatement` switch (`_react.ts:48-94`: guard `52-54`, default-import `57-74`, media+text-track `75-83`, side-effect `84-90`, `default: null` `91-92`).
- `src/snippets/variants.ts` — the `buildReactNonScriptVariant` mirror of the asset switch.
- `src/snippets/dispatch.ts` — destination-extension routing.
- `src/types/file-extension.ts` — the extension type unions (`ImageFileExtension`, `DocumentFileExtension`, media unions).
- `src/constants/extensions.ts` — the runtime gating tables (`IMAGE_FILE_EXTENSIONS`, `MEDIA_FILE_EXTENSIONS`, `TEXT_TRACK_FILE_EXTENSIONS`, the `*_SUPPORTED_EXTENSIONS` lists).
- `src/editor/placement.ts` — `IMPORT_INDICATORS` (carries the `@forward` marker).

## See also

- [decisions/statements.md](../decisions/statements.md) — why each shape is in or out: per-language critiques, the default-change rationale, and the "things considered and rejected" ledger.
- [../CRITERIA.md](../CRITERIA.md) — the rubric these picker shapes apply.
- [framework-components.md](framework-components.md) — the `.vue`/`.svelte`/`.astro` default-import-as-component destinations.
- [media-files.md](media-files.md) — the media + text-track design.
- [`src/snippets/CLAUDE.md`](../../../src/snippets/CLAUDE.md) — the three-site sync rules (`package.json` ↔ `_styles.ts` ↔ per-language `switch`).
