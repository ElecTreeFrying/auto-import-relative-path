# MDX (`.mdx` destination) — QA Checklist

MDX-specific manual QA: accept-all gating, the **two-script-arm + asset** style model (7 TypeScript styles for `.ts`/`.tsx` sources, 7 JavaScript styles for `.js`/`.jsx` sources **via fallback**, or a fixed asset shape), Angular-only smart identifiers, placement, style pickers, and drag-and-drop. `.mdx` shares the **exact same builder** as `.tsx`: `dispatch.ts` routes both `.tsx` and `.mdx` to `tsx.ts:buildSnippet`, which hands `buildReactImport` a TS `primarySnippet` for `.ts`/`.tsx` sources **and** a JS `fallbackSnippet` for `.js`/`.jsx` sources. Because of that fallback, **every gated-in source renders a non-empty import except `.tex`/`.bib`/`.eps`** (no primary/fallback/asset case → `default: null` → empty snippet, like `.jsx`'s `.ts`/`.tsx`). The `.tsx`/`.jsx` empty-snippet contrast carries over: `.mdx` renders every **script** source non-empty, but both `.jsx` and `.mdx` empty on `.tex`/`.bib`/`.eps`.

`.mdx` is **byte-identical to `.tsx` in every import shape** — they differ in exactly **one** behavior: the **markdown-star Cursor quirk**. `isMarkdownDestination('.mdx')` is `true` (it is `false` for `.tsx`), so when a **Cursor** insertion lands on a line whose first non-whitespace character is `*`, the import lands **AT** that line in `.mdx` (the `*` is treated as Markdown content — a bullet / `*italic*` / `**bold**`) but is pushed **ABOVE** it in the byte-identical `.tsx` buffer. This is the only `.mdx` ≠ `.tsx` divergence and the focus of §6.3.8 and §10.1.

> **`.mdx` is `generic` placement, not `forced-cursor`.** Unlike `.md` (which forces every insertion to the cursor line and follows the cursor's column), `.mdx` is **not** in `shouldRepositionCursor` — it honors the Top/Bottom/Cursor setting and forces **column 0** (`.mdx ∈ SCRIPT_FILE_EXTENSIONS`), exactly like `.tsx`. `.mdx` is therefore the hybrid: it borrows `.md`'s Markdown comment-handling (leading `*` is content) on top of `.tsx`'s generic script placement.

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notifications, path computation, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/dispatch.ts` — `buildImportSnippet`: the `case '.tsx': case '.mdx':` arm routes **both** destinations to `tsx.buildSnippet` (identical import semantics)
- `src/snippets/languages/tsx.ts` — `buildSnippet` (the `.mdx` builder per `dispatch.ts`): delegates to `buildReactImport` with `primaryExtensions: ['.ts', '.tsx']`, `primarySnippet: buildTypeScriptImportSnippet`, `fallbackExtensions: ['.js', '.jsx']`, `fallbackSnippet: buildJavaScriptImportSnippet`
- `src/snippets/_react.ts` — `buildReactImport`: TS-primary path + JS-fallback path (both honor `preserveScriptFileExtension`), the `.module.css`/`.module.scss` check (FIRST), and `buildAssetImportStatement` (the asset groups, full extension via `fullPath`). `default: null` is reached **only** by `.tex`/`.bib`/`.eps` (no primary/fallback/asset case); every other gated-in `SOURCE_UNIVERSE` member is covered by primary/fallback/asset, so those three are the **only** empty-snippet sources
- `src/snippets/languages/typescript.ts` — `buildTypeScriptImportSnippetByStyle` (7-case switch; style-0 Angular `generateAngularLegacyImportName`, called **without** `detectedImportName` for `.mdx` → no exported-class fill); `default:` arm emits the style-0 shape (bare `$1` for `.mdx`)
- `src/snippets/languages/javascript.ts` — `buildJavaScriptImportSnippetByStyle` (7-case switch); `default:` arm emits the style-0 default-import shape
- `src/snippets/_styles.ts` — **both** `TYPESCRIPT_IMPORT_OPTIONS` (7) **and** `JAVASCRIPT_IMPORT_OPTIONS` (7) — descriptions + tags + tab-stop layout per style
- `src/snippets/variants.ts` — `buildTsxVariants` / `buildReactNonScriptVariant` (shared by the `.tsx`/`.mdx` case): `.ts`/`.tsx` → 7 styled variants backed by `('script', 'typescript')`; `.js`/`.jsx` → 7 styled variants backed by `('script', 'javascript')`; non-script → a single hardcoded variant (no `setting`). Called **without** `detectedImportName`, so style-0 is Angular-only (no exported-class fill)
- `src/gating.ts` — `isPairSupported`: `.mdx ∈ CROSS_IMPORT_DESTINATIONS` → accepts every source; like `.tsx` (and unlike `.jsx`, which empties on `.ts`/`.tsx`), every source renders a non-empty snippet **except `.tex`/`.bib`/`.eps`**
- `src/commands/paste-import.ts` — Paste as Import (insertion path)
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop import; registered for `scheme:'file'` only)
- `src/editor/insert-snippet.ts` — insertion orchestrator (Top / Bottom / Cursor; column 0 for script destinations; passes `isMarkdownDestination(dest)` into the Cursor adjustment)
- `src/editor/placement.ts` — placement helpers (Bottom scan, `adjustForCommentBlock`; **`isMarkdownDestination('.mdx')` is `true`**, so a leading `*` is Markdown content — the basis for the §10 `.mdx` ≠ `.tsx` proof; `.mdx ∉ shouldRepositionCursor`, so it is generic placement, not forced-cursor)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting`

---

## Prerequisites

- Extension Development Host launched (F5)
- QA workspace open as a folder — open `qa/workspace/` in the EDH via **File > Open Folder**
- Default settings restored: `importStatementPlacement = "Bottom"`, `preserveScriptFileExtension = false`, `typescriptImportStyle = "import { name } from '_relativePath_';"`, `javascriptImportStyle = "import name from '_relativePath_';"`

### How to change extension settings

1. Open VS Code Settings: <kbd>Cmd</kbd>+<kbd>,</kbd> (macOS) or <kbd>Ctrl</kbd>+<kbd>,</kbd> (Windows/Linux).
2. In the left sidebar, scroll down and expand **Extensions**.
3. Click **Auto Import Relative Path** — the extension's settings appear in the main panel.

The four settings used in this checklist:

| Setting label in UI | Type | Default |
|---|---|---|
| TypeScript / TSX import style | dropdown | `import { name } from '_relativePath_';` |
| JavaScript / JSX import style | dropdown | `import name from '_relativePath_';` |
| Preserve script file extension in imports | checkbox | unchecked (`false`) |
| Import statement placement | dropdown | `Bottom` |

> **`.mdx` has NO dedicated `mdxImportStyle` setting** — it reuses **BOTH** existing script settings, keyed on the **source** extension: a `.ts`/`.tsx` source uses **TypeScript / TSX import style** (`typescriptImportStyle`); a `.js`/`.jsx` source uses **JavaScript / JSX import style** (`javascriptImportStyle`). Both settings' `package.json` descriptions name `.mdx` explicitly (the TS description: *".ts / .tsx sources imported into .tsx or .mdx files"*; the JS description: *".js / .jsx sources imported into .jsx, .tsx, or .mdx files"*), and both govern other destinations too (see §8).

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `mdx/src/` | Primary script sources and the `.mdx` destination: `Page.mdx` (destination), `Widget.tsx` + `model.ts` (`.ts`/`.tsx` sources → TS arm), `helper.js` + `Card.jsx` (`.js`/`.jsx` sources → JS fallback arm), `components/Card.tsx` (nested source for §7) |
| `mdx/src/angular/` | Angular-convention `.ts` sources WITHOUT `export class` (`user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `auth.module.ts`), plus `widget.component.js` (Angular suffix on a `.js` source → JS fallback, no PascalCase) |
| `mdx/src/classes/` | `event-bus.ts` — a `.ts` source WITH `export class EventBus` (the no-exported-class-fill counter-case) |
| `mdx/assets/` | One fixture per non-script source category (`logo.png`, `styles.module.css`, `global.css`, `data.json`, `config.yaml`, `clip.mp4`, `theme.mp3`, `subs.vtt`, `font.woff2`, `manual.pdf`, `Hero.vue`, `notes.md`, `page.html`, `page.mdx`, …) |
| `mdx/destinations/` | Pre-filled `.mdx` files for placement tests (undo after each test) + `leading-star.mdx` and a byte-identical `leading-star.tsx` for the §10 `.mdx` ≠ `.tsx` proof |

> **Asset-fixture content is irrelevant** — the import shape is keyed on the file **extension**, not the bytes, so `mdx/assets/*` fixtures can be empty stubs. For script fixtures, content matters **only** for the Angular/class cases in §5: the `mdx/src/angular/*` files must NOT contain `export class` (they test the Angular-suffix path), and `mdx/src/classes/event-bus.ts` must contain `export class EventBus` (the no-fill counter-case). All other script fixtures (`Widget.tsx`, `helper.js`, …) have no detection and can be empty stubs.

---

## 1 — Cross-import gating matrix (accept-all)

`.mdx ∈ CROSS_IMPORT_DESTINATIONS`, so `isPairSupported` returns `true` for **every** source extension (`src/gating.ts`: the first clause short-circuits because the destination is a cross-import destination, and no per-destination clause matches `.mdx`). There are therefore **no source-extension rejection rows** — the only rejection that applies to `.mdx` is the universal **same-file** rejection, owned by [general.md](general.md) (cross-reference, never re-tested here).

Like `.tsx`, **every accepted source renders a non-empty snippet except `.tex`/`.bib`/`.eps`** (`.ts`/`.tsx` → TS primary, `.js`/`.jsx` → JS fallback, every other asset → a fixed shape; `.tex`/`.bib`/`.eps` have no case → empty snippet). The **only empty rows** are those three LaTeX sources (§1.19–1.21). This matrix lists one row per source category, showing the default inserted shape. It doubles as a coverage map into §2 (happy path) and §4 (all styles / asset shapes). For each row: copy the listed source (`Cmd+Shift+A`), paste into `mdx/src/Page.mdx` (`Cmd+I`).

| # | Source (workspace path) | Category | Expected (default style) |
|---|------------------------|----------|--------------------------|
| 1.1 | `mdx/src/model.ts` | script `.ts` → TS primary | `import { $1 } from './model';` |
| 1.2 | `mdx/src/Widget.tsx` | script `.tsx` → TS primary | `import { $1 } from './Widget';` |
| 1.3 | `mdx/src/helper.js` | script `.js` → JS fallback | `import $1 from './helper';` |
| 1.4 | `mdx/src/Card.jsx` | script `.jsx` → JS fallback | `import $1 from './Card';` |
| 1.5 | `mdx/assets/page.mdx` | script-category `.mdx` → **asset** | `import ${1:name} from '../assets/page.mdx';` |
| 1.6 | `mdx/assets/Hero.vue` | framework | `import ${1:name} from '../assets/Hero.vue';` |
| 1.7 | `mdx/assets/page.html` | html | `import ${1:name} from '../assets/page.html';` |
| 1.8 | `mdx/assets/notes.md` | markdown | `import ${1:name} from '../assets/notes.md';` |
| 1.9 | `mdx/assets/logo.png` | image | `import ${1:name} from '../assets/logo.png';` |
| 1.10 | `mdx/assets/data.json` | data | `import ${1:name} from '../assets/data.json';` |
| 1.11 | `mdx/assets/config.yaml` | data | `import ${1:name} from '../assets/config.yaml';` |
| 1.12 | `mdx/assets/manual.pdf` | document | `import ${1:name} from '../assets/manual.pdf';` |
| 1.13 | `mdx/assets/styles.module.css` | CSS module | `import ${1:styles} from '../assets/styles.module.css';` |
| 1.14 | `mdx/assets/global.css` | stylesheet | `import '../assets/global.css';` (side-effect, no tab stop) |
| 1.15 | `mdx/assets/font.woff2` | font | `import '../assets/font.woff2';` (side-effect, no tab stop) |
| 1.16 | `mdx/assets/clip.mp4` | video | `import ${1:url} from '../assets/clip.mp4';` |
| 1.17 | `mdx/assets/theme.mp3` | audio | `import ${1:url} from '../assets/theme.mp3';` |
| 1.18 | `mdx/assets/subs.vtt` | text-track | `import ${1:url} from '../assets/subs.vtt';` |
| 1.19 | `mdx/assets/sample.tex` | latex → **empty** | *(nothing inserted — empty snippet + `not-supported` toast; no primary/fallback/asset case → `default: null`)* |
| 1.20 | `mdx/assets/refs.bib` | bibliography → **empty** | *(nothing inserted — empty snippet + `not-supported` toast)* |
| 1.21 | `mdx/assets/diagram.eps` | eps → **empty** | *(nothing inserted — empty snippet + `not-supported` toast)* |

- [ ] 1.1–1.2 (`.ts`/`.tsx` sources) insert the **TS named** shape `import { $1 } from '<path>';` (the TS primary path)
- [ ] 1.3–1.4 (`.js`/`.jsx` sources) insert the **JS default** shape `import $1 from '<path>';` (the JS **fallback** path — NOT the TS named shape)
- [ ] 1.5 (`.mdx` source) inserts the **named asset** shape `import ${1:name} from '../assets/page.mdx';` — `.mdx` is a script-*category* extension but is **not** in the primary (`.ts`/`.tsx`) or fallback (`.js`/`.jsx`) sets, so it falls through to `buildAssetImportStatement`'s image/doc/component group
- [ ] 1.6–1.12 (framework / html / markdown / image / data / document) insert `import ${1:name} from '<full-path>';` with the **full source extension** kept
- [ ] 1.13 (`.module.css`) inserts the `${1:styles}` shape — the CSS-module check beats the side-effect shape (proof in §4)
- [ ] 1.14–1.15 (plain stylesheet / font) insert the side-effect `import '<full-path>';` with no tab stop
- [ ] 1.16–1.18 (video / audio / text-track) insert `import ${1:url} from '<full-path>';`
- [ ] 1.19–1.21 (latex / bibliography / eps) insert **nothing** and show `Auto Import: Cannot import .tex into .mdx files.` (etc.) — gating-accepted but no primary/fallback/asset case → `default: null` → empty snippet (the **only** empty rows; the `.jsx`-style empty-snippet case `.mdx` was previously claimed not to have)

> Every `SOURCE_UNIVERSE` category is represented; the **only empty rows** are the LaTeX sources `.tex`/`.bib`/`.eps` (1.19–1.21 — no asset-switch case). The four fixed asset shapes — `${1:styles}` / `${1:name}` / `${1:url}` / side-effect — are enumerated in full in §4 (arm 2). The import shapes here are **byte-identical to `.tsx`** (same `tsx.ts` builder).

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

One case per source branch in the model: a `.ts`/`.tsx` script source (TS primary), a `.js`/`.jsx` script source (JS fallback), and a non-script asset source.

### 2.1 — TypeScript script source (`.tsx` → TS primary)

- [ ] Copy `mdx/src/Widget.tsx` (`Cmd+Shift+A`), open `mdx/src/Page.mdx`, press `Cmd+I`
- [ ] Import inserted: `import { $1 } from './Widget';` (the TS **named** shape — the `typescriptImportStyle` default)
- [ ] Cursor lands on the `$1` tab stop inside the curly braces
- [ ] Import is at column 0; trailing newline appended after the import line

### 2.2 — JavaScript script source via fallback (`.js` → JS fallback)

- [ ] Copy `mdx/src/helper.js`, open `mdx/src/Page.mdx`, press `Cmd+I`
- [ ] Import inserted: `import $1 from './helper';` (the JS **default** shape — the `javascriptImportStyle` default, **NOT** the TS named `import { $1 }`)
- [ ] Cursor lands on the `$1` tab stop (after `import`, before `from`)
- [ ] This proves the **fallback**: a `.js`/`.jsx` source dropped into a `.mdx` file emits a JS-shaped import, not a TS one

### 2.3 — Asset source (image)

- [ ] Copy `mdx/assets/logo.png`, paste into `mdx/src/Page.mdx`
- [ ] Import inserted: `import ${1:name} from '../assets/logo.png';` (default-import with a `name` placeholder; **full `.png` extension kept**)
- [ ] Cursor lands on the `${1:name}` placeholder (text `name` pre-selected)

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `mdx/src/Widget.tsx` in the Explorer with `mdx/src/Page.mdx` open in the editor
- [ ] Press `Alt+D`
- [ ] Import is inserted into `mdx/src/Page.mdx` — same result as Copy + Paste: `import { $1 } from './Widget';`

---

## 4 — Style model (two script arms + asset arm)

`.mdx` resolves the import shape from the **source extension**, so item 4 has two arms — and arm 1 has **two script tables** because `.mdx` dispatches to both the TS and JS builders:

- **Arm 1A** — a `.ts`/`.tsx` source picks from the **7 TypeScript styles** (`typescriptImportStyle`).
- **Arm 1B** — a `.js`/`.jsx` source picks from the **7 JavaScript styles** (`javascriptImportStyle`, via fallback).
- **Arm 2** — a non-script asset source gets **one fixed shape** (no style dropdown applies).

The only empty-snippet sources are the LaTeX `.tex`/`.bib`/`.eps` (no asset-switch case → `default: null`); every other gated-in source renders something.

### 4A — `.ts`/`.tsx` source: all 7 TypeScript import styles

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **TypeScript / TSX import style** dropdown. Then copy `mdx/src/Widget.tsx` and paste into `mdx/src/Page.mdx`. Undo (`Cmd+Z`) after each test.

`mdx/src/Widget.tsx` is a plain `.tsx` source with NO Angular suffix (tests the bare tab-stop behavior; `.mdx` never reads exported classes, so it is bare `$1` regardless of file content — see §5).

> These 7 shapes are the **same** `TYPESCRIPT_IMPORT_OPTIONS` table the `.ts` and `.tsx` destinations use — `.mdx` reuses the `typescriptImportStyle` setting for `.ts`/`.tsx` sources.

#### Style 0 — `import { name } from '_relativePath_';` (default)

- [ ] Output: `import { $1 } from './Widget';`
- [ ] Cursor lands on `$1` inside the curly braces (empty tab stop — no class fill; see §5)

#### Style 1 — `import name from '_relativePath_';`

- [ ] Output: `import $1 from './Widget';`
- [ ] Cursor lands on `$1`

#### Style 2 — `import * as name from '_relativePath_';`

- [ ] Output: `import * as $1 from './Widget';`
- [ ] Cursor lands on `$1` after `as`

#### Style 3 — `import '_relativePath_';`

- [ ] Output: `import './Widget';`
- [ ] No tab stop (side-effect import), cursor lands after the semicolon

#### Style 4 — `import type { name } from '_relativePath_';`

- [ ] Output: `import type { $1 } from './Widget';`
- [ ] Cursor lands on `$1` inside the curly braces

#### Style 5 — `import { name, type Type } from '_relativePath_';`

- [ ] Output: `import { $1, type $2 } from './Widget';`
- [ ] Cursor lands on `$1` (value binding); Tab advances to `$2` (type binding); two distinct tab stops

#### Style 6 — `const name = await import('_relativePath_');`

- [ ] Output: `const $1 = await import('./Widget');`
- [ ] Cursor lands on `$1` (the dynamic-import binding)

### 4B — `.js`/`.jsx` source: all 7 JavaScript import styles (via fallback)

For each style: select the listed value from the **JavaScript / JSX import style** dropdown. Then copy `mdx/src/helper.js` and paste into `mdx/src/Page.mdx`. Undo (`Cmd+Z`) after each test.

> A `.js`/`.jsx` source into a `.mdx` file routes through `_react.ts`'s **fallback** to the JS builder, so it picks from `JAVASCRIPT_IMPORT_OPTIONS` — the **same** table the `.js` destination uses. Note the style-0 default here (`import name`) differs from the TS style-0 default (`import { name }`).

#### Style 0 — `import name from '_relativePath_';` (default)

- [ ] Output: `import $1 from './helper';`
- [ ] Cursor lands on `$1` (default-import binding)

#### Style 1 — `import { name } from '_relativePath_';`

- [ ] Output: `import { $1 } from './helper';`
- [ ] Cursor lands on `$1` inside the curly braces

#### Style 2 — `import name, { other } from '_relativePath_';`

- [ ] Output: `import $1, { $2 } from './helper';`
- [ ] Cursor lands on `$1` (default binding); Tab advances to `$2` (named binding); two distinct tab stops

#### Style 3 — `import * as name from '_relativePath_';`

- [ ] Output: `import * as $1 from './helper';`
- [ ] Cursor lands on `$1` after `as`

#### Style 4 — `import '_relativePath_';`

- [ ] Output: `import './helper';`
- [ ] No tab stop (side-effect import), cursor lands after the semicolon

#### Style 5 — `const name = require('_relativePath_');`

- [ ] Output: `const $1 = require('./helper');`
- [ ] Cursor lands on `$1` (the CommonJS binding)

#### Style 6 — `const name = await import('_relativePath_');`

- [ ] Output: `const $1 = await import('./helper');`
- [ ] Cursor lands on `$1` (the dynamic-import binding)

### 4C — Non-script source: the 4 fixed asset shapes

Each asset source maps to exactly **one** fixed shape (no style dropdown applies). These shapes are independent of both script settings. Copy the listed source, paste into `mdx/src/Page.mdx`, undo after each.

| Shape | Source fixture | Output | Tab stop |
|-------|----------------|--------|----------|
| CSS module (checked **first**) | `mdx/assets/styles.module.css` | `import ${1:styles} from '../assets/styles.module.css';` | `${1:styles}` |
| image / doc / component | `mdx/assets/logo.png` | `import ${1:name} from '../assets/logo.png';` | `${1:name}` |
| av / text-track | `mdx/assets/clip.mp4` | `import ${1:url} from '../assets/clip.mp4';` | `${1:url}` |
| font / stylesheet (side-effect) | `mdx/assets/font.woff2` | `import '../assets/font.woff2';` | none |

- [ ] `.module.css` → `import ${1:styles} from '../assets/styles.module.css';` (placeholder `styles`)
- [ ] image/doc/component → `import ${1:name} from '<full-path>';` (placeholder `name`)
- [ ] av/text-track → `import ${1:url} from '<full-path>';` (placeholder `url`)
- [ ] font/stylesheet → `import '<full-path>';` (no placeholder — side-effect)

#### 4C.1 — `.module.css` beats the plain side-effect shape

The `.module.css` / `.module.scss` check runs **before** the extension switch, so a CSS-module source is NOT treated as a plain stylesheet.

- [ ] Copy `mdx/assets/styles.module.css`, paste → `import ${1:styles} from '../assets/styles.module.css';` (the `${1:styles}` shape)
- [ ] Copy `mdx/assets/global.css` (a plain `.css`), paste → `import '../assets/global.css';` (side-effect, no tab stop)
- [ ] The two `.css` sources produce **different** shapes — the `.module.*` suffix is what routes to the `${1:styles}` shape

#### 4C.2 — Non-script assets keep the full extension even with preserve OFF

`preserveScriptFileExtension` is a **script-namespace** setting; `_react.ts` builds asset paths from `fullPath`, which always carries the source extension (it is read from the raw source path, not the preserve-gated path used for the script arms).

- [ ] Confirm **Preserve script file extension in imports** is unchecked (`false`, the default)
- [ ] Copy `mdx/assets/logo.png`, paste → `import ${1:name} from '../assets/logo.png';` (the `.png` extension is **still present** — the toggle does not strip asset extensions)

### 4D — Style-name drift (config-drift safety net)

A hand-typed / drifted `*ImportStyle` value (matching no enum description) must still insert the **style-0 shape**, never nothing (`resolveStyleIndex` → `undefined` → builder `default:` arm). `.mdx` is tested on **both** script settings.

#### 4D.1 — `typescriptImportStyle` drift (`.ts`/`.tsx` source)

- [ ] In `settings.json`, set `auto-import.importStatement.script.typescriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `mdx/src/Widget.tsx`, paste into `mdx/src/Page.mdx` → `import { $1 } from './Widget';` (style-0 named shape — **NOT** empty)
- [ ] The tab stop is a bare `$1`. `.mdx` passes **no** `detectedImportName` and the `default:` arm runs **no** Angular naming (Angular lives only in `case 0`), so even `mdx/src/angular/user.component.ts` drifts to a bare `import { $1 } from './angular/user.component';`
- [ ] Restore: set **TypeScript / TSX import style** back to `import { name } from '_relativePath_';`

#### 4D.2 — `javascriptImportStyle` drift (`.js`/`.jsx` source)

- [ ] In `settings.json`, set `auto-import.importStatement.script.javascriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `mdx/src/helper.js`, paste into `mdx/src/Page.mdx` → `import $1 from './helper';` (style-0 default-import shape — **NOT** empty)
- [ ] Restore: set **JavaScript / JSX import style** back to `import name from '_relativePath_';`

---

## 5 — Smart identifier behavior (Angular-PascalCase only, style 0)

`.mdx` routes `.ts`/`.tsx` sources through the TypeScript builder, whose style-0 calls `generateAngularLegacyImportName`. But `.mdx` invokes it **without** a `detectedImportName` (`tsx.ts` → `_react.ts` primary is one-arg; `variants.ts:buildTsxVariants` passes no third arg), so `readExportedClassName` is **never called** → there is **no exported-class fill**. The result is **Angular-PascalCase only**, and only for `.ts`/`.tsx` sources. Styles 1–6 always emit a bare `$1`.

> This is the section that distinguishes `.mdx`/`.tsx` smart-ID from `.ts`: `.ts` runs **both** exported-class detection and Angular naming ([typescript.md §5.A + §5.B](typescript.md#5--smart-identifier-behavior-style-0-only)); `.mdx` runs **Angular only**. Emit **no** exported-class detection case — that is `.ts`-destination-only.

Style must be set to index 0 (`import { name } from '_relativePath_';`).

### 5.1 — `.component` suffix

- [ ] Copy `mdx/src/angular/user.component.ts` (no `export class`) → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { ${1:UserComponent} } from './angular/user.component';` (PascalCase identifier pre-filled as an **editable** `${1:…}` tab stop, like the detected-class case in `.ts`)

### 5.2 — `.directive` suffix

- [ ] Copy `mdx/src/angular/highlight.directive.ts` → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { ${1:HighlightDirective} } from './angular/highlight.directive';`

### 5.3 — `.pipe` suffix

- [ ] Copy `mdx/src/angular/trim.pipe.ts` → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { ${1:TrimPipe} } from './angular/trim.pipe';`

### 5.4 — `.service` suffix

- [ ] Copy `mdx/src/angular/user.service.ts` → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { ${1:UserService} } from './angular/user.service';`

### 5.5 — `.module` suffix

- [ ] Copy `mdx/src/angular/auth.module.ts` → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { ${1:AuthModule} } from './angular/auth.module';`

### 5.6 — Non-Angular `.ts`/`.tsx` source (no suffix match)

- [ ] Copy `mdx/src/Widget.tsx` (no Angular suffix) → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { $1 } from './Widget';` (bare tab stop, NOT `Widget`)

### 5.7 — Exported class is NOT filled (the counter-case to `.ts` §5.A)

This is the signature `.mdx` ≠ `.ts` case. A `.ts`/`.tsx` source containing `export class …` is read for its class name by the `.ts` destination, but **never** by `.mdx`.

- [ ] Copy `mdx/src/classes/event-bus.ts` (contains `export class EventBus { }`, no Angular suffix) → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { $1 } from './classes/event-bus';` — a **bare** tab stop, NOT `${1:EventBus}` (the `.mdx` builder never calls `readExportedClassName`). Contrast [typescript.md §5.A.1](typescript.md#5a--exported-class-detection-style-0-ts-destination-only), where the same source yields `import { ${1:EventBus} } from …`

### 5.8 — Angular naming is `.ts`/`.tsx`-source-only (`.js`/`.jsx` source → JS fallback)

- [ ] Copy `mdx/src/angular/widget.component.js` (an Angular-suffixed `.js` source) → paste into `mdx/src/Page.mdx`
- [ ] Output: `import $1 from './angular/widget.component';` — a **bare** default-import, NOT `import { ${1:WidgetComponent} }`. A `.js`/`.jsx` source takes the JS **fallback**, which has no Angular naming. Contrast §5.1 (a `.component.ts` source → `import { ${1:UserComponent} }`)

### 5.9 — Preserve-extension identifier stability

- [ ] With **Preserve script file extension in imports** unchecked (default): copy `mdx/src/angular/user.component.ts`, paste → `import { ${1:UserComponent} } from './angular/user.component';`
- [ ] Check the **Preserve script file extension in imports** checkbox, copy `mdx/src/angular/user.component.ts`, paste → `import { ${1:UserComponent} } from './angular/user.component.ts';`
- [ ] The identifier is **identical** (`${1:UserComponent}`) in both cases — never `UserComponentTs` — because the extension is stripped before the name is derived; only the path string changes
- [ ] Restore: uncheck **Preserve script file extension in imports**

### 5.10 — Angular suffix, illegal derived identifier (guard)

- [ ] Copy `mdx/src/angular/2fa.component.ts` (no `export class`) → paste into `mdx/src/Page.mdx`
- [ ] Output: `import { $1 } from './angular/2fa.component';` — `2fa.component` derives `2faComponent`, not a legal identifier (leading digit), so the name falls back to a bare `$1` tab stop, NOT `2faComponent` (the `typescript.ts` identifier-validation guard)

---

## 6 — Placement modes

`.mdx` uses the **generic** placement mode (column 0; full Top / Bottom / Cursor honoring) — the same mechanism as `.ts`/`.js`/`.jsx`/`.tsx`. `.mdx` is **not** forced-cursor (`shouldRepositionCursor` checks only `.html`/`.md`/`.tex`), so the Top/Bottom/Cursor setting is honored and the column is always 0.

**Bottom and Top placement are byte-identical to `.tsx`.** The one divergence is **Cursor placement on a leading-`*` line**: `isMarkdownDestination('.mdx')` is `true`, so a leading `*` is treated as Markdown content (bullet / emphasis), not a comment continuation (§6.3.8). `//` and `/*` lines still adjust above. This is the basis for the §10 `.mdx` ≠ `.tsx` proof.

### 6.1 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 6.1.1 — Empty file

- [ ] Copy `mdx/src/Widget.tsx`, paste into `mdx/destinations/empty.mdx` → import inserted at line 1

#### 6.1.2 — File with existing imports

- [ ] Open `mdx/destinations/with-imports.mdx`:
  ```mdx
  import { Header } from '../src/Header';
  import { Footer } from '../src/Footer';

  # Page
  ```
- [ ] Copy `mdx/src/Widget.tsx`, paste → import inserted on line 3 (after `import { Footer }`, before the blank line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.3 — File with `require()` import

- [ ] Open `mdx/destinations/with-require.mdx`:
  ```mdx
  const fs = require('fs');
  ```
- [ ] Copy `mdx/src/Widget.tsx`, paste → import inserted on line 2 (after the `require(` line — `require(` is one of the `IMPORT_INDICATORS` markers)

#### 6.1.4 — File with comments containing the `import` keyword

- [ ] Open `mdx/destinations/commented-imports.mdx`:
  ```mdx
  // import { Footer } from '../src/Footer';
  import { Header } from '../src/Header';
  ```
- [ ] The commented line is skipped — import inserted on line 3 (after the real import, NOT after the comment)

#### 6.1.5 — File with only comments

- [ ] Open `mdx/destinations/comments-only.mdx`:
  ```mdx
  // This file has no imports
  /* Just comments */
  ```
- [ ] No import marker found → import inserted at line 1

#### 6.1.6 — Column is always 0

- [ ] Regardless of cursor position, import is inserted at column 0 (leftmost)

### 6.2 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), set **Import statement placement** to `Top`

#### 6.2.1 — File with existing imports

- [ ] Open `mdx/destinations/with-imports.mdx` (same content as §6.1.2)
- [ ] Copy `mdx/src/Widget.tsx`, paste → import inserted at line 1 (before `import { Header }`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.2 — Empty file

- [ ] Copy `mdx/src/Widget.tsx`, paste into `mdx/destinations/empty.mdx` → import at line 1

#### 6.2.3 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 6.3 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import statement placement** to `Cursor`

#### 6.3.1 — Cursor on a blank line

- [ ] Open `mdx/destinations/with-imports.mdx`, place cursor on line 3 (the blank line)
- [ ] Copy `mdx/src/Widget.tsx`, paste → import inserted at line 3
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.2 — Cursor at end of file

- [ ] Open `mdx/destinations/with-imports.mdx`, place cursor on the last line, paste → import at cursor line
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.3 — Cursor inside a multi-line comment block

- [ ] Open `mdx/destinations/multiline-comment.mdx`:
  ```mdx
  import { Header } from '../src/Header';

  /*
   * Some documentation
   * about this module
   */

  # Page
  ```
- [ ] Place cursor on line 3 (the `/*` opener), paste → import is adjusted ABOVE the block (line 3) — a `/*` line is a comment continuation even in `.mdx`
- [ ] Undo, then place cursor on line 5 (the ` * about this module` line), paste → import is inserted **AT** line 5 (NOT above) — in `.mdx`, a leading `*` is **content**, not a comment continuation. **Contrast `.tsx`**, where this same line adjusts above (see §10.1)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.4 — Cursor on a `//` comment line within a comment group

- [ ] Open `mdx/destinations/comment-group.mdx`:
  ```mdx
  // Line one of comment
  // Line two of comment
  // Line three of comment
  ```
- [ ] Place cursor on line 2, paste → import adjusted to line 1 (above the comment block — `//` lines adjust above in `.mdx` just as in `.tsx`)

#### 6.3.5 — Cursor on a non-comment line

- [ ] Open `mdx/destinations/with-imports.mdx`, place cursor on line 4 (`# Page`)
- [ ] Copy `mdx/src/Widget.tsx`, paste → import inserted at line 4
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.6 — Column is always 0

- [ ] Even with cursor at column 20, import inserts at column 0

#### 6.3.7 — Cursor on a single isolated `//` comment (not a group)

- [ ] Open `mdx/destinations/single-comment.mdx`:
  ```mdx
  import { Header } from '../src/Header';

  // standalone note

  # Page
  ```
- [ ] Place cursor on line 3 (`// standalone note`), paste
- [ ] Import inserted at line 3 (AT the comment, pushing it to line 4 — unlike a comment group where the import moves above the block)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.8 — Cursor on a leading-`*` line (IS Markdown — the `.mdx` divergence from `.tsx`)

- [ ] Open `mdx/destinations/leading-star.mdx`:
  ```mdx
  import { Header } from '../src/Header';

  /**
   * A JSDoc-style comment block.
   * The second body line begins with `*`.
   */
  export const Page = () => null;
  ```
- [ ] Place cursor on line 5 (the ` * The second body line…` line), paste
- [ ] Import is inserted **AT** line 5 — in `.mdx`, a leading `*` is **content** (bullet / emphasis), so `adjustForCommentBlock` does not treat it as a comment continuation (`isMarkdownDestination('.mdx')` is `true`)
- [ ] **Contrast:** in `.tsx`, the same leading-`*` line is a **comment continuation**, so the import is pushed **above** the block (line 3) — see §10.1
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 7 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change, single-variant fast path) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 7.1 — `.ts`/`.tsx` source: QuickPick shows all 7 TS styles

- [ ] Copy `mdx/src/Widget.tsx`, run Paste as Import (Pick Style) in `mdx/src/Page.mdx`
- [ ] QuickPick appears with placeholder text: `Select an import style`
- [ ] 7 items listed, one per TypeScript import style
- [ ] Each item has a **label** (the snippet preview using `path.basename` of the source — e.g. `import { name } from 'Widget';`) and a **description** = the style's tag, verbatim:

| Style | DESCRIPTION (tag — shown in the QuickPick, verbatim) |
|---|---|
| 0 | `ES module: named import — legacy Angular files (.component / .directive / .pipe / .service / .module) auto-fill PascalCase identifiers (back-compat)` |
| 1 | `ES module: default import` |
| 2 | `ES module: namespace import (every export bound under one name)` |
| 3 | `ES module: side-effect import (no binding)` |
| 4 | `TypeScript: type-only import (TS 3.8+ — zero runtime, erased at compile time)` |
| 5 | `TypeScript: mixed value + type import (TS 4.5+ inline modifier)` |
| 6 | `Dynamic import: lazy-load / code-splitting` |

- [ ] Each item's description matches the tag column exactly

### 7.2 — `.js`/`.jsx` source: QuickPick shows all 7 JS styles

- [ ] Copy `mdx/src/helper.js`, run Paste as Import (Pick Style) in `mdx/src/Page.mdx`
- [ ] 7 items listed, one per JavaScript import style (the **fallback** table — not the TS table)
- [ ] The style-0 label is `import name from 'helper';` (the JS default-import shape, basename preview)
- [ ] Each item has a description = the JS style's tag, verbatim:

| Style | DESCRIPTION (tag — shown in the QuickPick, verbatim) |
|---|---|
| 0 | `ES module: default import` |
| 1 | `ES module: named import (destructured)` |
| 2 | `ES module: default + named import (mixed)` |
| 3 | `ES module: namespace import (every export bound under one name)` |
| 4 | `ES module: side-effect import (no binding)` |
| 5 | `CommonJS: const require()` |
| 6 | `Dynamic import: lazy-load / code-splitting` |

- [ ] Each item's description matches the tag column exactly

### 7.3 — Label = basename, inserted = full path

- [ ] Copy `mdx/src/components/Card.tsx` (a nested `.tsx` source), run the command in `mdx/src/Page.mdx`
- [ ] Select `import * as name from '_relativePath_';` from the picker — its label previews the **basename**: `import * as name from 'Card';`
- [ ] Verify the INSERTED text uses the **full relative path**: `import * as $1 from './components/Card';`

### 7.4 — Style-0 TS label is Angular-prefilled for a suffixed path

- [ ] Copy `mdx/src/angular/user.component.ts`, run the command in `mdx/src/Page.mdx`
- [ ] The style-0 item's **label** is `import { UserComponent } from 'user.component';` (basename preview, Angular PascalCase filled — `generateAngularLegacyImportName` runs on the label path too)
- [ ] Selecting it inserts `import { ${1:UserComponent} } from './angular/user.component';` (full path)
- [ ] Styles 1–6 show a bare `name` placeholder in their labels (Angular fills only style 0)

### 7.5 — Asset source: single fixed variant (direct insert)

A non-script asset has exactly **one** variant (the fixed shape), so the single-variant fast path applies — the picker is not shown and the import is inserted directly ([general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics)).

- [ ] Copy `mdx/assets/logo.png`, run Paste as Import (Pick Style) in `mdx/src/Page.mdx`
- [ ] No style list appears (one variant only) → `import ${1:name} from '../assets/logo.png';` is inserted directly
- [ ] (Were the picker shown, the single item's label would be the basename preview `import name from 'logo.png';` with an empty description — hardcoded variants carry no tag)

> **0-variant case (LaTeX only).** **Every `.mdx` source produces at least one variant except the LaTeX `.tex`/`.bib`/`.eps`** — `.ts`/`.tsx` → 7 TS, `.js`/`.jsx` → 7 JS, non-script asset → 1 fixed, `.tex`/`.bib`/`.eps` → 0 (empty picker). (Unlike `jsx.md`, a `.ts`/`.tsx` source here produces 7 TS variants, not zero.)

---

## 8 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark on current default, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

### 8.1 — `.ts`/`.tsx` source: selecting a TS style persists to `typescriptImportStyle`

- [ ] Copy `mdx/src/Widget.tsx`, run Set Default Import Style in `mdx/src/Page.mdx`
- [ ] Select `import type { name } from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import type { name } from '_relativePath_';`
- [ ] Check VS Code Settings → **TypeScript / TSX import style** (`typescriptImportStyle`) is now `import type { name } from '_relativePath_';`
- [ ] Reset: run the command again on `mdx/src/Widget.tsx`, select `import { name } from '_relativePath_';` to restore the default

### 8.2 — `.js`/`.jsx` source: selecting a JS style persists to `javascriptImportStyle`

- [ ] Copy `mdx/src/helper.js`, run Set Default Import Style in `mdx/src/Page.mdx`
- [ ] Select `import * as name from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import * as name from '_relativePath_';`
- [ ] Check VS Code Settings → **JavaScript / JSX import style** (`javascriptImportStyle`) is now `import * as name from '_relativePath_';`
- [ ] Reset: run the command again on `mdx/src/helper.js`, select `import name from '_relativePath_';` to restore the default

### 8.3 — Shared-setting cross-effect (no `mdxImportStyle`)

`.mdx` has **no** `mdxImportStyle` key — §8.1 wrote `typescriptImportStyle` and §8.2 wrote `javascriptImportStyle`, the **same** two keys that govern other destinations.

- [ ] In VS Code Settings, confirm there is **no** `mdxImportStyle` setting — the value from §8.1 lives under **TypeScript / TSX import style** (`auto-import.importStatement.script.typescriptImportStyle`) and the value from §8.2 under **JavaScript / JSX import style** (`auto-import.importStatement.script.javascriptImportStyle`)
- [ ] `typescriptImportStyle` also governs `.ts` destinations and `.ts`/`.tsx` sources into `.tsx`/`.vue`/`.svelte`/`.astro`; `javascriptImportStyle` also governs `.js` destinations and `.js`/`.jsx` sources into `.jsx`/`.tsx`. (Both settings' descriptions name `.mdx` explicitly.) Setting either default from a `.mdx` paste therefore changes that style everywhere the key is read
- [ ] Confirm both settings were restored to their defaults in §8.1 / §8.2

### 8.4 — Asset source: no configurable style

A non-script asset's single variant carries no backing setting, so there is nothing to persist.

- [ ] Copy `mdx/assets/logo.png`, run Set Default Import Style in `mdx/src/Page.mdx`
- [ ] Warning toast: `Auto Import: .png → .mdx imports use a fixed style.` (the `no-configurable-style` reject) — no picker, no setting written

---

## 9 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.mdx` editor. A drop reuses the same `buildImportSnippet` + `computeImportPlacement` pipeline as paste, so the inserted string is **byte-identical** to the §2 happy path. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 9.1 — Happy path, TypeScript script source (`.tsx` → `.mdx`)

- [ ] Drag `mdx/src/Widget.tsx` from Explorer into `mdx/src/Page.mdx` editor
- [ ] Import inserted using the default TypeScript style — `import { $1 } from './Widget';` (byte-identical to the §2.1 paste result)
- [ ] Placement follows the `importStatementPlacement` setting (same as paste)

### 9.2 — Happy path, JavaScript script source via fallback (`.js` → `.mdx`)

- [ ] Drag `mdx/src/helper.js` into `mdx/src/Page.mdx` → `import $1 from './helper';` (the JS **default** shape via fallback, byte-identical to §2.2 — NOT a TS named import)

### 9.3 — Happy path, asset source

- [ ] Drag `mdx/assets/logo.png` into `mdx/src/Page.mdx` → `import ${1:name} from '../assets/logo.png';` (the fixed asset shape, byte-identical to §2.3)

> **Suppressed-drop case (LaTeX only).** `.mdx` renders a non-empty snippet for every source **except `.tex`/`.bib`/`.eps`** (no asset-switch case → empty snippet → the provider suppresses the drop, nothing inserted). A `.ts`/`.tsx` source — the suppressed case in [jsx.md §9.3](jsx.md#93--unsupported-pair-ts--tsx--jsx-drop-suppression) — is rendered non-empty here; `.mdx`'s suppressed-drop sources are instead the three LaTeX extensions.

### 9.4 — Placement with Bottom mode

- [ ] In the extension settings, set **Import statement placement** to `Bottom` (the default)
- [ ] Open `mdx/destinations/with-imports.mdx` (has existing imports)
- [ ] Drag `mdx/src/Widget.tsx` → import lands after the last existing import line
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.5 — Placement with Top mode

- [ ] Set **Import statement placement** to `Top`
- [ ] Drag `mdx/src/Widget.tsx` into `mdx/destinations/with-imports.mdx` → import lands at line 1
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.6 — Placement with Cursor mode (comment-block adjustment)

- [ ] Set **Import statement placement** to `Cursor`

#### 9.6.1 — Drop onto a single `//` comment line

- [ ] Open `mdx/destinations/single-comment.mdx`, drag `mdx/src/Widget.tsx` and drop onto line 3 (`// standalone note`)
- [ ] Import inserted at line 3 (at the comment, pushing it down — same as paste Cursor §6.3.7)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 9.6.2 — Drop into a multi-line comment block

- [ ] Open `mdx/destinations/multiline-comment.mdx`, drag `mdx/src/Widget.tsx` and drop onto line 3 (the `/*` opener)
- [ ] Import is adjusted ABOVE the comment block (line 3) — same as paste Cursor §6.3.3 (a `/*` line is a comment continuation in `.mdx`)
- [ ] Undo, then drop onto line 5 (the ` * ` body line) → import lands **AT** line 5 — the markdown-star quirk applies on drop too (`computeImportPlacement` passes `isMarkdownDestination('.mdx')`), so a leading `*` is content. Contrast `.tsx`, where it adjusts above (see §10.1)
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.7 — Column is always 0

- [ ] Even if the drop position is mid-line, import inserts at column 0

### 9.8 — Angular naming applies on drop

- [ ] Drag `mdx/src/angular/user.component.ts` (no `export class`) into `mdx/src/Page.mdx`
- [ ] Import is `import { ${1:UserComponent} } from './angular/user.component';` (Angular PascalCase, same as paste §5.1)

### 9.9 — `preserveScriptFileExtension` respected on drop

- [ ] In the extension settings, check the **Preserve script file extension in imports** checkbox
- [ ] Drag `mdx/src/Widget.tsx` into `mdx/src/Page.mdx` → path is `'./Widget.tsx'`
- [ ] Drag `mdx/assets/logo.png` → path is still `'../assets/logo.png'` (asset extensions are kept regardless — the toggle is script-namespace)
- [ ] Uncheck **Preserve script file extension in imports** to restore the default

> **Universal drop precondition** (untitled / unsaved buffer is a no-op): cross-cutting across every destination and verified once in [typescript.md §9.10](typescript.md#910--universal-drop-precondition-cross-cutting--verified-once-here) — **not** re-tested here.

---

## 10 — Edge cases

### 10.1 — Markdown-star Cursor case — the `.mdx` ≠ `.tsx` proof

`.mdx` and `.tsx` share the **same** `tsx.ts` builder (`dispatch.ts` routes both there), so their imports are byte-identical. They diverge only at **Cursor placement on a leading-`*` line**: `isMarkdownDestination` is `true` for `.mdx` but `false` for `.tsx`, which flips `adjustForCommentBlock`'s treatment of `*`.

- [ ] Set **Import statement placement** to `Cursor`
- [ ] Open `mdx/destinations/leading-star.mdx` (content as in §6.3.8), place cursor on line 5 (the ` * …` line), copy `mdx/src/Widget.tsx`, paste → import lands **AT** that line (line 5) — in `.mdx`, `*` is content (bullet / emphasis), not a comment
- [ ] Open `mdx/destinations/leading-star.tsx` (byte-identical content), place cursor on the same ` * …` line, paste → import lands **ABOVE** the block (line 3) — in `.tsx`, `*` is a comment continuation
- [ ] The two buffers are identical and use the same builder, yet the insertion line differs — the only difference is `isMarkdownDestination`. Restore both files (`Cmd+Z`)

### 10.2 — Import inside a string literal (Bottom mode)

- [ ] Set **Import statement placement** to `Bottom`
- [ ] Open `mdx/destinations/string-with-import.mdx`:
  ```mdx
  export const msg = "you should import this";
  ```
- [ ] Bottom mode: the substring `import ` inside the string literal is **NOT** detected as an import marker — `isImportLine` requires a line-leading keyword, so the string is skipped; with no real import found, Bottom falls back to the top of the file (the import lands above the `export const` line)

### 10.3 — File with `require()` marker (Bottom mode)

- [ ] Open `mdx/destinations/mixed-imports.mdx`:
  ```mdx
  import { Header } from '../src/Header';
  const fs = require('fs');

  # Page
  ```
- [ ] Bottom mode: import inserted on line 3 (after the `require(` line, which is the last import marker)

### 10.4 — JS-fallback recap

- [ ] Copy `mdx/src/Card.jsx`, paste into `mdx/src/Page.mdx` → `import $1 from './Card';` (a `.jsx` source renders a **JS-shaped** import via fallback, not the TS named shape) — the running contrast to the `.ts`/`.tsx` primary path

---

## 11 — Sign-off

- [ ] Cross-import gating — accept-all matrix, one row per source category (21 rows; 0 source-extension rejections, same-file owned by general.md; 3 empty rows — `.tex`/`.bib`/`.eps`)
- [ ] Paste as Import — happy path (3 cases: TS-script / JS-script-fallback / asset)
- [ ] Insert Import from Selected File (1 case)
- [ ] Style model — arm 1A: all 7 TypeScript styles (7 cases)
- [ ] Style model — arm 1B: all 7 JavaScript styles via fallback (7 cases)
- [ ] Style model — arm 2: 4 fixed asset shapes + `.module.css`-beats-side-effect proof + asset-keeps-extension note (6 cases)
- [ ] Style-name drift safety net — `typescriptImportStyle` + `javascriptImportStyle` (2 cases)
- [ ] Smart identifier — Angular PascalCase (5 suffixes) + non-Angular + no-exported-class-fill counter-case + Angular-is-TS-source-only + preserve-stable + invalid-identifier guard (10 cases)
- [ ] Placement — Bottom (6 cases)
- [ ] Placement — Top (3 cases)
- [ ] Placement — Cursor, incl. leading-`*`-is-content divergence (8 cases)
- [ ] Paste as Import (Pick Style) — TS list / JS list / label-vs-inserted / style-0 Angular label / asset direct-insert (5 cases; no 0-variant case)
- [ ] Set Default Import Style — TS persist / JS persist / no-`mdxImportStyle` shared-setting / asset `no-configurable-style` (4 cases)
- [ ] Drag-and-drop — happy TS / happy JS-fallback / happy asset / placement (incl. markdown-star on drop) / Angular-on-drop / preserve (no raw-text-fallback) (11 cases)
- [ ] Edge cases — markdown-star `.mdx` ≠ `.tsx` proof, string-literal + `require(` false-positives, JS-fallback recap (4 cases)

**Total: ~93 test cases**
