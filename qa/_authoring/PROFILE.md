# PROFILE.md — destination profile table (the IR)

> **Status: frozen.** Populated in Session 2 (`populate-profile`) by reading the extension
> source; every value below is source-derived (file:line provenance in the section notes). This
> file is now the single per-destination input — alongside `RECIPE.md` — that each per-language
> generation reads. A destination's behavior changes only by editing its row here and
> regenerating, **never** by hand-editing a generated checklist.

The intermediate representation the whole pipeline compiles from:

```
source code  →  PROFILE.md (IR)  →  ../checklists/{lang}.md (output)
                     ↑
              human-reviewed, frozen
```

One row per destination — **12 destinations**: `.ts` `.js` `.jsx` `.tsx` `.mdx`
`.css` `.scss` `.html` `.md` `.vue` `.svelte` `.astro`. (`.tsx` and `.mdx` are
separate rows even though `.mdx` is byte-identical to `.tsx`.) Each row carries
**six fields**. Everything a generator needs must be derivable from these fields: if
a checklist behavior has no home in a field below, the field is incomplete.

## Field index

| Field | What it encodes |
|-------|-----------------|
| `gating` | Same-extension-only, allow-list cross-import, or accept-all? Which `*_SUPPORTED_EXTENSIONS` table (if any) applies? |
| `styles` | Single style table, source-type dispatch, or source-extension dispatch — and the branch→shape map, including fixed/hardcoded shapes that live in no options table |
| `smartId` | Exported-class detection and/or Angular legacy PascalCase — and which styles they affect |
| `defaultStyle` | The default style index **and** its rendered output string |
| `placement` | How the Top/Bottom/Cursor setting is honored, the insertion column, and any container the import is clamped inside |
| `pathQuirks` | Extension-preservation namespace + special path normalization |

## Populated by reading the extension source code

Session 2 filled each field from these source-of-truth files:

| Field | Source files |
|-------|--------------|
| `gating` + `SOURCE_UNIVERSE` | `src/gating.ts`, `src/constants/extensions.ts`, `src/types/file-extension.ts` |
| `styles` + fixed asset shapes | `src/snippets/variants.ts`, `src/snippets/dispatch.ts`, `src/snippets/_styles.ts`, `src/snippets/_react.ts` (incl. the shared `buildAssetImportStatement`), `src/snippets/languages/framework-component.ts`; source-ext→branch map from `src/path/import-type.ts` |
| `smartId` | `src/snippets/languages/typescript.ts`, `src/snippets/_class-name.ts`, `src/snippets/variants.ts` |
| `defaultStyle` | `package.json` (`contributes.configuration` enums + `default`) |
| `placement` | `src/editor/placement.ts`, `src/editor/insert-snippet.ts` |
| `pathQuirks` | `src/snippets/languages/{scss,css,html,markdown}.ts` |

---

## Deltas from design-spec prose

One per-destination value is taken from the **code**, which the design spec
(`.claude/_archive/qa-pipeline/QA-PIPELINE-SPEC.md` §4, archived) describes incorrectly. The IR is source-derived (§2
mental model) and the generated checklists are tested against the *running* extension, so the
code is authoritative here. Recorded for the frozen-review step; reconciling §4.4 of the
design spec is a separate follow-up.

> The former Delta #1 (`styles` · `.vue`/`.svelte`/`.astro`) was **resolved** by `a85af78`:
> framework non-script sources now route through the shared `buildAssetImportStatement`, so the
> code matches the spec §4.3 prose (non-script → fixed asset shapes). Only the smartId deviation
> below remains.

| # | Row | Spec §4 prose | Code (authoritative) | Provenance |
|---|-----|---------------|----------------------|------------|
| 2 | `smartId` · `.tsx`/`.mdx` | none | **Angular-PascalCase on style 0** for `.ts`/`.tsx` sources (exported-class half correctly absent) | `tsx.ts:8-15` → `_react.ts:24-25` → `typescript.ts:38-44,64-78` |

---

## Source universe (shared, frozen)

The closed `FileExtension` set (`src/types/file-extension.ts`, mirrored at runtime in
`src/constants/extensions.ts`). Every destination's `gating` reject column is the mechanical
complement `SOURCE_UNIVERSE − accept-list`.

| Category | Members |
|----------|---------|
| script | `.ts` `.tsx` `.mdx` `.js` `.jsx` |
| framework | `.vue` `.svelte` `.astro` |
| stylesheet | `.css` `.scss` |
| html | `.html` |
| markdown | `.md` |
| image — `IMAGE_FILE_EXTENSIONS` | `.gif` `.jpeg` `.jpg` `.png` `.svg` `.avif` `.webp` |
| media (video + audio) — `MEDIA_FILE_EXTENSIONS` | `.mp4` `.webm` `.mov` · `.mp3` `.ogg` `.wav` `.m4a` |
| text-track — `TEXT_TRACK_FILE_EXTENSIONS` | `.vtt` |
| data | `.json` `.yaml` `.yml` |
| fonts | `.woff` `.woff2` `.ttf` `.eot` |
| document | `.pdf` |

> `MEDIA_FILE_EXTENSIONS` is video+audio only; `.vtt` lives in `TEXT_TRACK_FILE_EXTENSIONS`. Both
> are spread together into the HTML/Vue/Svelte/Astro accept-lists.

## `gating` per destination

Three kinds (`src/gating.ts:isPairSupported` + the `*_SUPPORTED_EXTENSIONS` tables in
`src/constants/extensions.ts`). Accept-lists below are the **literal** table members; the reject
set is `SOURCE_UNIVERSE − accept`.

| Dest | Kind | Accepts (literal) |
|------|------|-------------------|
| `.ts` | same-only | `.ts` only — every other source → `Cannot import .X into .ts files.` |
| `.js` | same-only | `.js` only — every other source → `Cannot import .X into .js files.` |
| `.css` | allow-list | `CSS_SUPPORTED_EXTENSIONS` = `.css` + image |
| `.scss` | allow-list | `SCSS_SUPPORTED_EXTENSIONS` = `.scss` `.css` + image **(one-way: SCSS imports CSS; CSS rejects `.scss`)** |
| `.md` | allow-list | `MARKDOWN_SUPPORTED_EXTENSIONS` = `.md` + image **(no media, no `.vtt`)** |
| `.html` | allow-list | `HTML_SUPPORTED_EXTENSIONS` = `.js` `.css` + image + media + `.vtt`. **`.html`→`.html` rejected** (table omits `.html`; explicit clause `gating.ts:20-22`) — §1 carries a `.html`→`.html` *rejection* row. |
| `.vue` | allow-list | `VUE_SUPPORTED_EXTENSIONS` = `.vue` `.ts` `.js` `.jsx` `.tsx` `.json` `.yml` `.yaml` + image + media + `.vtt` |
| `.svelte` | allow-list | `SVELTE_SUPPORTED_EXTENSIONS` = `.svelte` `.ts` `.js` `.jsx` `.tsx` `.json` `.yml` `.yaml` + image + media + `.vtt` |
| `.astro` | allow-list | `ASTRO_SUPPORTED_EXTENSIONS` = `.astro` `.ts` `.js` `.jsx` `.tsx` `.vue` `.svelte` `.json` `.yml` `.yaml` `.md` `.mdx` + image + media + `.vtt` |
| `.jsx` | accept-all | every source (in `CROSS_IMPORT_DESTINATIONS`, no per-dest clause) — no source-ext reject rows; only the universal same-file reject (general.md) |
| `.tsx` | accept-all | every source |
| `.mdx` | accept-all | every source |

> `.vue`/`.svelte`/`.astro` are the only destinations that accept data (`.json`/`.yaml`/`.yml`);
> every allow-list destination rejects fonts and `.pdf`. The RECIPE item-1 reject column samples
> ≥1 member from each reject category present.

## `styles` per destination

Dispatch structure + the configurable tables (named by `TABLE (count)` — Phase A re-reads their
literal strings + tab-stops from `_styles.ts`) + the **fixed/hardcoded shapes** frozen here
(they live only in builder code). Source-extension → bucket routing is `determineImportType`
(`src/path/import-type.ts`).

| Dest | Dispatch | Shapes |
|------|----------|--------|
| `.ts` | single table | `TYPESCRIPT_IMPORT_OPTIONS` (7) |
| `.js` | single table | `JAVASCRIPT_IMPORT_OPTIONS` (7) — **default ≠ `.ts`**, see `defaultStyle` |
| `.tsx` / `.mdx` | source-**extension** | `.ts`/`.tsx` → TS (7); `.js`/`.jsx` → JS (7, fallback); non-script → fixed asset shapes. `.mdx` identical to `.tsx`. |
| `.jsx` | source-**extension** | `.js`/`.jsx` → JS (7); non-script → fixed asset shapes; **`.ts`/`.tsx` source → empty `SnippetString` (nothing inserted), 0 picker variants** |
| `.css` | source-**type** | stylesheet → `CSS_IMPORT_OPTIONS` (2); image → fixed `url('<path>')` (table `CSS_IMAGE_IMPORT_OPTIONS` dormant — single shape, no picker) |
| `.scss` | source-**type** | stylesheet → `SCSS_IMPORT_OPTIONS` (5); image → fixed `url('<path>')` (reuses the CSS image builder; `scssImage` setting dormant) |
| `.html` | source-**type** (6) | script `HTML_SCRIPT_IMPORT_OPTIONS` (5) · image `HTML_IMAGE_IMPORT_OPTIONS` (3) · video `HTML_VIDEO_IMPORT_OPTIONS` (4) · audio `HTML_AUDIO_IMPORT_OPTIONS` (2) · stylesheet fixed `<link href="<path>" rel="stylesheet">` · text-track fixed `<track …>`. The image/video/audio **style-0 entries are tagless** (description falls back to full text). |
| `.md` | source-**type** | markdown → fixed `[${1:text}](<path>)` (hardcoded; `markdown` setting dormant; **not** in the image style count) · image → `MARKDOWN_IMAGE_IMPORT_OPTIONS` (3) |
| `.vue` / `.svelte` / `.astro` | `framework-component.ts` | source-**extension** split: **script** (`.ts`/`.tsx`/`.js`/`.jsx`) → `TYPESCRIPT_IMPORT_OPTIONS` (7), style-0 Angular PascalCase, no exported-class fill, styles 1–6 bare `$1`; **non-script** → fixed asset shapes (shared `buildAssetImportStatement`). Script paths honor `preserve`; non-script keep the full ext. Fonts/plain-stylesheets/CSS-modules are gated out, so only the named-default + url-default arms are reachable. |

**Fixed non-script asset shapes** (shared by the React trio **and** the framework trio
(`.vue`/`.svelte`/`.astro`) — `src/snippets/_react.ts:buildAssetImportStatement`, the single
canonical asset switch, called by `buildReactImport`, `variants.ts:buildReactNonScriptVariant`,
and `languages/framework-component.ts`; full source extension **always** kept; each is a SINGLE
variant → Pick Style direct-inserts, Set Default reports a fixed style):

1. **CSS module** (`*.module.css` / `*.module.scss`, checked **first** so it beats the side-effect shape) → `import ${1:styles} from '<path>';`
2. image / doc / component (`.gif .jpeg .jpg .png .svg .avif .webp .json .html .yml .yaml .md .mdx .pdf .vue .svelte .astro`) → `import ${1:name} from '<path>';`
3. av / text-track (`.mp4 .webm .mov .mp3 .ogg .wav .m4a .vtt`) → `import ${1:url} from '<path>';`
4. font / stylesheet (`.woff .woff2 .ttf .eot .css .scss`) → `import '<path>';` (side-effect, no tab stop)

**`determineImportType` source-extension → bucket** (the `{ext}.ts` builders consume these as
*bucket labels*; the extension→bucket binding lives only here): script `.js .jsx .ts .tsx .vue
.svelte .astro` · stylesheet `.css` · markdown `.md` · video `.mp4 .webm .mov` · audio `.mp3
.ogg .wav .m4a` · text-track `.vtt` · `.html`/`.scss` → `null` · default → `image`.

## `smartId` per destination

Two independent mechanisms — exported-class detection and Angular-legacy PascalCase. Both touch
**style 0 only**; styles 1–6 always emit bare `$1`.

| Dest | `smartId` |
|------|-----------|
| `.ts` | **both** — exported-class (`readExportedClassName`, called by `typescript.ts:buildSnippet` + `variants.ts` `.ts` case) **and** Angular PascalCase. A detected class beats Angular. |
| `.tsx` / `.mdx` | **Angular-PascalCase only** (style 0), for `.ts`/`.tsx` sources via the TS-primary path; **no exported-class fill** (`readExportedClassName` is never called for tsx/mdx). `.js`/`.jsx` sources → JS builder → none. [Delta #2] |
| `.vue` / `.svelte` / `.astro` | **Angular-PascalCase only** (style 0), **script sources only** via the TS builder; non-script sources take fixed asset shapes and never reach Angular naming. `framework-component.ts` calls `buildTypeScriptImportSnippet` *without* a `detectedImportName`, so exported-class fill is inert but `generateAngularLegacyImportName` still fires. (Unlike `.tsx`/`.mdx`, a `.js`/`.jsx` script source **does** reach Angular here — all four script exts route to the TS builder.) |
| `.js` `.jsx` `.css` `.scss` `.html` `.md` | **none** |

**Exported-class half** (`.ts` only, style 0): `EXPORTED_CLASS_PATTERN =
/^export\s+(?:abstract\s+)?class\s+(\w+)/m`. Matches `export class Name` / `export abstract class
Name`; **not** `export default class`. Comments are stripped before the (non-global) scan, so
`// export class` / `/* export class */` → bare `$1`; multiple classes → **first** only;
detection is **column-0 / top-level** (line-anchored).

**Angular-PascalCase half** (every dest routing through `buildTypeScriptImportSnippetByStyle`
style 0 — `.ts` `.tsx` `.mdx` `.vue` `.svelte` `.astro`): `LEGACY_ANGULAR_FILE_SUFFIXES`, matched
by `relativePath.includes(suffix)`; derivation = strip script ext → basename → `.`→`-` →
PascalCase each segment.

| Suffix | Identifier (`user.<suffix>.ts`) |
|--------|---------------------------------|
| `.component` | `UserComponent` |
| `.directive` | `UserDirective` |
| `.pipe` | `UserPipe` |
| `.service` | `UserService` |
| `.module` | `UserModule` |

A path matching **no** suffix → bare `$1` (not a PascalCased basename). The trailing
`.ts`/`.tsx`/`.js`/`.jsx` is stripped **before** deriving the name, so the identifier is
**stable** across `preserveScriptFileExtension` on/off (never `…ComponentTs`) — only the path
string changes. The derived PascalCase name is then validated against `/^[A-Za-z_$][\w$]*$/`
(`typescript.ts:75`); an illegal result — a basename with a space or a leading digit, e.g.
`2fa.service` → `2faService` (fails the leading-char class) — falls back to bare `$1` **even
when a suffix matched** (added in `b0a2505`; applies to every Angular-routed dest).

## `placement` per destination

Mode (`src/editor/placement.ts` + `src/editor/insert-snippet.ts`), insertion column, container,
comment adjustment. One mode per destination / source-type.

| Mode | Destinations | Behavior |
|------|--------------|----------|
| `generic` | `.ts` `.js` `.jsx` `.tsx` `.mdx` | Full Top/Bottom/Cursor; **column 0**. Bottom = after the last non-comment line containing an `IMPORT_INDICATORS` marker (empty/comments-only → line 0). Top = line 0. Cursor = `adjustForCommentBlock` (a `/* */` block or grouped `//` run pushes the import above; a lone `//` inserts at the line). **`.mdx` is `generic`/column-0** — the explicit counter-case to `.md`. |
| `stylesheet` | `.css` `.scss` (stylesheet source) | Like `generic` (column 0, honors the setting) but Bottom anchors after the last `@use`/`@forward`/`@import` line — an observably different anchor. |
| `inline-url` | `.css` `.scss` (image / non-stylesheet source) | The `isInlineSnippet` exception (precedes every placement branch): insert the `url('<path>')` value at the **exact** cursor/drop line **and column**, **no** trailing newline, **no** column-0 forcing. The placement setting has **no effect**. |
| `forced-cursor` | `.html` `.md` | Insert at the **cursor line** always (Top/Bottom/Cursor have no effect); column **follows the cursor** (not forced to 0). Comment-block adjustment applies; `.md` uses the markdown-star quirk. |
| `astro-frontmatter` | `.astro` | Top/Bottom/Cursor honored but **constrained within the `---` fences** (Top = after the opening `---`; Bottom = after the last `IMPORT_INDICATORS` line within the fences, fallback just after the opening `---`; Cursor = cursor line only when strictly between the fences, else Bottom-within-fences). No fences → a new `---\n<import>\n---\n` block at line 0; all three modes converge. Inserted lines adopt the block's detected indentation. |
| `sfc-script` | `.vue` `.svelte` | Same shape as `astro-frontmatter`, bounded by the `<script>` block: selection prefers `<script setup>` over an instance `<script>` (no `context=`) over any `<script>`. No `<script>` → a new `<script>\n<import>\n</script>\n` block at line 0. |

**`IMPORT_INDICATORS`** (the 9 Bottom-anchor markers): `import ` · `require(` · `@import '` ·
`@import "` · `@import url(` · `@use '` · `@use "` · `@forward '` · `@forward "`. A `require(`
line counts; an `import ` substring **inside a string literal** is a (false-positive) marker;
commented-out marker lines (`//`, `/*`, leading `*`) are skipped.

**Markdown-star quirk** (`.md` and `.mdx` only): a line whose first non-whitespace char is `*`
is treated as **content** (bullet / `*italic*` / `**bold**` / `***`), **not** a block-comment
continuation, when deciding Cursor comment-block adjustment. So in `.md`/`.mdx` a Cursor
insertion lands **at** a leading-`*` line; in every other destination (incl. `.tsx`) that line
is a comment continuation and the import is pushed **above** it. (`//` and `/*` still adjust
above in `.md`/`.mdx`; only leading `*` is reclassified.)

## `pathQuirks` per destination

Extension-preservation is **two-namespaced** — the script key `preserveScriptFileExtension` and
the stylesheet key `preserveStylesheetFileExtension` are different settings.

| Dest | `pathQuirks` |
|------|--------------|
| `.scss` | `_partial` normalization (strip leading `_` of last segment) + a `.css` source **always** preserves `.css` (neither toggle) + every other stylesheet source respects **`preserveStylesheetFileExtension`** → `./partial` off vs `./partial.scss` on |
| `.css` | `@import` path **always** keeps the full source extension; respects **neither** toggle |
| `.ts` `.js` `.jsx` `.tsx` `.mdx` | respect **`preserveScriptFileExtension`** (script sources); for `.jsx`/`.tsx`/`.mdx`, **non-script** asset imports always keep the full extension (not toggled) |
| `.html` `.md` | always preserve the full extension (no toggle) |
| `.vue` `.svelte` `.astro` | **`preserveScriptFileExtension`** for script sources; non-script sources always keep the full extension (via the shared `buildAssetImportStatement`) [fills the §4.6 gap] |

## `defaultStyle` per destination

Default style **index + rendered output string**. The default is defined **only** in
`package.json` (`contributes.configuration` enum `default` string, matched against the table
`description` by `resolveStyleIndex`); `_styles.ts` carries no default flag. Every configurable
table defaults to **index 0** — but index 0 renders a different user-visible string per
destination, so the string is frozen here (the index alone is insufficient).

| Dest (source-type/ext branch) | Default index | Rendered string |
|-------------------------------|:-------------:|-----------------|
| `.ts` | 0 | `import { $1 } from '<path>';` (named; `import { ${1:Name} }` with a detected class / Angular suffix) |
| `.js` | 0 | `import $1 from '<path>';` (default import) |
| `.tsx` / `.mdx` · `.ts`/`.tsx` source | 0 (TS) | `import { $1 } from '<path>';` |
| `.tsx` / `.mdx` · `.js`/`.jsx` source | 0 (JS) | `import $1 from '<path>';` |
| `.tsx` / `.mdx` · non-script source | — (fixed) | the asset shape for its source type (see `styles`) |
| `.jsx` · `.js`/`.jsx` source | 0 (JS) | `import $1 from '<path>';` |
| `.jsx` · `.ts`/`.tsx` source | — | nothing inserted (empty snippet) |
| `.jsx` · non-script source | — (fixed) | the asset shape for its source type |
| `.css` · stylesheet source | 0 | `@import '<path>';` |
| `.css` · image source | — (fixed) | `url('<path>')` |
| `.scss` · stylesheet source | 0 | `@use '<path>';` |
| `.scss` · image source | — (fixed) | `url('<path>')` |
| `.html` · script source | 0 | `<script src="<path>"></script>` |
| `.html` · image source | 0 | `<img src="<path>" alt="sample">` |
| `.html` · video source | 0 | `<video src="<path>" controls></video>` |
| `.html` · audio source | 0 | `<audio src="<path>" controls></audio>` |
| `.html` · stylesheet source | — (fixed) | `<link href="<path>" rel="stylesheet">` |
| `.html` · text-track source | — (fixed) | `<track src="<path>" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>` |
| `.md` · markdown source | — (fixed) | `[${1:text}](<path>)` |
| `.md` · image source | 0 | `![${1:alt-text}](<path>)` |
| `.vue` / `.svelte` / `.astro` · script source | 0 (TS) | `import { $1 } from '<path>';` (Angular PascalCase on style 0 if the path matches a suffix; no exported-class fill) |
| `.vue` / `.svelte` / `.astro` · non-script source | — (fixed) | the asset shape for its source type (see `styles`) |

> Fixed-shape branches (md-link, css/scss-image, html-link/track, jsx/tsx/mdx non-script,
> **vue/svelte/astro non-script**) carry no configurable setting → `Set Default Import Style`
> reports `no-configurable-style` (`.{src} → .{dest} imports use a fixed style.`).
