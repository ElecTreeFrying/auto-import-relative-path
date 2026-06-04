# Astro (`.astro` destination) — QA Checklist

Astro-specific manual QA: **allow-list** gating (the **widest** framework accept-list), the **two-arm** style model (7 TypeScript styles for **all four** script sources `.ts`/`.tsx`/`.js`/`.jsx`, or a fixed asset shape for non-script sources), Angular-only smart identifiers, **frontmatter (`---` fence)** placement, style pickers, and drag-and-drop. `.astro` is the **third and final framework-trio destination** — `.vue`, `.svelte`, and `.astro` all share one builder, `src/snippets/languages/framework-component.ts`.

Every `.astro` behavior flows from a single routing fact in that builder: it branches on its **own local** `SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]` and routes **all four** to `buildTypeScriptImportSnippet` (the TypeScript builder, called **one-arg** — no `detectedImportName`); **everything else** gated-in goes to `buildAssetImportStatement`. It **never** calls `determineImportType`. Two consequences cascade from that one `if`:

1. A `.js`/`.jsx` source renders a **TypeScript** `import { $1 }` shape — **not** a JS default import. This is the headline divergence from `.tsx`/`.mdx` (where `.js`/`.jsx` sources fall through to the JS builder). There is **one** script style table for `.astro`, not two.
2. Because the builder is called without a `detectedImportName`, `readExportedClassName` is **never** invoked → there is **no exported-class pre-fill**. Smart identifiers are **Angular-PascalCase only** — but they fire for **all four** script extensions (so even a `.js` Angular file pre-fills, unlike `.tsx`/`.mdx`).

> **`.astro` accepts the WIDEST source set of any framework destination.** Unlike `.vue`/`.svelte`, `ASTRO_SUPPORTED_EXTENSIONS` additionally accepts the other framework components **`.vue` and `.svelte`**, plus **`.md` and `.mdx`** (and its own `.astro`). Those four are *rejected* by `.vue`/`.svelte` but are **accept** rows here — each routes to the **named-asset** arm. The reject set therefore shrinks to just **five**: `.css` `.scss` (stylesheets), `.html`, fonts, and `.pdf`. There are **no** image/media/`.vtt`/data reject rows (all accepted).

> **`.astro` has NO dedicated `astroImportStyle` setting.** The script arm reuses **`typescriptImportStyle`** (the **same** setting `.ts`/`.tsx`/`.mdx`/`.vue`/`.svelte` use). `package.json`'s *"TypeScript / TSX import style"* description names it explicitly: *"…and for all script sources imported into .vue, .svelte, or .astro files."* Changing that default while QA-ing `.astro` also moves `.ts`/`.tsx`/`.mdx`/`.vue`/`.svelte` — see §8.

> **Routing paradox to watch for.** `.vue`, `.svelte`, `.md`, `.mdx`, and self-`.astro` are **accepted** but are **not** in `SCRIPT_SOURCE_EXTENSIONS`, so they route to the **non-script named-default** arm. A `.mdx` source — a *script* extension everywhere else in the extension — becomes `import ${1:name} from './post.mdx';`, the sharpest proof the framework builder ignores `determineImportType`. See §10.3.

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notification wording + toast buttons, path computation, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/dispatch.ts` — `buildImportSnippet`: the `case '.vue': case '.svelte': case '.astro':` arm routes all three to `frameworkComponent.buildSnippet`
- `src/snippets/languages/framework-component.ts` — `buildSnippet` (the `.astro` builder): local `SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]`; script sources → `buildTypeScriptImportSnippet(relativePath + ext)` **one-arg**; everything else → `buildAssetImportStatement(sourceExt, relativePath + ext)`. Asset path is built from the raw source ext (always full); script path honors `preserveScriptFileExtension`. **Never** calls `determineImportType`
- `src/snippets/languages/typescript.ts` — `buildTypeScriptImportSnippetByStyle` (7-case switch; style-0 calls `generateAngularLegacyImportName`, but **without** a `detectedImportName` for `.astro` → no exported-class fill; the `/^[A-Za-z_$][\w$]*$/` identifier validity guard at `:75`); the `default:` arm emits the style-0 shape and runs **no** Angular naming (Angular lives only in `case 0`)
- `src/snippets/_react.ts` — `buildAssetImportStatement`: the `.module.css`/`.module.scss` check (FIRST, but **unreachable for `.astro`** — stylesheets gated out) + the asset `switch`. For `.astro` only the **named-default** (`import ${1:name}` — image / data / doc / component incl. `.vue`/`.svelte`/`.astro`/`.md`/`.mdx`) and **url-default** (`import ${1:url}` — av / text-track) arms are reachable; the font/stylesheet side-effect arm and `default: null` never fire for a gated-in `.astro` source
- `src/snippets/_styles.ts` — `TYPESCRIPT_IMPORT_OPTIONS` (7) — descriptions + tags + tab-stop layout per style
- `src/snippets/variants.ts` — `buildFrameworkComponentVariants` (shared by the `.vue`/`.svelte`/`.astro` case): `.ts`/`.tsx`/`.js`/`.jsx` → 7 TS styled variants backed by `('script', 'typescript')`; non-script → a single hardcoded variant via `buildReactNonScriptVariant` (no `setting`). Called **without** `detectedImportName`, so style-0 is Angular-only (no exported-class fill)
- `src/gating.ts` — `isPairSupported`: `.astro ∈ CROSS_IMPORT_DESTINATIONS` passes the first clause, then `destinationFileExt === '.astro' && !ASTRO_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` rejects non-members
- `src/constants/extensions.ts` — `ASTRO_SUPPORTED_EXTENSIONS` (the literal accept-list — the widest of the three frameworks); `.astro ∈ SCRIPT_FILE_EXTENSIONS` (column 0)
- `src/commands/paste-import.ts` — Paste as Import (insertion path)
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop import; registered for `scheme:'file'` only). A rejected pair (or empty snippet) → `'not-supported'` toast + return `null` → VS Code falls back to a raw text-drop
- `src/editor/insert-snippet.ts` — `insertSnippetAtAstroFrontmatter` (the `.astro` placement orchestrator; column 0 for script destinations)
- `src/editor/placement.ts` — `computeAstroPlacement` / `findAstroFrontmatterBounds` (plain first-two-`---`-fence scan; create-if-missing wrapper; `findBottomLineInRange`; `detectBlockIndentation`; `adjustForCommentBlock`)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting`; confirms there is **no** `astroImportStyle` — the framework script arm reads/writes `('script', 'typescript')` → `typescriptImportStyle`

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

> **There is no `astroImportStyle`.** A `.astro` destination uses **TypeScript / TSX import style** (`typescriptImportStyle`) for **all four** script sources — `.ts`, `.tsx`, **and** `.js`/`.jsx`. The **JavaScript / JSX import style** setting is **never** consulted for a `.astro` destination (the `.js`/`.jsx` → JS-builder fallback that `.tsx`/`.mdx` use does not exist here).

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `astro/src/` | The `.astro` destination `App.astro` (empty `---` frontmatter) + the four script sources: `model.ts`, `Widget.tsx` (`.ts`/`.tsx` → TS arm), `helper.js`, `Card.jsx` (`.js`/`.jsx` → **also** TS arm); `components/Widget.tsx` (nested source for §7) |
| `astro/src/angular/` | Angular-convention sources WITHOUT `export class`: `user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `auth.module.ts`; `widget.component.js` (Angular suffix on a **`.js`** source — fills here, unlike `.tsx`/`.mdx`); `2fa.service.ts` (illegal-identifier guard) |
| `astro/src/classes/` | `event-bus.ts` — a `.ts` source WITH `export class EventBus` (the no-exported-class-fill counter-case) |
| `astro/assets/` | One fixture per non-script source category: `logo.png`, `data.json`, `config.yaml`, `config.yml`, `clip.mp4`, `theme.mp3`, `subs.vtt`. Plus the **named-asset family** (all accepted, all asset-routed): `Card.astro` (`.astro`→`.astro` self), `Demo.vue`, `Widget.svelte`, `notes.md`, `post.mdx`. Plus **reject fixtures** (gated out): `global.css`, `theme.scss`, `page.html`, `font.woff2`, `manual.pdf` |
| `astro/destinations/` | Pre-filled `.astro` files for placement tests (undo after each): `with-imports.astro`, `empty-frontmatter.astro`, `template-only.astro` (no `---` frontmatter), `with-require.astro`, `string-literal.astro`, `comment-cursor.astro`, `indented-imports.astro` |

`astro/src/App.astro` (the primary paste destination) is:

```astro
---
---

<h1>{title}</h1>
```

> **Asset-fixture content is irrelevant** — the import shape is keyed on the file **extension**, not the bytes, so `astro/assets/*` fixtures can be empty stubs (even `Card.astro`/`Demo.vue`/`Widget.svelte`/`post.mdx` — they are imported as named assets regardless of content). For script fixtures, content matters **only** for the Angular/class cases in §5: the `astro/src/angular/*` files must NOT contain `export class` (they test the Angular-suffix path), and `astro/src/classes/event-bus.ts` must contain `export class EventBus` (the no-fill counter-case). All other script fixtures (`Widget.tsx`, `helper.js`, …) have no detection and can be empty stubs.

---

## 1 — Cross-import gating matrix (allow-list)

`.astro` is an **allow-list** destination: `.astro ∈ CROSS_IMPORT_DESTINATIONS` (so the first `gating.ts` clause short-circuits), then `destinationFileExt === '.astro' && !ASTRO_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` **rejects** every source not in the list. So §1 is an **ACCEPT-vs-REJECT** matrix.

**`ASTRO_SUPPORTED_EXTENSIONS`** (literal accept-list — the **widest** of the three frameworks): `.astro` · `.ts` `.js` `.jsx` `.tsx` · **`.vue` `.svelte`** · `.json` `.yml` `.yaml` · **`.md` `.mdx`** · image (`.gif .jpeg .jpg .png .svg .avif .webp`) · media (`.mp4 .webm .mov .mp3 .ogg .wav .m4a`) · `.vtt`. The reject set is the mechanical complement `SOURCE_UNIVERSE − accept`, which leaves only `.css`/`.scss`/`.html`/fonts/`.pdf`. (`.vue`/`.svelte`/`.astro` are the **only** destinations that accept data — `.json`/`.yml`/`.yaml` are **accept** rows here.)

For each **accept** row: copy the listed source (`Cmd+Shift+A`), paste into `astro/src/App.astro` (`Cmd+I`). This matrix doubles as a coverage map into §2 (happy path) and §4 (all styles / asset shapes).

| # | Source (workspace path) | Category | Expected (default style) |
|---|------------------------|----------|--------------------------|
| 1.1 | `astro/src/model.ts` | script `.ts` → **TS** named | `import { $1 } from './model';` |
| 1.2 | `astro/src/Widget.tsx` | script `.tsx` → **TS** named | `import { $1 } from './Widget';` |
| 1.3 | `astro/src/helper.js` | script `.js` → **TS** named | `import { $1 } from './helper';` |
| 1.4 | `astro/src/Card.jsx` | script `.jsx` → **TS** named | `import { $1 } from './Card';` |
| 1.5 | `astro/assets/Card.astro` | framework (self) → **asset** | `import ${1:name} from '../assets/Card.astro';` |
| 1.6 | `astro/assets/Demo.vue` | framework (cross) → **asset** | `import ${1:name} from '../assets/Demo.vue';` |
| 1.7 | `astro/assets/Widget.svelte` | framework (cross) → **asset** | `import ${1:name} from '../assets/Widget.svelte';` |
| 1.8 | `astro/assets/notes.md` | markdown (doc) → **asset** | `import ${1:name} from '../assets/notes.md';` |
| 1.9 | `astro/assets/post.mdx` | script-category (doc) → **asset** | `import ${1:name} from '../assets/post.mdx';` |
| 1.10 | `astro/assets/data.json` | data | `import ${1:name} from '../assets/data.json';` |
| 1.11 | `astro/assets/config.yaml` | data | `import ${1:name} from '../assets/config.yaml';` |
| 1.12 | `astro/assets/config.yml` | data | `import ${1:name} from '../assets/config.yml';` |
| 1.13 | `astro/assets/logo.png` | image | `import ${1:name} from '../assets/logo.png';` |
| 1.14 | `astro/assets/clip.mp4` | video | `import ${1:url} from '../assets/clip.mp4';` |
| 1.15 | `astro/assets/theme.mp3` | audio | `import ${1:url} from '../assets/theme.mp3';` |
| 1.16 | `astro/assets/subs.vtt` | text-track | `import ${1:url} from '../assets/subs.vtt';` |

- [ ] 1.1–1.4 (**all four** script sources) insert the **TS named** shape `import { $1 } from '<path>';` — note `.js`/`.jsx` (1.3/1.4) produce `import { $1 }`, **NOT** the JS default `import $1`. All four route to the TypeScript builder
- [ ] 1.5–1.9 (**the named-asset family** — self `.astro`, cross-framework `.vue`/`.svelte`, doc `.md`/`.mdx`) insert the **named asset** shape `import ${1:name} from '<full-path>';` — none is in `SCRIPT_SOURCE_EXTENSIONS`, so all fall through to `buildAssetImportStatement`'s image/doc/component group (the §10.3 family). **`.vue`/`.svelte`/`.md`/`.mdx` are ACCEPTED here** — the contrast to `.svelte`/`.vue`, which reject all four
- [ ] 1.10–1.13 (data / image) insert `import ${1:name} from '<full-path>';` with the **full source extension** kept
- [ ] 1.14–1.16 (video / audio / text-track) insert `import ${1:url} from '<full-path>';`

Now the **reject** rows. Copy each source and paste into `astro/src/App.astro` — expect the warning toast and **no insertion**:

| # | Source | Reject category | Expected toast |
|---|--------|-----------------|----------------|
| 1.17 | `astro/assets/global.css` | stylesheet | `Auto Import: Cannot import .css into .astro files.` |
| 1.18 | `astro/assets/theme.scss` | stylesheet | `Auto Import: Cannot import .scss into .astro files.` |
| 1.19 | `astro/assets/page.html` | html | `Auto Import: Cannot import .html into .astro files.` |
| 1.20 | `astro/assets/font.woff2` | font | `Auto Import: Cannot import .woff2 into .astro files.` |
| 1.21 | `astro/assets/manual.pdf` | document | `Auto Import: Cannot import .pdf into .astro files.` |

- [ ] 1.17–1.21 each show `Auto Import: Cannot import .{src} into .astro files.` and insert **nothing**
- [ ] **The reject set is only these five** (stylesheet ×2, html, font, document). There is **no** reject row for image / media / `.vtt` / data / `.vue` / `.svelte` / `.md` / `.mdx` — every one of those is an **accept** row above. This is the explicit contrast to `.svelte`/`.vue`, where `.vue`/`.svelte`/`.md`/`.mdx` are *rejects*
- [ ] The toast **wording** is owned by [general.md](general.md) (the `not-supported` notification) — these rows assert only the `.astro` interpolation, not the message format

> The universal **same-file** rejection (`.astro` → the same `.astro`) is owned by [general.md §3](general.md#3--same-file-rejection) — cross-referenced, never re-tested here. (Note: a **different** `.astro` source IS accepted — see row 1.5 and §10.3.)

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

One case per branch of `framework-component.ts` — a script source (TS arm), a non-script **named-default** asset, and a non-script **url-default** asset. All paste into `astro/src/App.astro` (imports land at Bottom of its `---` frontmatter; see §6).

### 2.1 — Script source (TS arm)

- [ ] Copy `astro/src/model.ts` (`Cmd+Shift+A`), open `astro/src/App.astro`, press `Cmd+I`
- [ ] Import inserted: `import { $1 } from './model';` (the TS **named** shape — the `typescriptImportStyle` default)
- [ ] Cursor lands on the `$1` tab stop inside the curly braces
- [ ] Import is at column 0 inside the `---` frontmatter (on line 1, between the two fences); trailing newline appended after the import line

### 2.2 — Non-script asset, named-default (image)

- [ ] Copy `astro/assets/logo.png`, paste into `astro/src/App.astro`
- [ ] Import inserted: `import ${1:name} from '../assets/logo.png';` (default-import with a `name` placeholder; **full `.png` extension kept**)
- [ ] Cursor lands on the `${1:name}` placeholder (text `name` pre-selected)

### 2.3 — Non-script asset, url-default (video)

- [ ] Copy `astro/assets/clip.mp4`, paste into `astro/src/App.astro`
- [ ] Import inserted: `import ${1:url} from '../assets/clip.mp4';` (default-import with a `url` placeholder; **full `.mp4` extension kept**)
- [ ] Cursor lands on the `${1:url}` placeholder (text `url` pre-selected)

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `astro/src/model.ts` in the Explorer with `astro/src/App.astro` open in the editor
- [ ] Press `Alt+D`
- [ ] Import is inserted into `astro/src/App.astro` — same result as Copy + Paste: `import { $1 } from './model';`

---

## 4 — Style model (one script arm + asset arm)

`.astro` has **two arms**, but — unlike `.tsx`/`.mdx` — **only one script table**:

- **Arm 1** — **every** script source (`.ts`/`.tsx`/`.js`/`.jsx`) picks from the **7 TypeScript styles** (`typescriptImportStyle`). There is no JavaScript table for `.astro`.
- **Arm 2** — a non-script asset source gets **one fixed shape** (no style dropdown applies). Only **two** of the four asset shapes are reachable (named-default and url-default); the CSS-module and side-effect shapes are gated out.

There is **no empty-snippet case** — every gated-in source renders something.

### 4A — Script source: all 7 TypeScript import styles

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **TypeScript / TSX import style** dropdown. Then copy `astro/src/Widget.tsx` and paste into `astro/src/App.astro`. Undo (`Cmd+Z`) after each test.

`astro/src/Widget.tsx` is a plain `.tsx` source with NO Angular suffix (tests the bare tab-stop behavior; `.astro` never reads exported classes, so it is bare `$1` regardless of file content — see §5).

> These 7 shapes are the **same** `TYPESCRIPT_IMPORT_OPTIONS` table the `.ts`/`.tsx`/`.mdx` destinations use — `.astro` reuses the `typescriptImportStyle` setting for **all four** script sources.

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

> **`.js`/`.jsx` sources use this same table.** Repeat any style above with `astro/src/helper.js` instead of `astro/src/Widget.tsx` — the output shape is identical (e.g. style 0 → `import { $1 } from './helper';`), because `.js`/`.jsx` route to the **TypeScript** builder here. (Contrast `.tsx`/`.mdx`, where `helper.js` would use the JavaScript table.)

### 4B — Non-script source: the 2 reachable asset shapes

Each non-script asset source maps to exactly **one** fixed shape (no style dropdown applies). For `.astro` only **two** of the four asset shapes are reachable — stylesheets and fonts are gate-rejected (§1), so the CSS-module `${1:styles}` shape and the side-effect shape can never appear. Copy the listed source, paste into `astro/src/App.astro`, undo after each.

| Shape | Source fixture | Output | Tab stop |
|-------|----------------|--------|----------|
| image / data / doc / component (incl. `.vue`/`.svelte`/`.astro`/`.md`/`.mdx`) | `astro/assets/logo.png` | `import ${1:name} from '../assets/logo.png';` | `${1:name}` |
| av / text-track | `astro/assets/clip.mp4` | `import ${1:url} from '../assets/clip.mp4';` | `${1:url}` |

- [ ] image / data / doc / component → `import ${1:name} from '<full-path>';` (placeholder `name`)
- [ ] av / text-track → `import ${1:url} from '<full-path>';` (placeholder `url`)
- [ ] **No `${1:styles}` (CSS-module) shape** appears — `.css`/`.scss` sources are gate-rejected, never reaching `buildAssetImportStatement`
- [ ] **No side-effect `import '<path>';`** shape appears — fonts and plain stylesheets are gate-rejected
- [ ] **No empty-snippet case** — every gated-in source renders a non-empty import (the contrast to `.jsx`, where a `.ts`/`.tsx` source builds nothing)

#### 4B.1 — Non-script assets keep the full extension even with preserve OFF

`preserveScriptFileExtension` is a **script-namespace** setting; `framework-component.ts` builds the asset path from the raw source extension (`relativePath + sourceFileExt`), which always carries it — independent of the toggle used by the script arm.

- [ ] Confirm **Preserve script file extension in imports** is unchecked (`false`, the default)
- [ ] Copy `astro/assets/logo.png`, paste → `import ${1:name} from '../assets/logo.png';` (the `.png` extension is **still present** — the toggle does not strip asset extensions)

### 4C — Style-name drift (config-drift safety net)

A hand-typed / drifted `typescriptImportStyle` value (matching no enum description) must still insert the **style-0 shape**, never nothing (`resolveStyleIndex` → `undefined` → builder `default:` arm).

- [ ] In `settings.json`, set `auto-import.importStatement.script.typescriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `astro/src/Widget.tsx`, paste into `astro/src/App.astro` → `import { $1 } from './Widget';` (style-0 named shape — **NOT** empty)
- [ ] The tab stop is a **bare `$1`**. The `default:` arm runs **no** Angular naming (Angular lives only in `case 0`) and `.astro` passes **no** `detectedImportName`, so even an Angular-suffixed source drifts to a bare tab stop: copy `astro/src/angular/user.component.ts`, paste → `import { $1 } from './angular/user.component';` (**NOT** `import { UserComponent }`)
- [ ] Restore: set **TypeScript / TSX import style** back to `import { name } from '_relativePath_';`

> This is the same drift behavior as [mdx.md §4D.1](mdx.md#4d--style-name-drift-config-drift-safety-net) and [svelte.md §4C](svelte.md#4c--style-name-drift-config-drift-safety-net) — the shared `typescript.ts` `default:` arm has no Angular branch. The PascalCase pre-fill in §5 is a **`case 0`-only** effect and does not survive style-name drift.

---

## 5 — Smart identifier behavior (Angular-PascalCase only, style 0)

`.astro` routes **all four** script sources through the TypeScript builder, whose style-0 calls `generateAngularLegacyImportName`. But `.astro` invokes it **without** a `detectedImportName` (`framework-component.ts` calls `buildTypeScriptImportSnippet` one-arg; `variants.ts:buildFrameworkComponentVariants` passes no third arg), so `readExportedClassName` is **never called** → there is **no exported-class fill**. The result is **Angular-PascalCase only**. Styles 1–6 always emit a bare `$1`.

> This distinguishes `.astro` smart-ID from `.ts`: `.ts` runs **both** exported-class detection and Angular naming ([typescript.md §5](typescript.md#5--smart-identifier-behavior-style-0-only)); `.astro` runs **Angular only**. It also differs from `.tsx`/`.mdx`: there, Angular fires only for `.ts`/`.tsx` sources, but for `.astro` it fires for **all four** script extensions (§5.8). Emit **no** exported-class detection case — that is `.ts`-destination-only.

Style must be set to index 0 (`import { name } from '_relativePath_';`).

### 5.1 — `.component` suffix

- [ ] Copy `astro/src/angular/user.component.ts` (no `export class`) → paste into `astro/src/App.astro`
- [ ] Output: `import { UserComponent } from './angular/user.component';` (PascalCase identifier filled directly — a committed identifier, **not** an editable `${1:…}` tab stop)

### 5.2 — `.directive` suffix

- [ ] Copy `astro/src/angular/highlight.directive.ts` → paste into `astro/src/App.astro`
- [ ] Output: `import { HighlightDirective } from './angular/highlight.directive';`

### 5.3 — `.pipe` suffix

- [ ] Copy `astro/src/angular/trim.pipe.ts` → paste into `astro/src/App.astro`
- [ ] Output: `import { TrimPipe } from './angular/trim.pipe';`

### 5.4 — `.service` suffix

- [ ] Copy `astro/src/angular/user.service.ts` → paste into `astro/src/App.astro`
- [ ] Output: `import { UserService } from './angular/user.service';`

### 5.5 — `.module` suffix

- [ ] Copy `astro/src/angular/auth.module.ts` → paste into `astro/src/App.astro`
- [ ] Output: `import { AuthModule } from './angular/auth.module';`

### 5.6 — Non-Angular source (no suffix match)

- [ ] Copy `astro/src/Widget.tsx` (no Angular suffix) → paste into `astro/src/App.astro`
- [ ] Output: `import { $1 } from './Widget';` (bare tab stop, NOT `Widget`)

### 5.7 — Exported class is NOT filled (the counter-case to `.ts` §5)

This is the signature `.astro` ≠ `.ts` case. A `.ts` source containing `export class …` is read for its class name by the `.ts` destination, but **never** by `.astro`.

- [ ] Copy `astro/src/classes/event-bus.ts` (contains `export class EventBus { }`, no Angular suffix) → paste into `astro/src/App.astro`
- [ ] Output: `import { $1 } from './classes/event-bus';` — a **bare** tab stop, NOT `${1:EventBus}` (the `.astro` builder never calls `readExportedClassName`). Contrast [typescript.md §5](typescript.md#5--smart-identifier-behavior-style-0-only), where the same source yields `import { ${1:EventBus} } from …`

### 5.8 — Angular naming fires for a `.js` source (the `.astro` ≠ `.tsx` distinction)

- [ ] Copy `astro/src/angular/widget.component.js` (an Angular-suffixed **`.js`** source) → paste into `astro/src/App.astro`
- [ ] Output: `import { WidgetComponent } from './angular/widget.component';` — PascalCase filled, because **all four** script extensions route to the TS builder here. Contrast `.tsx`/`.mdx`, where a `.js` source takes the JS fallback and gets a bare `import $1` (no Angular naming)

### 5.9 — Preserve-extension identifier stability

- [ ] With **Preserve script file extension in imports** unchecked (default): copy `astro/src/angular/user.component.ts`, paste → `import { UserComponent } from './angular/user.component';`
- [ ] Check the **Preserve script file extension in imports** checkbox, copy `astro/src/angular/user.component.ts`, paste → `import { UserComponent } from './angular/user.component.ts';`
- [ ] The identifier is **identical** (`UserComponent`) in both cases — never `UserComponentTs` — because the extension is stripped before the name is derived; only the path string changes
- [ ] Restore: uncheck **Preserve script file extension in imports**

### 5.10 — Angular suffix, illegal derived identifier (guard)

- [ ] Copy `astro/src/angular/2fa.service.ts` (no `export class`) → paste into `astro/src/App.astro`
- [ ] Output: `import { $1 } from './angular/2fa.service';` — `2fa.service` derives `2faService`, not a legal identifier (leading digit), so the name falls back to a bare `$1` tab stop, NOT `2faService` (`typescript.ts:75` guard), **even though a suffix matched**

---

## 6 — Placement modes (frontmatter `---`-fence confined)

`.astro` uses the **`astro-frontmatter`** placement mode: every import is constrained **inside the `---` frontmatter fences** (`computeAstroPlacement` / `insertSnippetAtAstroFrontmatter`). The generic Top/Bottom/Cursor section that `.ts`/`.tsx`/`.mdx` use is **NOT** emitted — placement here always resolves to a position **within the frontmatter block**, and the column is always **0** (`.astro ∈ SCRIPT_FILE_EXTENSIONS`).

**Frontmatter bounds** (`findAstroFrontmatterBounds`): a plain scan for the **first two** lines whose `trim() === '---'`. Unlike `.vue`/`.svelte`'s `<script>`-block finder, there is **no** block-selection preference — `.astro` has **no** `<script setup>` / `<script context="module">` analog, so there is no "instance vs module" tier and **no block-selection-preference sub-case**. If **fewer than two** `---` fences exist, a new `---\n…\n---\n` block is created at line 0 and all three placement modes converge there.

### 6.1 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 6.1.1 — Frontmatter with existing imports

- [ ] Open `astro/destinations/with-imports.astro`:
  ```astro
  ---
  import { Header } from '../src/Header';
  import { Footer } from '../src/Footer';
  ---

  <h1>{title}</h1>
  ```
- [ ] Copy `astro/src/Widget.tsx`, paste → import inserted on line 3 (after `import { Footer }`, before the closing `---`): `import { $1 } from '../src/Widget';`
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.2 — Empty frontmatter (no imports yet)

- [ ] Open `astro/destinations/empty-frontmatter.astro`:
  ```astro
  ---
  const title = 'Home';
  ---

  <h1>{title}</h1>
  ```
- [ ] Copy `astro/src/Widget.tsx`, paste → import inserted on line 1 (just after the opening `---` — Bottom falls back to "just after the opening fence" when the frontmatter has no `IMPORT_INDICATORS` line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.3 — `require()` marker inside the frontmatter

- [ ] Open `astro/destinations/with-require.astro`:
  ```astro
  ---
  const fs = require('fs');
  ---

  <h1>{title}</h1>
  ```
- [ ] Copy `astro/src/Widget.tsx`, paste → import inserted on line 2 (after the `require(` line — `require(` is one of the `IMPORT_INDICATORS` markers, scanned **within the fences** by `findBottomLineInRange`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.4 — Column is always 0

- [ ] Regardless of cursor position, the import is inserted at column 0 (leftmost) within the frontmatter

### 6.2 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings, set **Import statement placement** to `Top`

#### 6.2.1 — Frontmatter with existing imports

- [ ] Open `astro/destinations/with-imports.astro` (same content as §6.1.1)
- [ ] Copy `astro/src/Widget.tsx`, paste → import inserted on line 1 (just after the opening `---`, **before** `import { Header }`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.2 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 6.3 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import statement placement** to `Cursor`

#### 6.3.1 — Cursor strictly inside the fences

- [ ] Open `astro/destinations/with-imports.astro`, place cursor on line 2 (the `import { Footer }` line)
- [ ] Copy `astro/src/Widget.tsx`, paste → import inserted **at** line 2 (the cursor line is strictly between the `---` fences, so it is honored)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.2 — Cursor in the template body → falls to Bottom-in-fences (the fence-vs-template fallback)

This is the distinctive `.astro` placement case — the analog of `.vue`/`.svelte`'s "cursor outside the script block", but keyed on the `---` fences.

- [ ] Open `astro/destinations/with-imports.astro`, place cursor on line 5 (`<h1>{title}</h1>`, in the **template body** below the closing `---`)
- [ ] Copy `astro/src/Widget.tsx`, paste → import inserted on line 3 (after `import { Footer }`, **inside the fences**) — when the cursor is **not** strictly between the fence bounds (`rawCursorLine > openingLine && rawCursorLine < closingLine` is false), Cursor falls back to Bottom-within-fences. The import does **not** land at the cursor in the markup
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.3 — Cursor on a comment line inside the fences (adjusted above)

- [ ] Open `astro/destinations/comment-cursor.astro`:
  ```astro
  ---
  import { Header } from '../src/Header';

  /*
   * Some documentation
   */
  ---

  <h1>{title}</h1>
  ```
- [ ] Place cursor on line 3 (the `/*` opener), copy `astro/src/Widget.tsx`, paste → import is adjusted **above** the comment block (inserted at the `/*` line position, pushing the block down) — `adjustForCommentBlock` applies inside the frontmatter. **`.astro` is not Markdown**, so a leading `*` line IS treated as a comment continuation (unlike `.md`/`.mdx`)
- [ ] Undo (`Cmd+Z`) to restore the file

### 6.4 — Create-if-missing frontmatter (no `---` fences)

- [ ] Open `astro/destinations/template-only.astro`:
  ```astro
  <h1>{title}</h1>
  ```
- [ ] Copy `astro/src/Widget.tsx`, paste → a new `---` frontmatter block is created at line 0 wrapping the import:
  ```astro
  ---
  import { $1 } from '../src/Widget';
  ---
  <h1>{title}</h1>
  ```
- [ ] Repeat with **Top** and **Cursor** placement — **all three modes converge** on the same created wrapper at line 0 (the create-if-missing branch returns before the placement switch)
- [ ] Undo (`Cmd+Z`) after each to restore the file

### 6.5 — Detected indentation

- [ ] Open `astro/destinations/indented-imports.astro`:
  ```astro
  ---
    import { Header } from '../src/Header';
  ---

  <h1>{title}</h1>
  ```
- [ ] Copy `astro/src/Widget.tsx`, paste → the inserted import adopts the **frontmatter's detected indentation** (two spaces, taken from the last import line by `findBottomLineInRange`): `  import { $1 } from '../src/Widget';`
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 7 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change, single-variant fast path) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 7.1 — Script source: QuickPick shows all 7 TS styles

- [ ] Copy `astro/src/Widget.tsx`, run Paste as Import (Pick Style) in `astro/src/App.astro`
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

- [ ] Copy `astro/src/components/Widget.tsx` (a nested `.tsx` source), run the command in `astro/src/App.astro`
- [ ] Select `import * as name from '_relativePath_';` from the picker — its label previews the **basename**: `import * as name from 'Widget';`
- [ ] Verify the INSERTED text uses the **full relative path**: `import * as $1 from './components/Widget';`

### 7.3 — Style-0 label is Angular-prefilled for a suffixed path

- [ ] Copy `astro/src/angular/user.component.ts`, run the command in `astro/src/App.astro`
- [ ] The style-0 item's **label** is `import { UserComponent } from 'user.component';` (basename preview, Angular PascalCase filled — `generateAngularLegacyImportName` runs on the label path too)
- [ ] Selecting it inserts `import { UserComponent } from './angular/user.component';` (full path)
- [ ] Styles 1–6 show a bare `name` placeholder in their labels (Angular fills only style 0)

### 7.4 — Asset source: single fixed variant (direct insert)

A non-script asset has exactly **one** variant (the fixed shape), so the single-variant fast path applies — the picker is not shown and the import is inserted directly ([general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics)).

- [ ] Copy `astro/assets/logo.png`, run Paste as Import (Pick Style) in `astro/src/App.astro`
- [ ] No style list appears (one variant only) → `import ${1:name} from '../assets/logo.png';` is inserted directly
- [ ] (Were the picker shown, the single item's label would be the basename preview `import name from 'logo.png';` with an empty description — hardcoded variants carry no tag)

> **No 0-variant case.** **Every** `.astro` source produces at least one variant — script → 7 TS, non-script → 1 fixed. There is no empty picker (the contrast to `jsx.md`, where a `.ts`/`.tsx` source produces zero variants).

---

## 8 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark on current default, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

### 8.1 — Script source: selecting a TS style persists to `typescriptImportStyle`

- [ ] Copy `astro/src/Widget.tsx`, run Set Default Import Style in `astro/src/App.astro`
- [ ] Select `import type { name } from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import type { name } from '_relativePath_';`
- [ ] Check VS Code Settings → **TypeScript / TSX import style** (`typescriptImportStyle`) is now `import type { name } from '_relativePath_';`
- [ ] Reset: run the command again on `astro/src/Widget.tsx`, select `import { name } from '_relativePath_';` to restore the default

### 8.2 — Shared-setting cross-effect (no `astroImportStyle`)

`.astro` has **no** `astroImportStyle` key — §8.1 wrote `typescriptImportStyle`, the **same** key that governs other destinations.

- [ ] In VS Code Settings, confirm there is **no** `astroImportStyle` setting — the value from §8.1 lives under **TypeScript / TSX import style** (`auto-import.importStatement.script.typescriptImportStyle`)
- [ ] `typescriptImportStyle` also governs `.ts` destinations, `.ts`/`.tsx` sources into `.tsx`/`.mdx`, and **all** script sources into `.vue`/`.svelte`/`.astro`. Setting this default from a `.astro` paste therefore changes that style **everywhere the key is read** — including `.ts`/`.tsx`/`.mdx`/`.vue`/`.svelte` destinations. (The setting's `package.json` description names `.vue`/`.svelte`/`.astro` explicitly.)
- [ ] Confirm the setting was restored to its default in §8.1

### 8.3 — Asset source: no configurable style

A non-script asset's single variant carries no backing setting, so there is nothing to persist.

- [ ] Copy `astro/assets/logo.png`, run Set Default Import Style in `astro/src/App.astro`
- [ ] Warning toast: `Auto Import: .png → .astro imports use a fixed style.` (the `no-configurable-style` reject) — no picker, no setting written

---

## 9 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.astro` editor. A drop reuses the same `buildImportSnippet` + `computeImportPlacement` pipeline as paste, so the inserted string is **byte-identical** to the §2 happy path. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 9.1 — Happy path, script source

- [ ] Drag `astro/src/model.ts` from Explorer into `astro/src/App.astro` editor
- [ ] Import inserted using the default TypeScript style — `import { $1 } from './model';` (byte-identical to the §2.1 paste result)
- [ ] Placement follows the `importStatementPlacement` setting, constrained to the `---` frontmatter (same as paste)

### 9.2 — Happy path, asset source

- [ ] Drag `astro/assets/logo.png` into `astro/src/App.astro` → `import ${1:name} from '../assets/logo.png';` (the named-default asset shape, byte-identical to §2.2)
- [ ] Drag `astro/assets/clip.mp4` into `astro/src/App.astro` → `import ${1:url} from '../assets/clip.mp4';` (the url-default asset shape — av / text-track — byte-identical to §2.3; cursor lands on the `${1:url}` placeholder. `theme.mp3` / `subs.vtt` are interchangeable)

### 9.3 — Unsupported-pair drop → raw-text fallback

Because `.astro` is **allow-list**, a gated-out source has no snippet to offer. The drop edit resolves to `null`, so VS Code falls back to its **default text-drop** and the **raw path text** lands — distinct from paste, which inserts nothing at all. (This case does **not** exist for accept-all `.tsx`, where every source builds a snippet.)

- [ ] Drag `astro/assets/global.css` (a `.css` — gated out) into `astro/src/App.astro`
- [ ] Warning toast: `Auto Import: Cannot import .css into .astro files.` **AND** no import is inserted — instead the **raw file path text** is dropped (VS Code's default text-drop)
- [ ] Repeat with `astro/assets/page.html` and `astro/assets/manual.pdf` → same `not-supported` toast + raw-text fallback. (Note: `.vue`/`.svelte`/`.md`/`.mdx` are **accepted** by `.astro`, so they do **not** trigger this fallback — pick from the five reject categories only)
- [ ] Undo (`Cmd+Z`) to remove the dropped raw text

### 9.4 — Placement with Bottom mode

- [ ] In the extension settings, set **Import statement placement** to `Bottom` (the default)
- [ ] Open `astro/destinations/with-imports.astro` (has existing imports in its `---` frontmatter)
- [ ] Drag `astro/src/Widget.tsx` → import lands after the last existing import line, inside the fences: `import { $1 } from '../src/Widget';`
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.5 — Placement with Top mode

- [ ] Set **Import statement placement** to `Top`
- [ ] Drag `astro/src/Widget.tsx` into `astro/destinations/with-imports.astro` → import lands on line 1 (just after the opening `---`)
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.6 — Placement with Cursor mode (comment adjustment)

- [ ] Set **Import statement placement** to `Cursor`
- [ ] Open `astro/destinations/comment-cursor.astro` (content as in §6.3.3), drag `astro/src/Widget.tsx` and drop onto line 3 (the `/*` opener)
- [ ] Import is adjusted **above** the comment block (same as paste Cursor §6.3.3 — `computeImportPlacement` applies `adjustForCommentBlock` within the fences on drop too)
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.7 — Column is always 0

- [ ] Even if the drop position is mid-line, the import inserts at column 0 within the frontmatter

### 9.8 — Angular naming applies on drop

- [ ] Drag `astro/src/angular/user.component.ts` (no `export class`) into `astro/src/App.astro`
- [ ] Import is `import { UserComponent } from './angular/user.component';` (Angular PascalCase, same as paste §5.1)

### 9.9 — `preserveScriptFileExtension` respected on drop

- [ ] In the extension settings, check the **Preserve script file extension in imports** checkbox
- [ ] Drag `astro/src/Widget.tsx` into `astro/src/App.astro` → path is `'./Widget.tsx'`
- [ ] Drag `astro/assets/logo.png` → path is still `'../assets/logo.png'` (asset extensions are kept regardless — the toggle is script-namespace)
- [ ] Uncheck **Preserve script file extension in imports** to restore the default

### 9.10 — Wrapper created on drop into a frontmatter-less `.astro`

- [ ] Open `astro/destinations/template-only.astro` (no `---` frontmatter; content as in §6.4)
- [ ] Drag `astro/src/Widget.tsx` → a new `---` frontmatter block is created at line 0 with the import inside — byte-identical to the paste-side §6.4 block:
  ```astro
  ---
  import { $1 } from '../src/Widget';
  ---
  ```
- [ ] Undo, then drag `astro/assets/logo.png` → the wrapper is created with the **single-variant asset** shape inside: `import ${1:name} from '../assets/logo.png';`
- [ ] Undo (`Cmd+Z`) to restore the file

> **Universal drop precondition** (untitled / unsaved buffer is a no-op): cross-cutting across all 12 destinations and verified once in [typescript.md §9.10](typescript.md#910--universal-drop-precondition-cross-cutting--verified-once-here) — **not** re-tested here.

---

## 10 — Edge cases

### 10.1 — `require()` / `import`-in-string false positives are scoped to the frontmatter fences

Bottom placement scans for `IMPORT_INDICATORS` markers, but for `.astro` the scan (`findBottomLineInRange`) is **bounded by the `---` fences** — a marker outside the frontmatter does not move the insertion point.

- [ ] Set **Import statement placement** to `Bottom`
- [ ] Open `astro/destinations/with-require.astro` (content as in §6.1.3) → paste `astro/src/Widget.tsx` lands after the `const fs = require('fs');` line (the `require(` marker counts, inside the fences)

### 10.2 — `import` substring inside a string literal (Bottom mode, in-fence)

- [ ] Open `astro/destinations/string-literal.astro`:
  ```astro
  ---
  const msg = "you should import this";
  ---

  <h1>{title}</h1>
  ```
- [ ] Bottom mode: the substring `import ` inside the string literal IS detected as an import marker (known heuristic limitation — not a bug); the import lands after that line, **within the `---` fences**
- [ ] Undo (`Cmd+Z`) to restore the file

### 10.3 — The named-asset import family (every accepted non-script source is asset-routed)

`.astro` accepts the other framework components and Markdown, and routes **all** of them through `buildAssetImportStatement` as **named-asset** imports — even though `determineImportType` classifies `.vue`/`.svelte`/`.astro` as `'script'` and `.mdx` is a script extension elsewhere in the extension. The framework builder **ignores** `determineImportType` and keys only on its local `SCRIPT_SOURCE_EXTENSIONS` (`.ts`/`.tsx`/`.js`/`.jsx`), so every other accepted source falls through to the asset switch's image/doc/component group.

| # | Source | Output | Why it's an asset, not a script import |
|---|--------|--------|----------------------------------------|
| 10.3.1 | `astro/assets/Card.astro` | `import ${1:name} from '../assets/Card.astro';` | self-import; `.astro ∉ SCRIPT_SOURCE_EXTENSIONS` |
| 10.3.2 | `astro/assets/Demo.vue` | `import ${1:name} from '../assets/Demo.vue';` | cross-framework; `.vue ∉ SCRIPT_SOURCE_EXTENSIONS` |
| 10.3.3 | `astro/assets/Widget.svelte` | `import ${1:name} from '../assets/Widget.svelte';` | cross-framework; `.svelte ∉ SCRIPT_SOURCE_EXTENSIONS` |
| 10.3.4 | `astro/assets/notes.md` | `import ${1:name} from '../assets/notes.md';` | doc; `.md ∉ SCRIPT_SOURCE_EXTENSIONS` |
| 10.3.5 | `astro/assets/post.mdx` | `import ${1:name} from '../assets/post.mdx';` | doc; **`.mdx` is a *script* extension everywhere else** — the sharpest proof |

- [ ] Copy each source, paste into `astro/src/App.astro` → each inserts the **named-default asset** shape `import ${1:name} from '<full-path>';` (full extension kept), NOT a script `import { $1 }`
- [ ] **10.3.5 (`.mdx`→`.astro`) is the signature case**: `.mdx` routes to the TS *script* arm when it is the **destination** (and is the byte-twin of `.tsx`), yet as a **source** into `.astro` it is asset-routed to `import ${1:name}` — because `framework-component.ts` never consults `determineImportType`

---

## 11 — Sign-off

- [ ] Cross-import gating — allow-list matrix: 16 accept rows (script ×4 → TS named; named-asset family `.astro`-self/`.vue`/`.svelte`/`.md`/`.mdx` + data ×3 + image → named-asset; video/audio/text-track → url-asset) + 5 reject rows (`.css`/`.scss`/`.html`/`.woff2`/`.pdf` → `not-supported`); same-file owned by general.md (21 cases)
- [ ] Paste as Import — happy path (3 cases: script / named-asset / url-asset)
- [ ] Insert Import from Selected File (1 case)
- [ ] Style model — arm 1: all 7 TypeScript styles (one table for all four script exts) + `.js`-uses-TS-table note (7 cases)
- [ ] Style model — arm 2: 2 reachable asset shapes (named-default + url-default) + asset-keeps-extension + no-module-css/side-effect/empty-snippet assertions (3 cases)
- [ ] Style-name drift safety net — `typescriptImportStyle` → style-0 shape; Angular path also drifts to bare `$1` (1 case)
- [ ] Smart identifier — Angular PascalCase (5 suffixes) + non-Angular + no-exported-class-fill counter-case + `.js`-Angular-fires + preserve-stable + invalid-identifier guard (10 cases)
- [ ] Placement — frontmatter `---`-fence confined: Bottom (4, incl. empty-frontmatter fallback + in-fence `require(`) + Top (2) + Cursor (3, incl. **fence-vs-template fallback** + comment-adjust) + create-if-missing + detected indentation (≈12 cases; **no** generic Top/Bottom/Cursor section; **no** block-selection-preference sub-case)
- [ ] Paste as Import (Pick Style) — 7 TS items / label-vs-inserted / style-0 Angular label / asset direct-insert (4 cases; no 0-variant case)
- [ ] Set Default Import Style — TS persist / no-`astroImportStyle` shared-setting cross-effect / asset `no-configurable-style` (3 cases)
- [ ] Drag-and-drop — happy script / happy asset (named + url) / **unsupported-pair raw-text fallback** / placement (Bottom/Top/Cursor in-fence) / column 0 / Angular-on-drop / preserve / **wrapper-create-on-drop** + asset-in-wrapper (11 cases)
- [ ] Edge cases — in-fence `require(` + string-literal false positives / **named-asset import family** (`.astro`/`.vue`/`.svelte`/`.md`/`.mdx`→`.astro`, 5 members) (7 cases)

**Total: ~84 test cases**
