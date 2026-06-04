# qa/workspace/astro/

Fixtures for the Astro destination checklist ([`checklists/astro.md`](../../checklists/astro.md)).

`.astro` is the pipeline's **third and final framework-trio destination** — `.vue`/`.svelte`/`.astro` all
share one builder, `src/snippets/languages/framework-component.ts`. That builder branches on its own local
`SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]` and routes **all four** to the **TypeScript**
builder (one-arg, no detection); **everything else** gated-in goes to `buildAssetImportStatement`. Two
consequences shape this fixture set:

- **One script table, not two.** A `.js`/`.jsx` source renders the **TS named** shape `import { $1 }`,
  **not** a JS default — so there is **no JS-fallback arm and no empty-snippet case** (the headline
  divergence from `tsx/` and `mdx/`). All four script sources share the 7 `typescriptImportStyle` styles;
  `.astro` has **no** `astroImportStyle`.
- **Angular-only smart identifiers, for all four script exts.** Style-0 runs
  `generateAngularLegacyImportName`, but the builder is called **without** a `detectedImportName`, so
  `readExportedClassName` is **never** invoked → **no exported-class fill**. That is why `src/angular/`
  (suffix → PascalCase, **no** `export class`) and `src/classes/event-bus.ts` (the no-fill counter-case,
  which *does* contain `export class`) exist. Angular fires even for the `.js` source (§5.8).

`.astro` is **allow-list** (`ASTRO_SUPPORTED_EXTENSIONS`), so non-member sources are gate-rejected. Unlike
the other allow-list workspaces (`javascript/`, `css/`, …) there is **no `rejected/` dir** — `astro.md`
co-locates the gated-out fixtures inside **`assets/`** alongside the accepted non-script sources. Every
fixture below is referenced by `astro.md`, so the directory is checklist↔workspace 1:1 with no orphans.

**Two deltas from `vue/`/`svelte/`** (same builder, wider choices): (1) `.astro` has the **widest accept-list**
of the trio — it additionally **accepts** the other framework components (`.vue`/`.svelte`), Markdown (`.md`),
and `.mdx`, the four sources `.vue`/`.svelte` *reject*. All four route to the **named-asset** arm, so `assets/`
splits **12 accept / 5 reject** (vs vue's & svelte's 8/9); the self-asset is `Card.astro` (the `.astro`→`.astro`
quirk). (2) `.astro` has **no** `<script setup>` (Vue) or `<script context="module">` (Svelte) — placement is
confined to a flat `---` frontmatter fence pair (`computeAstroPlacement`), with **no** instance-vs-module tier
and **no** block-selection-preference sub-case. The block-tier destination fixtures collapse; in their place is
`empty-frontmatter.astro` (§6.1.2) — **7 destinations vs svelte's 9, vue's 8**. The primary `App.astro` has an
empty `---` frontmatter (two bare fences), not a `<script>` block.

## Layout

```
astro/
├── src/                           Script sources + the .astro paste/drop destination (copy/drag FROM these)
│   ├── App.astro                  Primary paste/drop DESTINATION (open this; empty --- frontmatter)
│   ├── Widget.tsx                 .tsx source, no Angular suffix → TS named `import { $1 } from './Widget';`
│   ├── model.ts                   .ts source → TS named
│   ├── helper.js                  .js source → TS named (NOT a JS default — the .astro divergence)
│   ├── Card.jsx                   .jsx source → TS named
│   ├── components/
│   │   └── Widget.tsx             Nested source — §7.2 basename-vs-full-path
│   ├── angular/                   Angular-suffix sources (NO `export class`) → style-0 PascalCase
│   │   ├── user.component.ts       → UserComponent
│   │   ├── highlight.directive.ts  → HighlightDirective
│   │   ├── trim.pipe.ts            → TrimPipe
│   │   ├── user.service.ts         → UserService
│   │   ├── auth.module.ts          → AuthModule
│   │   ├── widget.component.js      Angular suffix on a .js source → STILL PascalCase (§5.8)
│   │   └── 2fa.service.ts           Illegal derived id (leading digit) → bare $1 (§5.10)
│   └── classes/
│       └── event-bus.ts           `export class EventBus` — the no-exported-class-fill counter-case (§5.7)
├── assets/                        Non-script sources — 12 ACCEPTED (fixed shape) + 5 REJECTED (gated out)
│   ├── logo.png                   image      (0-byte)  → import ${1:name}
│   ├── data.json                  data                 → import ${1:name}
│   ├── config.yaml                data                 → import ${1:name}
│   ├── config.yml                 data                 → import ${1:name}
│   ├── clip.mp4                   video      (0-byte)  → import ${1:url}
│   ├── theme.mp3                  audio      (0-byte)  → import ${1:url}
│   ├── subs.vtt                   text-track           → import ${1:url}
│   ├── Card.astro                 framework (self)     → import ${1:name}  (asset-routed — §1.5 / §10.3)
│   ├── Demo.vue                   framework (cross)    → import ${1:name}  (ACCEPTED — §1.6 / §10.3)
│   ├── Widget.svelte              framework (cross)    → import ${1:name}  (ACCEPTED — §1.7 / §10.3)
│   ├── notes.md                   markdown (doc)       → import ${1:name}  (ACCEPTED — §1.8 / §10.3)
│   ├── post.mdx                   script-cat. doc      → import ${1:name}  (ACCEPTED — §1.9 / §10.3 — the signature case)
│   ├── global.css                 REJECTED — stylesheet (§1.17)
│   ├── theme.scss                 REJECTED — stylesheet (§1.18)
│   ├── page.html                  REJECTED — html (§1.19)
│   ├── font.woff2                 REJECTED — font (0-byte) (§1.20)
│   └── manual.pdf                 REJECTED — document (0-byte) (§1.21)
└── destinations/                  Pre-filled .astro files for placement tests (undo after each paste)
    ├── with-imports.astro         --- frontmatter with two imports — Bottom/Top/Cursor (§6.1.1, 6.2.1, 6.3.1)
    ├── empty-frontmatter.astro    --- frontmatter, no imports — Bottom→just-after-opening-fence (§6.1.2)
    ├── with-require.astro         require() inside the fences — IMPORT_INDICATORS marker (§6.1.3, 10.1)
    ├── comment-cursor.astro       --- frontmatter + /* */ block — cursor comment adjust (§6.3.3, 9.6)
    ├── template-only.astro        NO --- frontmatter — create-if-missing wrapper (§6.4, 9.10)
    ├── indented-imports.astro     2-space-indented import — detected indentation (§6.5)
    └── string-literal.astro       "import" inside a string literal (§10.2)
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/App.astro` | 1–10 | Primary paste/drop **destination** (the open editor; empty `---` frontmatter) |
| `src/model.ts` | 1.1, 2.1, 3, 9.1 | `.ts` source → TS named shape |
| `src/Widget.tsx` | 1.2, 4A, 4C, 5.6, 6.x, 7.1, 8.1, 9.4–9.9 | Plain `.tsx` source → TS named; bare `$1` (no Angular, no class) |
| `src/helper.js` | 1.3, 4A | `.js` source → **TS** named (the `.js`-uses-TS-table divergence) |
| `src/Card.jsx` | 1.4 | `.jsx` source → **TS** named |
| `src/components/Widget.tsx` | 7.2 | Nested source — picker label = basename, inserted = full path |
| `src/angular/user.component.ts` | 4C, 5.1, 5.9, 7.3, 9.8 | `.component` suffix → `UserComponent` (no `export class`) |
| `src/angular/highlight.directive.ts` | 5.2 | `.directive` suffix → `HighlightDirective` |
| `src/angular/trim.pipe.ts` | 5.3 | `.pipe` suffix → `TrimPipe` |
| `src/angular/user.service.ts` | 5.4 | `.service` suffix → `UserService` |
| `src/angular/auth.module.ts` | 5.5 | `.module` suffix → `AuthModule` |
| `src/angular/widget.component.js` | 5.8 | Angular suffix on a `.js` source → **still** PascalCase (`.astro` ≠ `.tsx`) |
| `src/angular/2fa.service.ts` | 5.10 | Angular suffix, illegal derived id (leading digit) → bare `$1` |
| `src/classes/event-bus.ts` | 5.7 | `export class EventBus` → still bare `$1` (`.astro` never reads classes) |
| `assets/logo.png` | 1.13, 2.2, 4B, 4B.1, 7.4, 8.3, 9.2, 9.9 | Image — `${1:name}` (the primary asset across the checklist) |
| `assets/data.json` | 1.10 | Data — `${1:name}` (`.vue`/`.svelte`/`.astro` are the only destinations that accept data) |
| `assets/config.yaml` | 1.11 | Data — `${1:name}` |
| `assets/config.yml` | 1.12 | Data — `${1:name}` |
| `assets/clip.mp4` | 1.14, 2.3, 4B, 9.2 | Video — `${1:url}` (empty placeholder) |
| `assets/theme.mp3` | 1.15, 9.2 | Audio — `${1:url}` (empty placeholder) |
| `assets/subs.vtt` | 1.16, 9.2 | Text-track — `${1:url}` |
| `assets/Card.astro` | 1.5, 10.3.1 | `.astro` self-source → **asset-routed** `${1:name}` (the `.astro`→`.astro` quirk) |
| `assets/Demo.vue` | 1.6, 10.3.2 | `.vue` cross-framework → **ACCEPTED**, asset-routed `${1:name}` (the widest-accept-list delta) |
| `assets/Widget.svelte` | 1.7, 10.3.3 | `.svelte` cross-framework → **ACCEPTED**, asset-routed `${1:name}` |
| `assets/notes.md` | 1.8, 10.3.4 | `.md` doc → **ACCEPTED**, asset-routed `${1:name}` |
| `assets/post.mdx` | 1.9, 10.3.5 | `.mdx` doc → **ACCEPTED**, asset-routed `${1:name}` (signature case — a *script* ext elsewhere) |
| `assets/global.css` | 1.17, 9.3 | **Reject** — stylesheet (raw-text fallback on drop, §9.3) |
| `assets/theme.scss` | 1.18 | **Reject** — stylesheet |
| `assets/page.html` | 1.19, 9.3 | **Reject** — html |
| `assets/font.woff2` | 1.20 | **Reject** — font (empty placeholder) |
| `assets/manual.pdf` | 1.21, 9.3 | **Reject** — document (empty placeholder) |
| `destinations/with-imports.astro` | 6.1.1, 6.2.1, 6.3.1, 6.3.2, 9.4, 9.5 | Two imports — Bottom/Top/Cursor placement tests |
| `destinations/empty-frontmatter.astro` | 6.1.2 | `---` frontmatter, no imports — Bottom falls back to just-after-opening-fence |
| `destinations/with-require.astro` | 6.1.3, 10.1 | `require()` — Bottom detects as import marker, scoped to the fences |
| `destinations/comment-cursor.astro` | 6.3.3, 9.6 | Cursor on `/* */` block — adjusts above the comment (in-fence) |
| `destinations/template-only.astro` | 6.4, 9.10 | No `---` frontmatter — create-if-missing wrapper at line 0 |
| `destinations/indented-imports.astro` | 6.5 | 2-space-indented import — adopts detected frontmatter indentation |
| `destinations/string-literal.astro` | 10.2 | `import` substring inside a string literal (known heuristic) |

## File count

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/` | 14 | Script sources (all four exts → TS arm) + nested source + `angular/` (7) + `classes/` (1) + primary destination `App.astro` |
| `assets/` | 17 | Non-script sources — **12 accepted** (fixed shapes) + **5 rejected** (gated out, co-located; no `rejected/` dir) |
| `destinations/` | 7 | Pre-filled `---`-frontmatter placement-test destinations (no block tiers; `empty-frontmatter.astro` replaces the `<script>`-block fixtures) |
| **Total** | **38** |
