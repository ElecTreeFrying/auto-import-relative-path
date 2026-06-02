# TSX (`.tsx` destination) — QA Checklist

TSX-specific manual QA: accept-all gating, the **two-script-arm + asset** style model (7 TypeScript styles for `.ts`/`.tsx` sources, 7 JavaScript styles for `.js`/`.jsx` sources **via fallback**, or a fixed asset shape), Angular-only smart identifiers, placement, style pickers, and drag-and-drop. `.tsx` is the **second React-family** destination (after `.jsx`) and the first to exercise `_react.ts`'s **primary + fallback** dispatch: `tsx.ts` hands `buildReactImport` a TS `primarySnippet` for `.ts`/`.tsx` sources **and** a JS `fallbackSnippet` for `.js`/`.jsx` sources. Because of that fallback, **every gated-in source renders a non-empty import** — there is **no empty-snippet case** and **no raw-text-fallback drop** (the central `.tsx` ≠ `.jsx` difference; see §4, §9).

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notifications, path computation, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/languages/tsx.ts` — `buildSnippet`: delegates to `buildReactImport` with `primaryExtensions: ['.ts', '.tsx']`, `primarySnippet: buildTypeScriptImportSnippet`, `fallbackExtensions: ['.js', '.jsx']`, `fallbackSnippet: buildJavaScriptImportSnippet`
- `src/snippets/_react.ts` — `buildReactImport`: TS-primary path + JS-fallback path (both honor `preserveScriptFileExtension`), the `.module.css`/`.module.scss` check (FIRST), and `buildAssetImportStatement` (4 asset groups, full extension via `fullPath`). `default: null` is **never reached** for a gated-in source — primary/fallback/asset cover every `SOURCE_UNIVERSE` member, which is why `.tsx` has **no** empty-snippet case
- `src/snippets/languages/typescript.ts` — `buildTypeScriptImportSnippetByStyle` (7-case switch; style-0 Angular `generateAngularLegacyImportName`, called **without** `detectedImportName` for `.tsx` → no exported-class fill); `default:` arm emits the style-0 shape (bare `$1` for `.tsx`)
- `src/snippets/languages/javascript.ts` — `buildJavaScriptImportSnippetByStyle` (7-case switch); `default:` arm emits the style-0 default-import shape
- `src/snippets/_styles.ts` — **both** `TYPESCRIPT_IMPORT_OPTIONS` (7) **and** `JAVASCRIPT_IMPORT_OPTIONS` (7) — descriptions + tags + tab-stop layout per style
- `src/snippets/variants.ts` — `buildTsxVariants` / `buildReactNonScriptVariant`: `.ts`/`.tsx` → 7 styled variants backed by `('script', 'typescript')`; `.js`/`.jsx` → 7 styled variants backed by `('script', 'javascript')`; non-script → a single hardcoded variant (no `setting`)
- `src/gating.ts` — `isPairSupported`: `.tsx ∈ CROSS_IMPORT_DESTINATIONS` → accepts every source; unlike `.jsx`, every source also renders a non-empty snippet
- `src/commands/paste-import.ts` — Paste as Import (insertion path)
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop import; registered for `scheme:'file'` only)
- `src/editor/insert-snippet.ts` — insertion orchestrator (Top / Bottom / Cursor; column 0 for script destinations)
- `src/editor/placement.ts` — placement helpers (Bottom scan, `adjustForCommentBlock`; `isMarkdownDestination('.tsx')` is **false**, so a leading `*` is a comment continuation — the basis for the §10 `.mdx` ≠ `.tsx` proof)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting`

---

## Prerequisites

- Extension Development Host launched (F5)
- QA workspace open as a folder — open `qa.new/workspace/` in the EDH via **File > Open Folder**
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

> **`.tsx` has NO dedicated `tsxImportStyle` setting** — it reuses **BOTH** existing script settings, keyed on the **source** extension: a `.ts`/`.tsx` source uses **TypeScript / TSX import style** (`typescriptImportStyle`); a `.js`/`.jsx` source uses **JavaScript / JSX import style** (`javascriptImportStyle`). Both settings' titles name `.tsx` explicitly, and both govern other destinations too (see §8).

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `tsx/src/` | Primary script sources and the `.tsx` destination: `Panel.tsx` (destination), `Widget.tsx` + `model.ts` (`.ts`/`.tsx` sources → TS arm), `helper.js` + `Card.jsx` (`.js`/`.jsx` sources → JS fallback arm), `components/Card.tsx` (nested source for §7) |
| `tsx/src/angular/` | Angular-convention `.ts` sources WITHOUT `export class` (`user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `auth.module.ts`), plus `widget.component.js` (Angular suffix on a `.js` source → JS fallback, no PascalCase) |
| `tsx/src/classes/` | `event-bus.ts` — a `.ts` source WITH `export class EventBus` (the no-exported-class-fill counter-case to `.ts`) |
| `tsx/assets/` | One fixture per non-script source category (`logo.png`, `styles.module.css`, `global.css`, `data.json`, `config.yaml`, `clip.mp4`, `theme.mp3`, `subs.vtt`, `font.woff2`, `manual.pdf`, `Hero.vue`, `notes.md`, `page.html`, `page.mdx`, …) |
| `tsx/destinations/` | Pre-filled `.tsx` files for placement tests (undo after each test) + `leading-star.mdx` for the §10 `.mdx` ≠ `.tsx` proof |

> **Asset-fixture content is irrelevant** — the import shape is keyed on the file **extension**, not the bytes, so `tsx/assets/*` fixtures can be empty stubs. For script fixtures, content matters **only** for the Angular/class cases in §5: the `tsx/src/angular/*` files must NOT contain `export class` (they test the Angular-suffix path), and `tsx/src/classes/event-bus.ts` must contain `export class EventBus` (the no-fill counter-case). All other script fixtures (`Widget.tsx`, `helper.js`, …) have no detection and can be empty stubs.

---

## 1 — Cross-import gating matrix (accept-all)

`.tsx ∈ CROSS_IMPORT_DESTINATIONS`, so `isPairSupported` returns `true` for **every** source extension (`src/gating.ts`: the first clause short-circuits because the destination is a cross-import destination, and no per-destination clause matches `.tsx`). There are therefore **no source-extension rejection rows** — the only rejection that applies to `.tsx` is the universal **same-file** rejection, owned by [general.md](general.md) (cross-reference, never re-tested here).

Unlike `.jsx`, **every accepted source also renders a non-empty snippet** (`.ts`/`.tsx` → TS primary, `.js`/`.jsx` → JS fallback, everything else → a fixed asset shape) — there are **zero empty rows**. This matrix lists one **accepted** row per source category, showing the default inserted shape. It doubles as a coverage map into §2 (happy path) and §4 (all styles / asset shapes). For each row: copy the listed source (`Cmd+Shift+A`), paste into `tsx/src/Panel.tsx` (`Cmd+I`).

| # | Source (workspace path) | Category | Expected (default style) |
|---|------------------------|----------|--------------------------|
| 1.1 | `tsx/src/model.ts` | script `.ts` → TS primary | `import { $1 } from './model';` |
| 1.2 | `tsx/src/Widget.tsx` | script `.tsx` → TS primary | `import { $1 } from './Widget';` |
| 1.3 | `tsx/src/helper.js` | script `.js` → JS fallback | `import $1 from './helper';` |
| 1.4 | `tsx/src/Card.jsx` | script `.jsx` → JS fallback | `import $1 from './Card';` |
| 1.5 | `tsx/assets/page.mdx` | script-category `.mdx` → **asset** | `import ${1:name} from '../assets/page.mdx';` |
| 1.6 | `tsx/assets/Hero.vue` | framework | `import ${1:name} from '../assets/Hero.vue';` |
| 1.7 | `tsx/assets/page.html` | html | `import ${1:name} from '../assets/page.html';` |
| 1.8 | `tsx/assets/notes.md` | markdown | `import ${1:name} from '../assets/notes.md';` |
| 1.9 | `tsx/assets/logo.png` | image | `import ${1:name} from '../assets/logo.png';` |
| 1.10 | `tsx/assets/data.json` | data | `import ${1:name} from '../assets/data.json';` |
| 1.11 | `tsx/assets/config.yaml` | data | `import ${1:name} from '../assets/config.yaml';` |
| 1.12 | `tsx/assets/manual.pdf` | document | `import ${1:name} from '../assets/manual.pdf';` |
| 1.13 | `tsx/assets/styles.module.css` | CSS module | `import ${1:styles} from '../assets/styles.module.css';` |
| 1.14 | `tsx/assets/global.css` | stylesheet | `import '../assets/global.css';` (side-effect, no tab stop) |
| 1.15 | `tsx/assets/font.woff2` | font | `import '../assets/font.woff2';` (side-effect, no tab stop) |
| 1.16 | `tsx/assets/clip.mp4` | video | `import ${1:url} from '../assets/clip.mp4';` |
| 1.17 | `tsx/assets/theme.mp3` | audio | `import ${1:url} from '../assets/theme.mp3';` |
| 1.18 | `tsx/assets/subs.vtt` | text-track | `import ${1:url} from '../assets/subs.vtt';` |

- [ ] 1.1–1.2 (`.ts`/`.tsx` sources) insert the **TS named** shape `import { $1 } from '<path>';` (the TS primary path — this is what `.jsx` cannot do; in `.jsx` a `.ts`/`.tsx` source inserts nothing)
- [ ] 1.3–1.4 (`.js`/`.jsx` sources) insert the **JS default** shape `import $1 from '<path>';` (the JS **fallback** path — NOT the TS named shape)
- [ ] 1.5 (`.mdx` source) inserts the **named asset** shape `import ${1:name} from '../assets/page.mdx';` — `.mdx` is a script-*category* extension but is **not** in the primary (`.ts`/`.tsx`) or fallback (`.js`/`.jsx`) sets, so it falls through to `buildAssetImportStatement`'s image/doc/component group
- [ ] 1.6–1.12 (framework / html / markdown / image / data / document) insert `import ${1:name} from '<full-path>';` with the **full source extension** kept
- [ ] 1.13 (`.module.css`) inserts the `${1:styles}` shape — the CSS-module check beats the side-effect shape (proof in §4)
- [ ] 1.14–1.15 (plain stylesheet / font) insert the side-effect `import '<full-path>';` with no tab stop
- [ ] 1.16–1.18 (video / audio / text-track) insert `import ${1:url} from '<full-path>';`

> Every `SOURCE_UNIVERSE` category is represented, with **no empty rows**. The four fixed asset shapes — `${1:styles}` / `${1:name}` / `${1:url}` / side-effect — are enumerated in full in §4 (arm 2). **Contrast with `.jsx`:** there, `.ts`/`.tsx` source rows read "nothing inserted"; here they render TS imports.

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

One case per source branch in the model: a `.ts`/`.tsx` script source (TS primary), a `.js`/`.jsx` script source (JS fallback), and a non-script asset source.

### 2.1 — TypeScript script source (`.tsx` → TS primary)

- [ ] Copy `tsx/src/Widget.tsx` (`Cmd+Shift+A`), open `tsx/src/Panel.tsx`, press `Cmd+I`
- [ ] Import inserted: `import { $1 } from './Widget';` (the TS **named** shape — the `typescriptImportStyle` default)
- [ ] Cursor lands on the `$1` tab stop inside the curly braces
- [ ] Import is at column 0; trailing newline appended after the import line

### 2.2 — JavaScript script source via fallback (`.js` → JS fallback)

- [ ] Copy `tsx/src/helper.js`, open `tsx/src/Panel.tsx`, press `Cmd+I`
- [ ] Import inserted: `import $1 from './helper';` (the JS **default** shape — the `javascriptImportStyle` default, **NOT** the TS named `import { $1 }`)
- [ ] Cursor lands on the `$1` tab stop (after `import`, before `from`)
- [ ] This proves the **fallback**: a `.js`/`.jsx` source dropped into a `.tsx` file emits a JS-shaped import, not a TS one

### 2.3 — Asset source (image)

- [ ] Copy `tsx/assets/logo.png`, paste into `tsx/src/Panel.tsx`
- [ ] Import inserted: `import ${1:name} from '../assets/logo.png';` (default-import with a `name` placeholder; **full `.png` extension kept**)
- [ ] Cursor lands on the `${1:name}` placeholder (text `name` pre-selected)

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `tsx/src/Widget.tsx` in the Explorer with `tsx/src/Panel.tsx` open in the editor
- [ ] Press `Alt+D`
- [ ] Import is inserted into `tsx/src/Panel.tsx` — same result as Copy + Paste: `import { $1 } from './Widget';`

---

## 4 — Style model (two script arms + asset arm)

`.tsx` resolves the import shape from the **source extension**, so item 4 has two arms — and arm 1 has **two script tables** because `.tsx` dispatches to both the TS and JS builders:

- **Arm 1A** — a `.ts`/`.tsx` source picks from the **7 TypeScript styles** (`typescriptImportStyle`).
- **Arm 1B** — a `.js`/`.jsx` source picks from the **7 JavaScript styles** (`javascriptImportStyle`, via fallback).
- **Arm 2** — a non-script asset source gets **one fixed shape** (no style dropdown applies).

There is **no empty-snippet case** (the `.jsx`-only 4C) — every gated-in source renders something.

### 4A — `.ts`/`.tsx` source: all 7 TypeScript import styles

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **TypeScript / TSX import style** dropdown. Then copy `tsx/src/Widget.tsx` and paste into `tsx/src/Panel.tsx`. Undo (`Cmd+Z`) after each test.

`tsx/src/Widget.tsx` is a plain `.tsx` source with NO Angular suffix (tests the bare tab-stop behavior; `.tsx` never reads exported classes, so it is bare `$1` regardless of file content — see §5).

> These 7 shapes are the **same** `TYPESCRIPT_IMPORT_OPTIONS` table the `.ts` destination uses — `.tsx` reuses the `typescriptImportStyle` setting for `.ts`/`.tsx` sources.

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

For each style: select the listed value from the **JavaScript / JSX import style** dropdown. Then copy `tsx/src/helper.js` and paste into `tsx/src/Panel.tsx`. Undo (`Cmd+Z`) after each test.

> A `.js`/`.jsx` source into a `.tsx` file routes through `_react.ts`'s **fallback** to the JS builder, so it picks from `JAVASCRIPT_IMPORT_OPTIONS` — the **same** table the `.js` destination uses. Note the style-0 default here (`import name`) differs from the TS style-0 default (`import { name }`).

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

Each asset source maps to exactly **one** fixed shape (no style dropdown applies). These shapes are independent of both script settings. Copy the listed source, paste into `tsx/src/Panel.tsx`, undo after each.

| Shape | Source fixture | Output | Tab stop |
|-------|----------------|--------|----------|
| CSS module (checked **first**) | `tsx/assets/styles.module.css` | `import ${1:styles} from '../assets/styles.module.css';` | `${1:styles}` |
| image / doc / component | `tsx/assets/logo.png` | `import ${1:name} from '../assets/logo.png';` | `${1:name}` |
| av / text-track | `tsx/assets/clip.mp4` | `import ${1:url} from '../assets/clip.mp4';` | `${1:url}` |
| font / stylesheet (side-effect) | `tsx/assets/font.woff2` | `import '../assets/font.woff2';` | none |

- [ ] `.module.css` → `import ${1:styles} from '../assets/styles.module.css';` (placeholder `styles`)
- [ ] image/doc/component → `import ${1:name} from '<full-path>';` (placeholder `name`)
- [ ] av/text-track → `import ${1:url} from '<full-path>';` (placeholder `url`)
- [ ] font/stylesheet → `import '<full-path>';` (no placeholder — side-effect)

#### 4C.1 — `.module.css` beats the plain side-effect shape

The `.module.css` / `.module.scss` check runs **before** the extension switch, so a CSS-module source is NOT treated as a plain stylesheet.

- [ ] Copy `tsx/assets/styles.module.css`, paste → `import ${1:styles} from '../assets/styles.module.css';` (the `${1:styles}` shape)
- [ ] Copy `tsx/assets/global.css` (a plain `.css`), paste → `import '../assets/global.css';` (side-effect, no tab stop)
- [ ] The two `.css` sources produce **different** shapes — the `.module.*` suffix is what routes to the `${1:styles}` shape

#### 4C.2 — Non-script assets keep the full extension even with preserve OFF

`preserveScriptFileExtension` is a **script-namespace** setting; `_react.ts` builds asset paths from `fullPath`, which always carries the source extension (it is read from the raw source path, not the preserve-gated path used for the script arms).

- [ ] Confirm **Preserve script file extension in imports** is unchecked (`false`, the default)
- [ ] Copy `tsx/assets/logo.png`, paste → `import ${1:name} from '../assets/logo.png';` (the `.png` extension is **still present** — the toggle does not strip asset extensions)

### 4D — Style-name drift (config-drift safety net)

A hand-typed / drifted `*ImportStyle` value (matching no enum description) must still insert the **style-0 shape**, never nothing (`resolveStyleIndex` → `undefined` → builder `default:` arm). `.tsx` is tested on **both** script settings.

#### 4D.1 — `typescriptImportStyle` drift (`.ts`/`.tsx` source)

- [ ] In `settings.json`, set `auto-import.importStatement.script.typescriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `tsx/src/Widget.tsx`, paste into `tsx/src/Panel.tsx` → `import { $1 } from './Widget';` (style-0 named shape — **NOT** empty)
- [ ] The tab stop is a bare `$1`. Unlike the `.ts` destination — whose `default:` arm pre-fills a detected class — `.tsx` passes **no** `detectedImportName` and the `default:` arm runs **no** Angular naming (Angular lives only in `case 0`), so even `tsx/src/angular/user.component.ts` drifts to a bare `import { $1 } from './angular/user.component';`
- [ ] Restore: set **TypeScript / TSX import style** back to `import { name } from '_relativePath_';`

#### 4D.2 — `javascriptImportStyle` drift (`.js`/`.jsx` source)

- [ ] In `settings.json`, set `auto-import.importStatement.script.javascriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `tsx/src/helper.js`, paste into `tsx/src/Panel.tsx` → `import $1 from './helper';` (style-0 default-import shape — **NOT** empty)
- [ ] Restore: set **JavaScript / JSX import style** back to `import name from '_relativePath_';`

---

## 5 — Smart identifier behavior (Angular-PascalCase only, style 0)

`.tsx` routes `.ts`/`.tsx` sources through the TypeScript builder, whose style-0 calls `generateAngularLegacyImportName`. But `.tsx` invokes it **without** a `detectedImportName` (`tsx.ts` → `_react.ts` primary is one-arg; `variants.ts:buildTsxVariants` passes no third arg), so `readExportedClassName` is **never called** → there is **no exported-class fill**. The result is **Angular-PascalCase only**, and only for `.ts`/`.tsx` sources. Styles 1–6 always emit a bare `$1`.

> This is the section that distinguishes `.tsx` smart-ID from `.ts`: `.ts` runs **both** exported-class detection and Angular naming ([typescript.md §5.A + §5.B](typescript.md#5--smart-identifier-behavior-style-0-only)); `.tsx` runs **Angular only**. Emit **no** exported-class detection case — that is `.ts`-destination-only.

Style must be set to index 0 (`import { name } from '_relativePath_';`).

### 5.1 — `.component` suffix

- [ ] Copy `tsx/src/angular/user.component.ts` (no `export class`) → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import { UserComponent } from './angular/user.component';` (PascalCase identifier filled directly — a committed identifier, **not** an editable `${1:…}` tab stop)

### 5.2 — `.directive` suffix

- [ ] Copy `tsx/src/angular/highlight.directive.ts` → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import { HighlightDirective } from './angular/highlight.directive';`

### 5.3 — `.pipe` suffix

- [ ] Copy `tsx/src/angular/trim.pipe.ts` → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import { TrimPipe } from './angular/trim.pipe';`

### 5.4 — `.service` suffix

- [ ] Copy `tsx/src/angular/user.service.ts` → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import { UserService } from './angular/user.service';`

### 5.5 — `.module` suffix

- [ ] Copy `tsx/src/angular/auth.module.ts` → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import { AuthModule } from './angular/auth.module';`

### 5.6 — Non-Angular `.ts`/`.tsx` source (no suffix match)

- [ ] Copy `tsx/src/Widget.tsx` (no Angular suffix) → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import { $1 } from './Widget';` (bare tab stop, NOT `Widget`)

### 5.7 — Exported class is NOT filled (the counter-case to `.ts` §5.A)

This is the signature `.tsx` ≠ `.ts` case. A `.ts`/`.tsx` source containing `export class …` is read for its class name by the `.ts` destination, but **never** by `.tsx`.

- [ ] Copy `tsx/src/classes/event-bus.ts` (contains `export class EventBus { }`, no Angular suffix) → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import { $1 } from './classes/event-bus';` — a **bare** tab stop, NOT `${1:EventBus}` (the `.tsx` builder never calls `readExportedClassName`). Contrast [typescript.md §5.A.1](typescript.md#5a--exported-class-detection-style-0-ts-destination-only), where the same source yields `import { ${1:EventBus} } from …`

### 5.8 — Angular naming is `.ts`/`.tsx`-source-only (`.js`/`.jsx` source → JS fallback)

- [ ] Copy `tsx/src/angular/widget.component.js` (an Angular-suffixed `.js` source) → paste into `tsx/src/Panel.tsx`
- [ ] Output: `import $1 from './angular/widget.component';` — a **bare** default-import, NOT `import { WidgetComponent }`. A `.js`/`.jsx` source takes the JS **fallback**, which has no Angular naming. Contrast §5.1 (a `.component.ts` source → `import { UserComponent }`)

### 5.9 — Preserve-extension identifier stability

- [ ] With **Preserve script file extension in imports** unchecked (default): copy `tsx/src/angular/user.component.ts`, paste → `import { UserComponent } from './angular/user.component';`
- [ ] Check the **Preserve script file extension in imports** checkbox, copy `tsx/src/angular/user.component.ts`, paste → `import { UserComponent } from './angular/user.component.ts';`
- [ ] The identifier is **identical** (`UserComponent`) in both cases — never `UserComponentTs` — because the extension is stripped before the name is derived; only the path string changes
- [ ] Restore: uncheck **Preserve script file extension in imports**

---

## 6 — Placement modes

`.tsx` uses the **generic** placement mode (column 0; full Top / Bottom / Cursor honoring) — the same mechanism as `.ts`/`.js`/`.jsx`/`.mdx`. `.tsx` is **not** Markdown (`isMarkdownDestination('.tsx')` is `false`), so a leading `*` line is treated as a comment continuation (§6.3.8) — the explicit counter-case to `.md`/`.mdx` and the basis for the §10 `.mdx` ≠ `.tsx` proof.

### 6.1 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 6.1.1 — Empty file

- [ ] Copy `tsx/src/Widget.tsx`, paste into `tsx/destinations/empty.tsx` → import inserted at line 0

#### 6.1.2 — File with existing imports

- [ ] Open `tsx/destinations/with-imports.tsx`:
  ```tsx
  import { Header } from '../src/Header';
  import { Footer } from '../src/Footer';

  export const Page = () => null;
  ```
- [ ] Copy `tsx/src/Widget.tsx`, paste → import inserted on line 2 (after `import { Footer }`, before the blank line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.3 — File with `require()` import

- [ ] Open `tsx/destinations/with-require.tsx`:
  ```tsx
  const fs = require('fs');
  ```
- [ ] Copy `tsx/src/Widget.tsx`, paste → import inserted on line 1 (after the `require(` line — `require(` is one of the `IMPORT_INDICATORS` markers)

#### 6.1.4 — File with comments containing the `import` keyword

- [ ] Open `tsx/destinations/commented-imports.tsx`:
  ```tsx
  // import { Footer } from '../src/Footer';
  import { Header } from '../src/Header';
  ```
- [ ] The commented line is skipped — import inserted on line 2 (after the real import, NOT after the comment)

#### 6.1.5 — File with only comments

- [ ] Open `tsx/destinations/comments-only.tsx`:
  ```tsx
  // This file has no imports
  /* Just comments */
  ```
- [ ] No import marker found → import inserted at line 0

#### 6.1.6 — Column is always 0

- [ ] Regardless of cursor position, import is inserted at column 0 (leftmost)

### 6.2 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), set **Import statement placement** to `Top`

#### 6.2.1 — File with existing imports

- [ ] Open `tsx/destinations/with-imports.tsx` (same content as §6.1.2)
- [ ] Copy `tsx/src/Widget.tsx`, paste → import inserted at line 0 (before `import { Header }`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.2 — Empty file

- [ ] Copy `tsx/src/Widget.tsx`, paste into `tsx/destinations/empty.tsx` → import at line 0

#### 6.2.3 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 6.3 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import statement placement** to `Cursor`

#### 6.3.1 — Cursor on a blank line

- [ ] Open `tsx/destinations/with-imports.tsx`, place cursor on line 2 (the blank line)
- [ ] Copy `tsx/src/Widget.tsx`, paste → import inserted at line 2
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.2 — Cursor at end of file

- [ ] Open `tsx/destinations/with-imports.tsx`, place cursor on the last line, paste → import at cursor line
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.3 — Cursor inside a multi-line comment block

- [ ] Open `tsx/destinations/multiline-comment.tsx`:
  ```tsx
  import { Header } from '../src/Header';

  /*
   * Some documentation
   * about this module
   */
  export const Page = () => null;
  ```
- [ ] Place cursor on line 4 (inside the `/* */` block), paste
- [ ] Import is adjusted ABOVE the comment block (line 2), NOT at line 4

#### 6.3.4 — Cursor on a `//` comment line within a comment group

- [ ] Open `tsx/destinations/comment-group.tsx`:
  ```tsx
  // Line one of comment
  // Line two of comment
  // Line three of comment
  ```
- [ ] Place cursor on line 1, paste → import adjusted to line 0 (above the comment block)

#### 6.3.5 — Cursor on a non-comment line

- [ ] Open `tsx/destinations/with-imports.tsx`, place cursor on line 3 (`export const Page = () => null;`)
- [ ] Copy `tsx/src/Widget.tsx`, paste → import inserted at line 3
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.6 — Column is always 0

- [ ] Even with cursor at column 20, import inserts at column 0

#### 6.3.7 — Cursor on a single isolated `//` comment (not a group)

- [ ] Open `tsx/destinations/single-comment.tsx`:
  ```tsx
  import { Header } from '../src/Header';

  // standalone note

  export const Page = () => null;
  ```
- [ ] Place cursor on line 2 (`// standalone note`), paste
- [ ] Import inserted at line 2 (AT the comment, pushing it to line 3 — unlike a comment group where the import moves above the block)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.8 — Cursor on a leading-`*` line (NOT Markdown — counter-case to `.md`/`.mdx`)

- [ ] Open `tsx/destinations/leading-star.tsx`:
  ```tsx
  import { Header } from '../src/Header';

  /**
   * A JSDoc-style comment block.
   * The second body line begins with `*`.
   */
  export const Page = () => null;
  ```
- [ ] Place cursor on line 4 (the ` * The second body line…` line), paste
- [ ] Import is adjusted ABOVE the comment block (line 2) — in `.tsx`, a leading `*` is a **comment continuation** (`isMarkdownDestination('.tsx')` is `false`)
- [ ] **Contrast:** in `.md`/`.mdx`, the same leading-`*` line is treated as **content** (bullet / emphasis), so the import would land **at** that line — see §10.1
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 7 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change, single-variant fast path) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 7.1 — `.ts`/`.tsx` source: QuickPick shows all 7 TS styles

- [ ] Copy `tsx/src/Widget.tsx`, run Paste as Import (Pick Style) in `tsx/src/Panel.tsx`
- [ ] QuickPick appears with placeholder text: `Select an import style`
- [ ] 7 items listed, one per TypeScript import style
- [ ] Each item has a **label** (the snippet preview using `path.basename` of the source — e.g. `import { name } from 'Widget';`) and a **description** (the style's tag — e.g. `ES module: named import — legacy Angular files …`)

### 7.2 — `.js`/`.jsx` source: QuickPick shows all 7 JS styles

- [ ] Copy `tsx/src/helper.js`, run Paste as Import (Pick Style) in `tsx/src/Panel.tsx`
- [ ] 7 items listed, one per JavaScript import style (the **fallback** table — not the TS table)
- [ ] The style-0 label is `import name from 'helper';` (the JS default-import shape, basename preview)

### 7.3 — Label = basename, inserted = full path

- [ ] Copy `tsx/src/components/Card.tsx` (a nested `.tsx` source), run the command in `tsx/src/Panel.tsx`
- [ ] Select `import * as name from '_relativePath_';` from the picker — its label previews the **basename**: `import * as name from 'Card';`
- [ ] Verify the INSERTED text uses the **full relative path**: `import * as $1 from './components/Card';`

### 7.4 — Style-0 TS label is Angular-prefilled for a suffixed path

- [ ] Copy `tsx/src/angular/user.component.ts`, run the command in `tsx/src/Panel.tsx`
- [ ] The style-0 item's **label** is `import { UserComponent } from 'user.component';` (basename preview, Angular PascalCase filled — `generateAngularLegacyImportName` runs on the label path too)
- [ ] Selecting it inserts `import { UserComponent } from './angular/user.component';` (full path)
- [ ] Styles 1–6 show a bare `name` placeholder in their labels (Angular fills only style 0)

### 7.5 — Asset source: single fixed variant (direct insert)

A non-script asset has exactly **one** variant (the fixed shape), so the single-variant fast path applies — the picker is not shown and the import is inserted directly ([general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics)).

- [ ] Copy `tsx/assets/logo.png`, run Paste as Import (Pick Style) in `tsx/src/Panel.tsx`
- [ ] No style list appears (one variant only) → `import ${1:name} from '../assets/logo.png';` is inserted directly
- [ ] (Were the picker shown, the single item's label would be the basename preview `import name from 'logo.png';` with an empty description — hardcoded variants carry no tag)

> **No 0-variant case.** Unlike [jsx.md §7.4](jsx.md#74--ts--tsx-source-zero-variants) (where a `.ts`/`.tsx` source produces zero picker variants), **every** `.tsx` source produces at least one variant — `.ts`/`.tsx` → 7 TS, `.js`/`.jsx` → 7 JS, non-script → 1 fixed. There is no empty picker.

---

## 8 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark on current default, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

### 8.1 — `.ts`/`.tsx` source: selecting a TS style persists to `typescriptImportStyle`

- [ ] Copy `tsx/src/Widget.tsx`, run Set Default Import Style in `tsx/src/Panel.tsx`
- [ ] Select `import type { name } from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import type { name } from '_relativePath_';`
- [ ] Check VS Code Settings → **TypeScript / TSX import style** (`typescriptImportStyle`) is now `import type { name } from '_relativePath_';`
- [ ] Reset: run the command again on `tsx/src/Widget.tsx`, select `import { name } from '_relativePath_';` to restore the default

### 8.2 — `.js`/`.jsx` source: selecting a JS style persists to `javascriptImportStyle`

- [ ] Copy `tsx/src/helper.js`, run Set Default Import Style in `tsx/src/Panel.tsx`
- [ ] Select `import * as name from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import * as name from '_relativePath_';`
- [ ] Check VS Code Settings → **JavaScript / JSX import style** (`javascriptImportStyle`) is now `import * as name from '_relativePath_';`
- [ ] Reset: run the command again on `tsx/src/helper.js`, select `import name from '_relativePath_';` to restore the default

### 8.3 — Shared-setting cross-effect (no `tsxImportStyle`)

`.tsx` has **no** `tsxImportStyle` key — §8.1 wrote `typescriptImportStyle` and §8.2 wrote `javascriptImportStyle`, the **same** two keys that govern other destinations.

- [ ] In VS Code Settings, confirm there is **no** `tsxImportStyle` setting — the value from §8.1 lives under **TypeScript / TSX import style** (`auto-import.importStatement.script.typescriptImportStyle`) and the value from §8.2 under **JavaScript / JSX import style** (`auto-import.importStatement.script.javascriptImportStyle`)
- [ ] `typescriptImportStyle` also governs `.ts` destinations and `.ts`/`.tsx` sources into `.mdx`/`.vue`/`.svelte`/`.astro`; `javascriptImportStyle` also governs `.js` destinations and `.js`/`.jsx` sources into `.jsx`/`.mdx`. Setting either default from a `.tsx` paste therefore changes that style everywhere the key is read
- [ ] Confirm both settings were restored to their defaults in §8.1 / §8.2

### 8.4 — Asset source: no configurable style

A non-script asset's single variant carries no backing setting, so there is nothing to persist.

- [ ] Copy `tsx/assets/logo.png`, run Set Default Import Style in `tsx/src/Panel.tsx`
- [ ] Warning toast: `Auto Import: .png → .tsx imports use a fixed style.` (the `no-configurable-style` reject) — no picker, no setting written

---

## 9 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.tsx` editor. A drop reuses the same `buildImportSnippet` + `computeImportPlacement` pipeline as paste, so the inserted string is **byte-identical** to the §2 happy path. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 9.1 — Happy path, TypeScript script source (`.tsx` → `.tsx`)

- [ ] Drag `tsx/src/Widget.tsx` from Explorer into `tsx/src/Panel.tsx` editor
- [ ] Import inserted using the default TypeScript style — `import { $1 } from './Widget';` (byte-identical to the §2.1 paste result)
- [ ] Placement follows the `importStatementPlacement` setting (same as paste)

### 9.2 — Happy path, JavaScript script source via fallback (`.js` → `.tsx`)

- [ ] Drag `tsx/src/helper.js` into `tsx/src/Panel.tsx` → `import $1 from './helper';` (the JS **default** shape via fallback, byte-identical to §2.2 — NOT a TS named import)

### 9.3 — Happy path, asset source

- [ ] Drag `tsx/assets/logo.png` into `tsx/src/Panel.tsx` → `import ${1:name} from '../assets/logo.png';` (the fixed asset shape, byte-identical to §2.3)

> **No raw-text-fallback drop.** `.tsx` accepts every source **and** renders a non-empty snippet for all of them, so a drop never resolves to `null` — there is no raw-path text fallback. This is the contrast to [jsx.md §9.3](jsx.md#93--unsupported-pair-ts--tsx--jsx-raw-text-fallback), where a `.ts`/`.tsx` source builds an empty snippet and VS Code's default text-drop drops the raw path. `.tsx` has no such case.

### 9.4 — Placement with Bottom mode

- [ ] In the extension settings, set **Import statement placement** to `Bottom` (the default)
- [ ] Open `tsx/destinations/with-imports.tsx` (has existing imports)
- [ ] Drag `tsx/src/Widget.tsx` → import lands after the last existing import line
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.5 — Placement with Top mode

- [ ] Set **Import statement placement** to `Top`
- [ ] Drag `tsx/src/Widget.tsx` into `tsx/destinations/with-imports.tsx` → import lands at line 0
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.6 — Placement with Cursor mode (comment-block adjustment)

- [ ] Set **Import statement placement** to `Cursor`

#### 9.6.1 — Drop onto a single `//` comment line

- [ ] Open `tsx/destinations/single-comment.tsx`, drag `tsx/src/Widget.tsx` and drop onto line 2 (`// standalone note`)
- [ ] Import inserted at line 2 (at the comment, pushing it down — same as paste Cursor §6.3.7)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 9.6.2 — Drop into a multi-line comment block

- [ ] Open `tsx/destinations/multiline-comment.tsx`, drag `tsx/src/Widget.tsx` and drop onto line 4 (inside the `/* */` block)
- [ ] Import is adjusted ABOVE the comment block (line 2) — same as paste Cursor §6.3.3
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.7 — Column is always 0

- [ ] Even if the drop position is mid-line, import inserts at column 0

### 9.8 — Angular naming applies on drop

- [ ] Drag `tsx/src/angular/user.component.ts` (no `export class`) into `tsx/src/Panel.tsx`
- [ ] Import is `import { UserComponent } from './angular/user.component';` (Angular PascalCase, same as paste §5.1)

### 9.9 — `preserveScriptFileExtension` respected on drop

- [ ] In the extension settings, check the **Preserve script file extension in imports** checkbox
- [ ] Drag `tsx/src/Widget.tsx` into `tsx/src/Panel.tsx` → path is `'./Widget.tsx'`
- [ ] Drag `tsx/assets/logo.png` → path is still `'../assets/logo.png'` (asset extensions are kept regardless — the toggle is script-namespace)
- [ ] Uncheck **Preserve script file extension in imports** to restore the default

> **Universal drop precondition** (untitled / unsaved buffer is a no-op): cross-cutting across all 12 destinations and verified once in [typescript.md §9.10](typescript.md#910--universal-drop-precondition-cross-cutting--verified-once-here) — **not** re-tested here.

---

## 10 — Edge cases

### 10.1 — Markdown-star Cursor case — the `.mdx` ≠ `.tsx` proof

`.mdx` and `.tsx` share the **same** `tsx.ts` builder (`dispatch.ts` routes both there), so their imports are byte-identical. They diverge only at **Cursor placement on a leading-`*` line**: `isMarkdownDestination` is `true` for `.mdx` but `false` for `.tsx`, which flips `adjustForCommentBlock`'s treatment of `*`.

- [ ] Set **Import statement placement** to `Cursor`
- [ ] Open `tsx/destinations/leading-star.tsx` (content as in §6.3.8), place cursor on line 4 (the ` * …` line), copy `tsx/src/Widget.tsx`, paste → import lands **ABOVE** the block (line 2) — `*` is a comment continuation
- [ ] Open `tsx/destinations/leading-star.mdx` (byte-identical content), place cursor on the same ` * …` line, paste → import lands **AT** that line — in `.mdx`, `*` is content (bullet / emphasis), not a comment
- [ ] The two buffers are identical and use the same builder, yet the insertion line differs — the only difference is `isMarkdownDestination`. Restore both files (`Cmd+Z`)

### 10.2 — Import inside a string literal (Bottom mode)

- [ ] Set **Import statement placement** to `Bottom`
- [ ] Open `tsx/destinations/string-with-import.tsx`:
  ```tsx
  const msg = "you should import this";
  ```
- [ ] Bottom mode: the substring `import ` inside the string literal IS detected as an import marker (known heuristic limitation — not a bug); the import lands after that line

### 10.3 — File with `require()` marker (Bottom mode)

- [ ] Open `tsx/destinations/mixed-imports.tsx`:
  ```tsx
  import { Header } from '../src/Header';
  const fs = require('fs');

  export const Page = () => null;
  ```
- [ ] Bottom mode: import inserted on line 2 (after the `require(` line, which is the last import marker)

### 10.4 — JS-fallback recap

- [ ] Copy `tsx/src/Card.jsx`, paste into `tsx/src/Panel.tsx` → `import $1 from './Card';` (a `.jsx` source renders a **JS-shaped** import via fallback, not the TS named shape) — the running contrast to the `.ts`/`.tsx` primary path

---

## 11 — Sign-off

- [ ] Cross-import gating — accept-all matrix, one row per source category (18 rows; 0 source-extension rejections, same-file owned by general.md; 0 empty rows)
- [ ] Paste as Import — happy path (3 cases: TS-script / JS-script-fallback / asset)
- [ ] Insert Import from Selected File (1 case)
- [ ] Style model — arm 1A: all 7 TypeScript styles (7 cases)
- [ ] Style model — arm 1B: all 7 JavaScript styles via fallback (7 cases)
- [ ] Style model — arm 2: 4 fixed asset shapes + `.module.css`-beats-side-effect proof + asset-keeps-extension note (6 cases)
- [ ] Style-name drift safety net — `typescriptImportStyle` + `javascriptImportStyle` (2 cases)
- [ ] Smart identifier — Angular PascalCase (5 suffixes) + non-Angular + no-exported-class-fill counter-case + Angular-is-TS-source-only + preserve-stable (9 cases)
- [ ] Placement — Bottom (6 cases)
- [ ] Placement — Top (3 cases)
- [ ] Placement — Cursor, incl. leading-`*`-is-comment (8 cases)
- [ ] Paste as Import (Pick Style) — TS list / JS list / label-vs-inserted / style-0 Angular label / asset direct-insert (5 cases; no 0-variant case)
- [ ] Set Default Import Style — TS persist / JS persist / no-`tsxImportStyle` shared-setting / asset `no-configurable-style` (4 cases)
- [ ] Drag-and-drop — happy TS / happy JS-fallback / happy asset / placement / Angular-on-drop / preserve (no raw-text-fallback) (11 cases)
- [ ] Edge cases — markdown-star `.mdx` ≠ `.tsx` proof, string-literal + `require(` false-positives, JS-fallback recap (4 cases)

**Total: ~89 test cases**
