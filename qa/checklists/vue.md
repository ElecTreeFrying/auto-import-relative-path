# Vue (`.vue` destination) — QA Checklist

Vue-specific manual QA: **allow-list** gating, the **two-arm** style model (7 TypeScript styles for **all four** script sources `.ts`/`.tsx`/`.js`/`.jsx`, or a fixed asset shape for non-script sources), Angular-only smart identifiers, **SFC `<script>`-block** placement, style pickers, and drag-and-drop. `.vue` is the pipeline's **first framework-trio destination** — `.vue`, `.svelte`, and `.astro` all share one builder, `src/snippets/languages/framework-component.ts`.

Every `.vue` behavior flows from a single routing fact in that builder: it branches on its **own local** `SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]` and routes **all four** to `buildTypeScriptImportSnippet` (the TypeScript builder, called **one-arg** — no `detectedImportName`); **everything else** gated-in goes to `buildAssetImportStatement`. It **never** calls `determineImportType`. Two consequences cascade from that one `if`:

1. A `.js`/`.jsx` source renders a **TypeScript** `import { $1 }` shape — **not** a JS default import. This is the headline divergence from `.tsx`/`.mdx` (where `.js`/`.jsx` sources fall through to the JS builder). There is **one** script style table for `.vue`, not two.
2. Because the builder is called without a `detectedImportName`, `readExportedClassName` is **never** invoked → there is **no exported-class pre-fill**. Smart identifiers are **Angular-PascalCase only** — but they fire for **all four** script extensions (so even a `.js` Angular file pre-fills, unlike `.tsx`/`.mdx`).

> **`.vue` has NO dedicated `vueImportStyle` setting.** The script arm reuses **`typescriptImportStyle`** (the **same** setting `.ts`/`.tsx`/`.mdx` use). `package.json`'s *"TypeScript / TSX import style"* description names it explicitly: *"…and for all script sources imported into .vue, .svelte, or .astro files."* Changing that default while QA-ing `.vue` also moves `.ts`/`.tsx`/`.mdx` — see §8.

> **`.vue` is allow-list, not accept-all.** Stylesheets (`.css`/`.scss`), fonts, `.html`, `.md`, `.mdx`, `.pdf`, and the other framework extensions (`.svelte`/`.astro`) are **gate-rejected** (not in `VUE_SUPPORTED_EXTENSIONS`). That eliminates whole sub-cases the React trio has: there is **no** CSS-module shape, **no** side-effect (font/plain-stylesheet) shape, and **no** empty-snippet case. Only the **named-default** and **url-default** asset arms are reachable. (`.ts`/`.tsx`/`.js`/`.jsx` are accepted but script-routed, so — unlike `.jsx` — there is no 0-variant source.)

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notification wording + toast buttons, path computation, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/dispatch.ts` — `buildImportSnippet`: the `case '.vue': case '.svelte': case '.astro':` arm routes all three to `frameworkComponent.buildSnippet`
- `src/snippets/languages/framework-component.ts` — `buildSnippet` (the `.vue` builder): local `SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]`; script sources → `buildTypeScriptImportSnippet(relativePath + ext)` **one-arg**; everything else → `buildAssetImportStatement(sourceExt, relativePath + ext)`. Asset path is built from the raw source ext (always full); script path honors `preserveScriptFileExtension`. **Never** calls `determineImportType`
- `src/snippets/languages/typescript.ts` — `buildTypeScriptImportSnippetByStyle` (7-case switch; style-0 calls `generateAngularLegacyImportName`, but **without** a `detectedImportName` for `.vue` → no exported-class fill; the `/^[A-Za-z_$][\w$]*$/` identifier validity guard at `:75`); the `default:` arm emits the style-0 shape and runs **no** Angular naming (Angular lives only in `case 0`)
- `src/snippets/_react.ts` — `buildAssetImportStatement`: the `.module.css`/`.module.scss` check (FIRST, but **unreachable for `.vue`** — stylesheets gated out) + the asset `switch`. For `.vue` only the **named-default** (`import ${1:name}` — image / data / doc / component incl. `.vue`/`.svelte`/`.astro`) and **url-default** (`import ${1:url}` — av / text-track) arms are reachable; the font/stylesheet side-effect arm and `default: null` never fire for a gated-in `.vue` source
- `src/snippets/_styles.ts` — `TYPESCRIPT_IMPORT_OPTIONS` (7) — descriptions + tags + tab-stop layout per style
- `src/snippets/variants.ts` — `buildFrameworkComponentVariants` (shared by the `.vue`/`.svelte`/`.astro` case): `.ts`/`.tsx`/`.js`/`.jsx` → 7 TS styled variants backed by `('script', 'typescript')`; non-script → a single hardcoded variant via `buildReactNonScriptVariant` (no `setting`). Called **without** `detectedImportName`, so style-0 is Angular-only (no exported-class fill)
- `src/gating.ts` — `isPairSupported`: `.vue ∈ CROSS_IMPORT_DESTINATIONS` passes the first clause, then `destinationFileExt === '.vue' && !VUE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` rejects non-members
- `src/constants/extensions.ts` — `VUE_SUPPORTED_EXTENSIONS` (the literal accept-list); `.vue ∈ SCRIPT_FILE_EXTENSIONS` (column 0)
- `src/commands/paste-import.ts` — Paste as Import (insertion path)
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop import; registered for `scheme:'file'` only). A rejected pair (or empty snippet) → `'not-supported'` toast + return `null` → VS Code falls back to a raw text-drop
- `src/editor/insert-snippet.ts` — `insertSnippetAtSfcScript` (the `.vue`/`.svelte` placement orchestrator; column 0 for script destinations)
- `src/editor/placement.ts` — `computeSfcPlacement` / `findSfcScriptBounds` (block selection preference; create-if-missing wrapper; `findBottomLineInRange`; `detectBlockIndentation`; `adjustForCommentBlock`)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting`; confirms there is **no** `vueImportStyle` — the framework script arm reads/writes `('script', 'typescript')` → `typescriptImportStyle`

---

## Prerequisites

- Extension Development Host launched (F5)
- QA workspace open as a folder — open `qa/workspace/` in the EDH via **File > Open Folder**
- Default settings restored: `importStatementPlacement = "Bottom"`, `preserveScriptFileExtension = false`, `typescriptImportStyle = "import { name } from '_relativePath_';"`

### How to change extension settings

1. Open VS Code Settings: <kbd>Cmd</kbd>+<kbd>,</kbd> (macOS) or <kbd>Ctrl</kbd>+<kbd>,</kbd> (Windows/Linux).
2. In the left sidebar, scroll down and expand **Extensions**.
3. Click **Auto Import Relative Path** — the extension's settings appear in the main panel.

The settings used in this checklist:

| Setting label in UI | Type | Default |
|---|---|---|
| TypeScript / TSX import style | dropdown | `import { name } from '_relativePath_';` |
| Preserve script file extension in imports | checkbox | unchecked (`false`) |
| Import statement placement | dropdown | `Bottom` |

> **There is no `vueImportStyle`.** A `.vue` destination uses **TypeScript / TSX import style** (`typescriptImportStyle`) for **all four** script sources — `.ts`, `.tsx`, **and** `.js`/`.jsx`. The **JavaScript / JSX import style** setting is **never** consulted for a `.vue` destination (the `.js`/`.jsx` → JS-builder fallback that `.tsx`/`.mdx` use does not exist here).

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `vue/src/` | The `.vue` destination `App.vue` (has an empty `<script setup>` block) + the four script sources: `model.ts`, `Widget.tsx` (`.ts`/`.tsx` → TS arm), `helper.js`, `Card.jsx` (`.js`/`.jsx` → **also** TS arm); `components/Widget.tsx` (nested source for §7) |
| `vue/src/angular/` | Angular-convention sources WITHOUT `export class`: `user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `auth.module.ts`; `widget.component.js` (Angular suffix on a **`.js`** source — fills here, unlike `.tsx`/`.mdx`); `2fa.service.ts` (illegal-identifier guard) |
| `vue/src/classes/` | `event-bus.ts` — a `.ts` source WITH `export class EventBus` (the no-exported-class-fill counter-case) |
| `vue/assets/` | One fixture per non-script source category: `logo.png`, `data.json`, `config.yaml`, `config.yml`, `clip.mp4`, `theme.mp3`, `subs.vtt`, `BaseButton.vue` (the `.vue`→`.vue` self-import quirk). Plus **reject fixtures** (gated out): `page.mdx`, `Widget.svelte`, `Layout.astro`, `global.css`, `theme.scss`, `page.html`, `notes.md`, `font.woff2`, `manual.pdf` |
| `vue/destinations/` | Pre-filled `.vue` files for placement tests (undo after each): `setup-and-instance.vue`, `instance-only.vue`, `with-imports.vue`, `indented-imports.vue`, `template-only.vue` (no `<script>`), `with-require.vue`, `string-literal.vue`, `comment-cursor.vue` |

`vue/src/App.vue` (the primary paste destination) is:

```vue
<script setup>
</script>

<template>
  <div></div>
</template>
```

> **Asset-fixture content is irrelevant** — the import shape is keyed on the file **extension**, not the bytes, so `vue/assets/*` fixtures can be empty stubs. For script fixtures, content matters **only** for the Angular/class cases in §5: the `vue/src/angular/*` files must NOT contain `export class` (they test the Angular-suffix path), and `vue/src/classes/event-bus.ts` must contain `export class EventBus` (the no-fill counter-case). All other script fixtures (`Widget.tsx`, `helper.js`, …) have no detection and can be empty stubs.

---

## 1 — Cross-import gating matrix (allow-list)

`.vue` is an **allow-list** destination: `.vue ∈ CROSS_IMPORT_DESTINATIONS` (so the first `gating.ts` clause short-circuits), then `destinationFileExt === '.vue' && !VUE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` **rejects** every source not in the list. So §1 is an **ACCEPT-vs-REJECT** matrix.

**`VUE_SUPPORTED_EXTENSIONS`** (literal accept-list): `.vue` · `.ts` `.js` `.jsx` `.tsx` · `.json` `.yml` `.yaml` · image (`.gif .jpeg .jpg .png .svg .avif .webp`) · media (`.mp4 .webm .mov .mp3 .ogg .wav .m4a`) · `.vtt`. The reject set is the mechanical complement `SOURCE_UNIVERSE − accept`, sampling ≥1 member per reject category present. (`.vue`/`.svelte`/`.astro` are the **only** destinations that accept data — `.json`/`.yml`/`.yaml` are **accept** rows here.)

For each **accept** row: copy the listed source (`Cmd+Shift+A`), paste into `vue/src/App.vue` (`Cmd+I`). This matrix doubles as a coverage map into §2 (happy path) and §4 (all styles / asset shapes).

| # | Source (workspace path) | Category | Expected (default style) |
|---|------------------------|----------|--------------------------|
| 1.1 | `vue/src/model.ts` | script `.ts` → **TS** named | `import { $1 } from './model';` |
| 1.2 | `vue/src/Widget.tsx` | script `.tsx` → **TS** named | `import { $1 } from './Widget';` |
| 1.3 | `vue/src/helper.js` | script `.js` → **TS** named | `import { $1 } from './helper';` |
| 1.4 | `vue/src/Card.jsx` | script `.jsx` → **TS** named | `import { $1 } from './Card';` |
| 1.5 | `vue/assets/BaseButton.vue` | framework (self) → **asset** | `import ${1:name} from '../assets/BaseButton.vue';` |
| 1.6 | `vue/assets/data.json` | data | `import ${1:name} from '../assets/data.json';` |
| 1.7 | `vue/assets/config.yaml` | data | `import ${1:name} from '../assets/config.yaml';` |
| 1.8 | `vue/assets/config.yml` | data | `import ${1:name} from '../assets/config.yml';` |
| 1.9 | `vue/assets/logo.png` | image | `import ${1:name} from '../assets/logo.png';` |
| 1.10 | `vue/assets/clip.mp4` | video | `import ${1:url} from '../assets/clip.mp4';` |
| 1.11 | `vue/assets/theme.mp3` | audio | `import ${1:url} from '../assets/theme.mp3';` |
| 1.12 | `vue/assets/subs.vtt` | text-track | `import ${1:url} from '../assets/subs.vtt';` |

- [ ] 1.1–1.4 (**all four** script sources) insert the **TS named** shape `import { $1 } from '<path>';` — note `.js`/`.jsx` (1.3/1.4) produce `import { $1 }`, **NOT** the JS default `import $1`. All four route to the TypeScript builder
- [ ] 1.5 (`.vue` source) inserts the **named asset** shape `import ${1:name} from '../assets/BaseButton.vue';` — a `.vue` source is **not** in `SCRIPT_SOURCE_EXTENSIONS`, so it falls through to `buildAssetImportStatement`'s image/doc/component group (the §10.3 quirk)
- [ ] 1.6–1.9 (data / image) insert `import ${1:name} from '<full-path>';` with the **full source extension** kept
- [ ] 1.10–1.12 (video / audio / text-track) insert `import ${1:url} from '<full-path>';`

Now the **reject** rows. Copy each source and paste into `vue/src/App.vue` — expect the warning toast and **no insertion**:

| # | Source | Reject category | Expected toast |
|---|--------|-----------------|----------------|
| 1.13 | `vue/assets/page.mdx` | script-category, but **not** accepted | `Auto Import: Cannot import .mdx into .vue files.` |
| 1.14 | `vue/assets/Widget.svelte` | other framework | `Auto Import: Cannot import .svelte into .vue files.` |
| 1.15 | `vue/assets/Layout.astro` | other framework | `Auto Import: Cannot import .astro into .vue files.` |
| 1.16 | `vue/assets/global.css` | stylesheet | `Auto Import: Cannot import .css into .vue files.` |
| 1.17 | `vue/assets/theme.scss` | stylesheet | `Auto Import: Cannot import .scss into .vue files.` |
| 1.18 | `vue/assets/page.html` | html | `Auto Import: Cannot import .html into .vue files.` |
| 1.19 | `vue/assets/notes.md` | markdown | `Auto Import: Cannot import .md into .vue files.` |
| 1.20 | `vue/assets/font.woff2` | font | `Auto Import: Cannot import .woff2 into .vue files.` |
| 1.21 | `vue/assets/manual.pdf` | document | `Auto Import: Cannot import .pdf into .vue files.` |

- [ ] 1.13–1.21 each show `Auto Import: Cannot import .{src} into .vue files.` and insert **nothing**
- [ ] **`.mdx` is the instructive reject** (1.13): `.vue` accepts `.ts`/`.tsx`/`.js`/`.jsx` but **not** `.mdx` — a script-*category* extension that is still rejected
- [ ] The toast **wording** is owned by [general.md](general.md) (the `not-supported` notification) — these rows assert only the `.vue` interpolation, not the message format

> The universal **same-file** rejection (`.vue` → the same `.vue`) is owned by [general.md §3](general.md#3--same-file-rejection) — cross-referenced, never re-tested here.

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

One case per branch of `framework-component.ts` — a script source (TS arm), a non-script **named-default** asset, and a non-script **url-default** asset. All paste into `vue/src/App.vue` (imports land at Bottom of its `<script setup>` block; see §6).

### 2.1 — Script source (TS arm)

- [ ] Copy `vue/src/model.ts` (`Cmd+Shift+A`), open `vue/src/App.vue`, press `Cmd+I`
- [ ] Import inserted: `import { $1 } from './model';` (the TS **named** shape — the `typescriptImportStyle` default)
- [ ] Cursor lands on the `$1` tab stop inside the curly braces
- [ ] Import is at column 0 inside the `<script setup>` block; trailing newline appended after the import line

### 2.2 — Non-script asset, named-default (image)

- [ ] Copy `vue/assets/logo.png`, paste into `vue/src/App.vue`
- [ ] Import inserted: `import ${1:name} from '../assets/logo.png';` (default-import with a `name` placeholder; **full `.png` extension kept**)
- [ ] Cursor lands on the `${1:name}` placeholder (text `name` pre-selected)

### 2.3 — Non-script asset, url-default (video)

- [ ] Copy `vue/assets/clip.mp4`, paste into `vue/src/App.vue`
- [ ] Import inserted: `import ${1:url} from '../assets/clip.mp4';` (default-import with a `url` placeholder; **full `.mp4` extension kept**)
- [ ] Cursor lands on the `${1:url}` placeholder (text `url` pre-selected)

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `vue/src/model.ts` in the Explorer with `vue/src/App.vue` open in the editor
- [ ] Press `Alt+D`
- [ ] Import is inserted into `vue/src/App.vue` — same result as Copy + Paste: `import { $1 } from './model';`

---

## 4 — Style model (one script arm + asset arm)

`.vue` has **two arms**, but — unlike `.tsx`/`.mdx` — **only one script table**:

- **Arm 1** — **every** script source (`.ts`/`.tsx`/`.js`/`.jsx`) picks from the **7 TypeScript styles** (`typescriptImportStyle`). There is no JavaScript table for `.vue`.
- **Arm 2** — a non-script asset source gets **one fixed shape** (no style dropdown applies). Only **two** of the four asset shapes are reachable (named-default and url-default); the CSS-module and side-effect shapes are gated out.

There is **no empty-snippet case** — every gated-in source renders something.

### 4A — Script source: all 7 TypeScript import styles

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **TypeScript / TSX import style** dropdown. Then copy `vue/src/Widget.tsx` and paste into `vue/src/App.vue`. Undo (`Cmd+Z`) after each test.

`vue/src/Widget.tsx` is a plain `.tsx` source with NO Angular suffix (tests the bare tab-stop behavior; `.vue` never reads exported classes, so it is bare `$1` regardless of file content — see §5).

> These 7 shapes are the **same** `TYPESCRIPT_IMPORT_OPTIONS` table the `.ts`/`.tsx`/`.mdx` destinations use — `.vue` reuses the `typescriptImportStyle` setting for **all four** script sources.

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
- [ ] **No tab stop** (side-effect import), cursor lands after the semicolon

#### Style 4 — `import type { name } from '_relativePath_';`

- [ ] Output: `import type { $1 } from './Widget';`
- [ ] Cursor lands on `$1` inside the curly braces

#### Style 5 — `import { name, type Type } from '_relativePath_';`

- [ ] Output: `import { $1, type $2 } from './Widget';`
- [ ] Cursor lands on `$1` (value binding); Tab advances to `$2` (type binding); **two** distinct tab stops

#### Style 6 — `const name = await import('_relativePath_');`

- [ ] Output: `const $1 = await import('./Widget');`
- [ ] Cursor lands on `$1` (the dynamic-import binding)

> **`.js`/`.jsx` sources use this same table.** Repeat any style above with `vue/src/helper.js` instead of `vue/src/Widget.tsx` — the output shape is identical (e.g. style 0 → `import { $1 } from './helper';`), because `.js`/`.jsx` route to the **TypeScript** builder here. (Contrast `.tsx`/`.mdx`, where `helper.js` would use the JavaScript table.)

### 4B — Non-script source: the 2 reachable asset shapes

Each non-script asset source maps to exactly **one** fixed shape (no style dropdown applies). For `.vue` only **two** of the four asset shapes are reachable — stylesheets and fonts are gate-rejected (§1), so the CSS-module `${1:styles}` shape and the side-effect shape can never appear. Copy the listed source, paste into `vue/src/App.vue`, undo after each.

| Shape | Source fixture | Output | Tab stop |
|-------|----------------|--------|----------|
| image / data / doc / component (incl. `.vue`) | `vue/assets/logo.png` | `import ${1:name} from '../assets/logo.png';` | `${1:name}` |
| av / text-track | `vue/assets/clip.mp4` | `import ${1:url} from '../assets/clip.mp4';` | `${1:url}` |

- [ ] image / data / doc / component → `import ${1:name} from '<full-path>';` (placeholder `name`)
- [ ] av / text-track → `import ${1:url} from '<full-path>';` (placeholder `url`)
- [ ] **No `${1:styles}` (CSS-module) shape** appears — `.css`/`.scss` sources are gate-rejected, never reaching `buildAssetImportStatement`
- [ ] **No side-effect `import '<path>';`** shape appears — fonts and plain stylesheets are gate-rejected
- [ ] **No empty-snippet case** — every gated-in source renders a non-empty import (the contrast to `.jsx`, where a `.ts`/`.tsx` source builds nothing)

#### 4B.1 — Non-script assets keep the full extension even with preserve OFF

`preserveScriptFileExtension` is a **script-namespace** setting; `framework-component.ts` builds the asset path from the raw source extension (`relativePath + sourceFileExt`), which always carries it — independent of the toggle used by the script arm.

- [ ] Confirm **Preserve script file extension in imports** is unchecked (`false`, the default)
- [ ] Copy `vue/assets/logo.png`, paste → `import ${1:name} from '../assets/logo.png';` (the `.png` extension is **still present** — the toggle does not strip asset extensions)

### 4C — Style-name drift (config-drift safety net)

A hand-typed / drifted `typescriptImportStyle` value (matching no enum description) must still insert the **style-0 shape**, never nothing (`resolveStyleIndex` → `undefined` → builder `default:` arm).

- [ ] In `settings.json`, set `auto-import.importStatement.script.typescriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `vue/src/Widget.tsx`, paste into `vue/src/App.vue` → `import { $1 } from './Widget';` (style-0 named shape — **NOT** empty)
- [ ] The tab stop is a **bare `$1`**. The `default:` arm runs **no** Angular naming (Angular lives only in `case 0`) and `.vue` passes **no** `detectedImportName`, so even an Angular-suffixed source drifts to a bare tab stop: copy `vue/src/angular/user.component.ts`, paste → `import { $1 } from './angular/user.component';` (**NOT** `import { UserComponent }`)
- [ ] Restore: set **TypeScript / TSX import style** back to `import { name } from '_relativePath_';`

> This is the same drift behavior as [mdx.md §4D.1](mdx.md#4d--style-name-drift-config-drift-safety-net) — the shared `typescript.ts` `default:` arm has no Angular branch. The PascalCase pre-fill in §5 is a **`case 0`-only** effect and does not survive style-name drift.

---

## 5 — Smart identifier behavior (Angular-PascalCase only, style 0)

`.vue` routes **all four** script sources through the TypeScript builder, whose style-0 calls `generateAngularLegacyImportName`. But `.vue` invokes it **without** a `detectedImportName` (`framework-component.ts` calls `buildTypeScriptImportSnippet` one-arg; `variants.ts:buildFrameworkComponentVariants` passes no third arg), so `readExportedClassName` is **never called** → there is **no exported-class fill**. The result is **Angular-PascalCase only**. Styles 1–6 always emit a bare `$1`.

> This distinguishes `.vue` smart-ID from `.ts`: `.ts` runs **both** exported-class detection and Angular naming ([typescript.md §5](typescript.md#5--smart-identifier-behavior-style-0-only)); `.vue` runs **Angular only**. It also differs from `.tsx`/`.mdx`: there, Angular fires only for `.ts`/`.tsx` sources, but for `.vue` it fires for **all four** script extensions (§5.8). Emit **no** exported-class detection case — that is `.ts`-destination-only.

Style must be set to index 0 (`import { name } from '_relativePath_';`).

### 5.1 — `.component` suffix

- [ ] Copy `vue/src/angular/user.component.ts` (no `export class`) → paste into `vue/src/App.vue`
- [ ] Output: `import { UserComponent } from './angular/user.component';` (PascalCase identifier filled directly — a committed identifier, **not** an editable `${1:…}` tab stop)

### 5.2 — `.directive` suffix

- [ ] Copy `vue/src/angular/highlight.directive.ts` → paste into `vue/src/App.vue`
- [ ] Output: `import { HighlightDirective } from './angular/highlight.directive';`

### 5.3 — `.pipe` suffix

- [ ] Copy `vue/src/angular/trim.pipe.ts` → paste into `vue/src/App.vue`
- [ ] Output: `import { TrimPipe } from './angular/trim.pipe';`

### 5.4 — `.service` suffix

- [ ] Copy `vue/src/angular/user.service.ts` → paste into `vue/src/App.vue`
- [ ] Output: `import { UserService } from './angular/user.service';`

### 5.5 — `.module` suffix

- [ ] Copy `vue/src/angular/auth.module.ts` → paste into `vue/src/App.vue`
- [ ] Output: `import { AuthModule } from './angular/auth.module';`

### 5.6 — Non-Angular source (no suffix match)

- [ ] Copy `vue/src/Widget.tsx` (no Angular suffix) → paste into `vue/src/App.vue`
- [ ] Output: `import { $1 } from './Widget';` (bare tab stop, NOT `Widget`)

### 5.7 — Exported class is NOT filled (the counter-case to `.ts` §5)

This is the signature `.vue` ≠ `.ts` case. A `.ts` source containing `export class …` is read for its class name by the `.ts` destination, but **never** by `.vue`.

- [ ] Copy `vue/src/classes/event-bus.ts` (contains `export class EventBus { }`, no Angular suffix) → paste into `vue/src/App.vue`
- [ ] Output: `import { $1 } from './classes/event-bus';` — a **bare** tab stop, NOT `${1:EventBus}` (the `.vue` builder never calls `readExportedClassName`). Contrast [typescript.md §5](typescript.md#5--smart-identifier-behavior-style-0-only), where the same source yields `import { ${1:EventBus} } from …`

### 5.8 — Angular naming fires for a `.js` source (the `.vue` ≠ `.tsx` distinction)

- [ ] Copy `vue/src/angular/widget.component.js` (an Angular-suffixed **`.js`** source) → paste into `vue/src/App.vue`
- [ ] Output: `import { WidgetComponent } from './angular/widget.component';` — PascalCase filled, because **all four** script extensions route to the TS builder here. Contrast `.tsx`/`.mdx`, where a `.js` source takes the JS fallback and gets a bare `import $1` (no Angular naming)

### 5.9 — Preserve-extension identifier stability

- [ ] With **Preserve script file extension in imports** unchecked (default): copy `vue/src/angular/user.component.ts`, paste → `import { UserComponent } from './angular/user.component';`
- [ ] Check the **Preserve script file extension in imports** checkbox, copy `vue/src/angular/user.component.ts`, paste → `import { UserComponent } from './angular/user.component.ts';`
- [ ] The identifier is **identical** (`UserComponent`) in both cases — never `UserComponentTs` — because the extension is stripped before the name is derived; only the path string changes
- [ ] Restore: uncheck **Preserve script file extension in imports**

### 5.10 — Angular suffix, illegal derived identifier (guard)

- [ ] Copy `vue/src/angular/2fa.service.ts` (no `export class`) → paste into `vue/src/App.vue`
- [ ] Output: `import { $1 } from './angular/2fa.service';` — `2fa.service` derives `2faService`, not a legal identifier (leading digit), so the name falls back to a bare `$1` tab stop, NOT `2faService` (`typescript.ts:75` guard), **even though a suffix matched**

---

## 6 — Placement modes (SFC `<script>`-block confined)

`.vue` uses the **`sfc-script`** placement mode: every import is constrained **inside the SFC `<script>` block** (`computeSfcPlacement` / `insertSnippetAtSfcScript`). The generic Top/Bottom/Cursor section that `.ts`/`.tsx`/`.mdx` use is **NOT** emitted — placement here always resolves to a position **within the chosen `<script>` block**, and the column is always **0** (`.vue ∈ SCRIPT_FILE_EXTENSIONS`).

**Block selection preference** (`findSfcScriptBounds`): `<script setup>` **>** an instance `<script>` (one without `context=`) **>** any `<script>`. If **no** `<script>` block exists, a new `<script>\n…\n</script>\n` wrapper is created at line 0 and all three placement modes converge there.

### 6.1 — Block selection preference (`<script setup>` wins)

- [ ] Open `vue/destinations/setup-and-instance.vue`:
  ```vue
  <script setup>
  import { Header } from '../src/Header';
  </script>

  <script>
  export default { name: 'App' };
  </script>

  <template>
    <div></div>
  </template>
  ```
- [ ] With `importStatementPlacement = "Bottom"`, copy `vue/src/Widget.tsx`, paste → import inserted at line 2 (inside the **`<script setup>`** block, after `import { Header }`), NOT in the instance `<script>` block
- [ ] Undo (`Cmd+Z`) to restore the file

> The instance-`<script>` tier excludes blocks whose opening tag contains `context=` (the shared-builder rule for Svelte's `<script context="module">`); a plain Vue instance `<script>` is selected when no `<script setup>` exists (§6.2.3).

### 6.2 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 6.2.1 — Block with existing imports

- [ ] Open `vue/destinations/with-imports.vue`:
  ```vue
  <script setup>
  import { Header } from '../src/Header';
  import { Footer } from '../src/Footer';
  </script>

  <template>
    <div></div>
  </template>
  ```
- [ ] Copy `vue/src/Widget.tsx`, paste → import inserted on line 3 (after `import { Footer }`, before `</script>`): `import { $1 } from '../src/Widget';`
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.2 — Empty block (no imports yet)

- [ ] Open `vue/destinations/instance-only.vue`:
  ```vue
  <script>
  export default { name: 'App' };
  </script>

  <template>
    <div></div>
  </template>
  ```
- [ ] Copy `vue/src/Widget.tsx`, paste → import inserted on line 1 (just after the opening `<script>` tag — Bottom falls back to "just after the opening tag" when the block has no `IMPORT_INDICATORS` line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.3 — Instance `<script>` selected when no `<script setup>`

- [ ] Using `vue/destinations/instance-only.vue` (above), confirm the import lands inside the **instance `<script>`** block (it is the only one present; `findSfcScriptBounds` selects it)

#### 6.2.4 — `require()` marker inside the block

- [ ] Open `vue/destinations/with-require.vue`:
  ```vue
  <script>
  const fs = require('fs');
  </script>

  <template>
    <div></div>
  </template>
  ```
- [ ] Copy `vue/src/Widget.tsx`, paste → import inserted on line 2 (after the `require(` line — `require(` is one of the `IMPORT_INDICATORS` markers, scanned **within the block** by `findBottomLineInRange`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.5 — Column is always 0

- [ ] Regardless of cursor position, the import is inserted at column 0 (leftmost) within the block

### 6.3 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings, set **Import statement placement** to `Top`

#### 6.3.1 — Block with existing imports

- [ ] Open `vue/destinations/with-imports.vue` (same content as §6.2.1)
- [ ] Copy `vue/src/Widget.tsx`, paste → import inserted on line 1 (just after the opening `<script setup>` tag, **before** `import { Header }`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.2 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 6.4 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import statement placement** to `Cursor`

#### 6.4.1 — Cursor strictly inside the block

- [ ] Open `vue/destinations/with-imports.vue`, place cursor on line 2 (the `import { Footer }` line)
- [ ] Copy `vue/src/Widget.tsx`, paste → import inserted **at** line 2 (the cursor line is strictly between the `<script setup>` bounds, so it is honored)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.4.2 — Cursor outside the block → falls to Bottom-in-block

- [ ] Open `vue/destinations/with-imports.vue`, place cursor on line 6 (`<div></div>`, in the `<template>`)
- [ ] Copy `vue/src/Widget.tsx`, paste → import inserted on line 3 (after `import { Footer }` — when the cursor is **not** strictly between the block bounds, Cursor falls back to Bottom-within-block)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.4.3 — Cursor on a comment line inside the block (adjusted above)

- [ ] Open `vue/destinations/comment-cursor.vue`:
  ```vue
  <script setup>
  import { Header } from '../src/Header';

  /*
   * Some documentation
   */
  </script>

  <template>
    <div></div>
  </template>
  ```
- [ ] Place cursor on line 3 (the `/*` opener), copy `vue/src/Widget.tsx`, paste → import is adjusted **above** the comment block (line 3 → inserted at the `/*` line position, pushing the block down) — `adjustForCommentBlock` applies inside the `<script>` block
- [ ] Undo (`Cmd+Z`) to restore the file

### 6.5 — Create-if-missing wrapper (no `<script>` block)

- [ ] Open `vue/destinations/template-only.vue`:
  ```vue
  <template>
    <div></div>
  </template>
  ```
- [ ] Copy `vue/src/Widget.tsx`, paste → a new `<script>` block is created at line 0 wrapping the import:
  ```vue
  <script>
  import { $1 } from '../src/Widget';
  </script>
  <template>
    <div></div>
  </template>
  ```
- [ ] Repeat with **Top** and **Cursor** placement — **all three modes converge** on the same created wrapper at line 0 (the create-if-missing branch returns before the placement switch)
- [ ] Undo (`Cmd+Z`) after each to restore the file

### 6.6 — Detected indentation

- [ ] Open `vue/destinations/indented-imports.vue`:
  ```vue
  <script setup>
    import { Header } from '../src/Header';
  </script>

  <template>
    <div></div>
  </template>
  ```
- [ ] Copy `vue/src/Widget.tsx`, paste → the inserted import adopts the **block's detected indentation** (two spaces, taken from the last import line by `findBottomLineInRange`): `  import { $1 } from '../src/Widget';`
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 7 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change, single-variant fast path) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 7.1 — Script source: QuickPick shows all 7 TS styles

- [ ] Copy `vue/src/Widget.tsx`, run Paste as Import (Pick Style) in `vue/src/App.vue`
- [ ] QuickPick appears with placeholder text: `Select an import style`
- [ ] 7 items listed, one per TypeScript import style (the **same** list for `.ts`/`.tsx`/`.js`/`.jsx` sources)
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

### 7.2 — Label = basename, inserted = full path

- [ ] Copy `vue/src/components/Widget.tsx` (a nested `.tsx` source), run the command in `vue/src/App.vue`
- [ ] Select `import * as name from '_relativePath_';` from the picker — its label previews the **basename**: `import * as name from 'Widget';`
- [ ] Verify the INSERTED text uses the **full relative path**: `import * as $1 from './components/Widget';`

### 7.3 — Style-0 label is Angular-prefilled for a suffixed path

- [ ] Copy `vue/src/angular/user.component.ts`, run the command in `vue/src/App.vue`
- [ ] The style-0 item's **label** is `import { UserComponent } from 'user.component';` (basename preview, Angular PascalCase filled — `generateAngularLegacyImportName` runs on the label path too)
- [ ] Selecting it inserts `import { UserComponent } from './angular/user.component';` (full path)
- [ ] Styles 1–6 show a bare `name` placeholder in their labels (Angular fills only style 0)

### 7.4 — Asset source: single fixed variant (direct insert)

A non-script asset has exactly **one** variant (the fixed shape), so the single-variant fast path applies — the picker is not shown and the import is inserted directly ([general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics)).

- [ ] Copy `vue/assets/logo.png`, run Paste as Import (Pick Style) in `vue/src/App.vue`
- [ ] No style list appears (one variant only) → `import ${1:name} from '../assets/logo.png';` is inserted directly
- [ ] (Were the picker shown, the single item's label would be the basename preview `import name from 'logo.png';` with an empty description — hardcoded variants carry no tag)

> **No 0-variant case.** **Every** `.vue` source produces at least one variant — script → 7 TS, non-script → 1 fixed. There is no empty picker (the contrast to `jsx.md`, where a `.ts`/`.tsx` source produces zero variants).

---

## 8 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark on current default, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

### 8.1 — Script source: selecting a TS style persists to `typescriptImportStyle`

- [ ] Copy `vue/src/Widget.tsx`, run Set Default Import Style in `vue/src/App.vue`
- [ ] Select `import type { name } from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import type { name } from '_relativePath_';`
- [ ] Check VS Code Settings → **TypeScript / TSX import style** (`typescriptImportStyle`) is now `import type { name } from '_relativePath_';`
- [ ] Reset: run the command again on `vue/src/Widget.tsx`, select `import { name } from '_relativePath_';` to restore the default

### 8.2 — Shared-setting cross-effect (no `vueImportStyle`)

`.vue` has **no** `vueImportStyle` key — §8.1 wrote `typescriptImportStyle`, the **same** key that governs other destinations.

- [ ] In VS Code Settings, confirm there is **no** `vueImportStyle` setting — the value from §8.1 lives under **TypeScript / TSX import style** (`auto-import.importStatement.script.typescriptImportStyle`)
- [ ] `typescriptImportStyle` also governs `.ts` destinations, `.ts`/`.tsx` sources into `.tsx`/`.mdx`, and **all** script sources into `.vue`/`.svelte`/`.astro`. Setting this default from a `.vue` paste therefore changes that style **everywhere the key is read** — including `.ts`/`.tsx`/`.mdx` destinations. (The setting's `package.json` description names `.vue`/`.svelte`/`.astro` explicitly.)
- [ ] Confirm the setting was restored to its default in §8.1

### 8.3 — Asset source: no configurable style

A non-script asset's single variant carries no backing setting, so there is nothing to persist.

- [ ] Copy `vue/assets/logo.png`, run Set Default Import Style in `vue/src/App.vue`
- [ ] Warning toast: `Auto Import: .png → .vue imports use a fixed style.` (the `no-configurable-style` reject) — no picker, no setting written

---

## 9 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.vue` editor. A drop reuses the same `buildImportSnippet` + `computeImportPlacement` pipeline as paste, so the inserted string is **byte-identical** to the §2 happy path. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 9.1 — Happy path, script source

- [ ] Drag `vue/src/model.ts` from Explorer into `vue/src/App.vue` editor
- [ ] Import inserted using the default TypeScript style — `import { $1 } from './model';` (byte-identical to the §2.1 paste result)
- [ ] Placement follows the `importStatementPlacement` setting, constrained to the `<script>` block (same as paste)

### 9.2 — Happy path, asset source

- [ ] Drag `vue/assets/logo.png` into `vue/src/App.vue` → `import ${1:name} from '../assets/logo.png';` (the named-default asset shape, byte-identical to §2.2)
- [ ] Drag `vue/assets/clip.mp4` into `vue/src/App.vue` → `import ${1:url} from '../assets/clip.mp4';` (the url-default asset shape — av / text-track — byte-identical to §2.3; cursor lands on the `${1:url}` placeholder. `theme.mp3` / `subs.vtt` are interchangeable)

### 9.3 — Unsupported-pair drop → raw-text fallback

Because `.vue` is **allow-list**, a gated-out source has no snippet to offer. The drop edit resolves to `null`, so VS Code falls back to its **default text-drop** and the **raw path text** lands — distinct from paste, which inserts nothing at all. (This case does **not** exist for accept-all `.tsx`, where every source builds a snippet.)

- [ ] Drag `vue/assets/global.css` (a `.css` — gated out) into `vue/src/App.vue`
- [ ] Warning toast: `Auto Import: Cannot import .css into .vue files.` **AND** no import is inserted — instead the **raw file path text** is dropped (VS Code's default text-drop)
- [ ] Repeat with `vue/assets/Widget.svelte` and `vue/assets/page.mdx` → same `not-supported` toast + raw-text fallback
- [ ] Undo (`Cmd+Z`) to remove the dropped raw text

### 9.4 — Placement with Bottom mode

- [ ] In the extension settings, set **Import statement placement** to `Bottom` (the default)
- [ ] Open `vue/destinations/with-imports.vue` (has existing imports in its `<script setup>` block)
- [ ] Drag `vue/src/Widget.tsx` → import lands after the last existing import line, inside the block: `import { $1 } from '../src/Widget';`
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.5 — Placement with Top mode

- [ ] Set **Import statement placement** to `Top`
- [ ] Drag `vue/src/Widget.tsx` into `vue/destinations/with-imports.vue` → import lands on line 1 (just after the opening `<script setup>` tag)
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.6 — Placement with Cursor mode (comment adjustment)

- [ ] Set **Import statement placement** to `Cursor`
- [ ] Open `vue/destinations/comment-cursor.vue` (content as in §6.4.3), drag `vue/src/Widget.tsx` and drop onto line 3 (the `/*` opener)
- [ ] Import is adjusted **above** the comment block (same as paste Cursor §6.4.3 — `computeImportPlacement` applies `adjustForCommentBlock` within the block on drop too)
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.7 — Column is always 0

- [ ] Even if the drop position is mid-line, the import inserts at column 0 within the block

### 9.8 — Angular naming applies on drop

- [ ] Drag `vue/src/angular/user.component.ts` (no `export class`) into `vue/src/App.vue`
- [ ] Import is `import { UserComponent } from './angular/user.component';` (Angular PascalCase, same as paste §5.1)

### 9.9 — `preserveScriptFileExtension` respected on drop

- [ ] In the extension settings, check the **Preserve script file extension in imports** checkbox
- [ ] Drag `vue/src/Widget.tsx` into `vue/src/App.vue` → path is `'./Widget.tsx'`
- [ ] Drag `vue/assets/logo.png` → path is still `'../assets/logo.png'` (asset extensions are kept regardless — the toggle is script-namespace)
- [ ] Uncheck **Preserve script file extension in imports** to restore the default

### 9.10 — Wrapper created on drop into a script-less `.vue`

- [ ] Open `vue/destinations/template-only.vue` (no `<script>` block; content as in §6.5)
- [ ] Drag `vue/src/Widget.tsx` → a new `<script>` wrapper is created at line 0 with the import inside — byte-identical to the paste-side §6.5 block:
  ```vue
  <script>
  import { $1 } from '../src/Widget';
  </script>
  ```
- [ ] Undo, then drag `vue/assets/logo.png` → the wrapper is created with the **single-variant asset** shape inside: `import ${1:name} from '../assets/logo.png';`
- [ ] Undo (`Cmd+Z`) to restore the file

> **Universal drop precondition** (untitled / unsaved buffer is a no-op): cross-cutting across all 12 destinations and verified once in [typescript.md §9.10](typescript.md#910--universal-drop-precondition-cross-cutting--verified-once-here) — **not** re-tested here.

---

## 10 — Edge cases

### 10.1 — `require()` / `import`-in-string false positives are scoped to the `<script>` block

Bottom placement scans for `IMPORT_INDICATORS` markers, but for `.vue` the scan (`findBottomLineInRange`) is **bounded by the `<script>` block** — a marker outside the block does not move the insertion point.

- [ ] Set **Import statement placement** to `Bottom`
- [ ] Open `vue/destinations/with-require.vue` (content as in §6.2.4) → paste `vue/src/Widget.tsx` lands after the `const fs = require('fs');` line (the `require(` marker counts, inside the block)

### 10.2 — `import` substring inside a string literal (Bottom mode, in-block)

- [ ] Open `vue/destinations/string-literal.vue`:
  ```vue
  <script setup>
  const msg = "you should import this";
  </script>

  <template>
    <div></div>
  </template>
  ```
- [ ] Bottom mode: the substring `import ` inside the string literal IS detected as an import marker (known heuristic limitation — not a bug); the import lands after that line, **within the `<script setup>` block**
- [ ] Undo (`Cmd+Z`) to restore the file

### 10.3 — `.vue` → `.vue` self-import is a NAMED ASSET import

A `.vue` source dropped into a `.vue` destination is **asset-routed**, not script-routed — even though `determineImportType('.vue')` classifies `.vue` as `'script'`. The framework builder **ignores** `determineImportType` and keys only on its local `SCRIPT_SOURCE_EXTENSIONS` (which does **not** include `.vue`), so a `.vue` source falls through to `buildAssetImportStatement`.

- [ ] Copy `vue/assets/BaseButton.vue`, paste into `vue/src/App.vue`
- [ ] Output: `import ${1:name} from '../assets/BaseButton.vue';` — the **named-default asset** shape (full `.vue` extension kept), NOT a script `import { $1 }`
- [ ] This proves the source is asset-routed: a `.vue` source is the only "script-category" extension (per `determineImportType`) that a `.vue` destination treats as an asset

---

## 11 — Sign-off

- [ ] Cross-import gating — allow-list matrix: 12 accept rows (script ×4 → TS named, `.vue`-self + data ×3 + image → named-asset, video/audio/text-track → url-asset) + 9 reject rows (`.mdx`/`.svelte`/`.astro`/`.css`/`.scss`/`.html`/`.md`/`.woff2`/`.pdf` → `not-supported`); same-file owned by general.md (21 cases)
- [ ] Paste as Import — happy path (3 cases: script / named-asset / url-asset)
- [ ] Insert Import from Selected File (1 case)
- [ ] Style model — arm 1: all 7 TypeScript styles (one table for all four script exts) + `.js`-uses-TS-table note (7 cases)
- [ ] Style model — arm 2: 2 reachable asset shapes (named-default + url-default) + asset-keeps-extension + no-module-css/side-effect/empty-snippet assertions (3 cases)
- [ ] Style-name drift safety net — `typescriptImportStyle` → style-0 shape; Angular path also drifts to bare `$1` (1 case)
- [ ] Smart identifier — Angular PascalCase (5 suffixes) + non-Angular + no-exported-class-fill counter-case + `.js`-Angular-fires + preserve-stable + invalid-identifier guard (10 cases)
- [ ] Placement — SFC `<script>`-block confined: block-selection preference + Bottom (5) + Top (2) + Cursor (3) + create-if-missing + detected indentation (≈13 cases; **no** generic Top/Bottom/Cursor section)
- [ ] Paste as Import (Pick Style) — 7 TS items / label-vs-inserted / style-0 Angular label / asset direct-insert (4 cases; no 0-variant case)
- [ ] Set Default Import Style — TS persist / no-`vueImportStyle` shared-setting cross-effect / asset `no-configurable-style` (3 cases)
- [ ] Drag-and-drop — happy script / happy asset (named + url) / **unsupported-pair raw-text fallback** / placement (Bottom/Top/Cursor in-block) / column 0 / Angular-on-drop / preserve / **wrapper-create-on-drop** + asset-in-wrapper (11 cases)
- [ ] Edge cases — in-block `require(` + string-literal false positives / `.vue`→`.vue` named-asset-import quirk (3 cases)

**Total: ~80 test cases**
