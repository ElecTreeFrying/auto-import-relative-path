# qa.new/workspace/svelte/

Fixtures for the Svelte destination checklist ([`checklists/svelte.md`](../../checklists/svelte.md)).

`.svelte` is the pipeline's **second framework-trio destination** — `.vue`/`.svelte`/`.astro` all share one
builder, `src/snippets/languages/framework-component.ts`. That builder branches on its own local
`SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]` and routes **all four** to the **TypeScript**
builder (one-arg, no detection); **everything else** gated-in goes to `buildAssetImportStatement`. Two
consequences shape this fixture set:

- **One script table, not two.** A `.js`/`.jsx` source renders the **TS named** shape `import { $1 }`,
  **not** a JS default — so there is **no JS-fallback arm and no empty-snippet case** (the headline
  divergence from `tsx/` and `mdx/`). All four script sources share the 7 `typescriptImportStyle` styles;
  `.svelte` has **no** `svelteImportStyle`.
- **Angular-only smart identifiers, for all four script exts.** Style-0 runs
  `generateAngularLegacyImportName`, but the builder is called **without** a `detectedImportName`, so
  `readExportedClassName` is **never** invoked → **no exported-class fill**. That is why `src/angular/`
  (suffix → PascalCase, **no** `export class`) and `src/classes/event-bus.ts` (the no-fill counter-case,
  which *does* contain `export class`) exist. Angular fires even for the `.js` source (§5.8).

`.svelte` is **allow-list** (`SVELTE_SUPPORTED_EXTENSIONS`), so non-member sources are gate-rejected. Unlike
the other allow-list workspaces (`javascript/`, `css/`, …) there is **no `rejected/` dir** — `svelte.md`
co-locates the 9 gated-out fixtures inside **`assets/`** alongside the 8 accepted non-script sources.
Every fixture below is referenced by `svelte.md`, so the directory is checklist↔workspace 1:1 with no orphans.

**Two deltas from `vue/`** (same builder, mirrored choices): (1) svelte **accepts** its own `.svelte`
(self → `assets/Card.svelte`) and **rejects** `.vue` (`assets/Demo.vue`) — vue did the mirror. (2) Svelte has
**no `<script setup>`** (a Vue construct), so the block-preference fixture is `module-and-instance.svelte`
(`<script context="module">` + a plain instance `<script>`) and there is an **extra**
`module-only.svelte` (tier-3 fallback) — **9 destinations vs vue's 8**. The primary `App.svelte` has a plain
empty `<script>`, not `<script setup>`.

## Layout

```
svelte/
├── src/                           Script sources + the .svelte paste/drop destination (copy/drag FROM these)
│   ├── App.svelte                 Primary paste/drop DESTINATION (open this; empty <script>)
│   ├── Widget.tsx                 .tsx source, no Angular suffix → TS named `import { $1 } from './Widget';`
│   ├── model.ts                   .ts source → TS named
│   ├── helper.js                  .js source → TS named (NOT a JS default — the .svelte divergence)
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
├── assets/                        Non-script sources — 8 ACCEPTED (fixed shape) + 9 REJECTED (gated out)
│   ├── logo.png                   image      (0-byte)  → import ${1:name}
│   ├── data.json                  data                 → import ${1:name}
│   ├── config.yaml                data                 → import ${1:name}
│   ├── config.yml                 data                 → import ${1:name}
│   ├── clip.mp4                   video      (0-byte)  → import ${1:url}
│   ├── theme.mp3                  audio      (0-byte)  → import ${1:url}
│   ├── subs.vtt                   text-track           → import ${1:url}
│   ├── Card.svelte                framework (self)     → import ${1:name}  (asset-routed — §1.5 / §10.3)
│   ├── page.mdx                   REJECTED — script-category, not accepted (§1.13)
│   ├── Demo.vue                   REJECTED — other framework (§1.14)
│   ├── Layout.astro               REJECTED — other framework (§1.15)
│   ├── global.css                 REJECTED — stylesheet (§1.16)
│   ├── theme.scss                 REJECTED — stylesheet (§1.17)
│   ├── page.html                  REJECTED — html (§1.18)
│   ├── notes.md                   REJECTED — markdown (§1.19)
│   ├── font.woff2                 REJECTED — font (0-byte) (§1.20)
│   └── manual.pdf                 REJECTED — document (0-byte) (§1.21)
└── destinations/                  Pre-filled .svelte files for placement tests (undo after each paste)
    ├── module-and-instance.svelte <script context="module"> + instance <script> — block-selection preference (§6.1)
    ├── instance-only.svelte       instance <script> only — empty-block fallback (§6.2.2)
    ├── module-only.svelte         <script context="module"> only — tier-3 fallback, no instance (§6.2.3)
    ├── with-imports.svelte        instance <script> with two imports — Bottom/Top/Cursor (§6.2.1, 6.3.1, 6.4)
    ├── with-require.svelte        <script> with require() — IMPORT_INDICATORS marker (§6.2.4, 10.1)
    ├── comment-cursor.svelte      <script> + /* */ block — cursor comment adjust (§6.4.3, 9.6)
    ├── template-only.svelte       NO <script> — create-if-missing wrapper (§6.5, 9.10)
    ├── indented-imports.svelte    2-space-indented import — detected indentation (§6.6)
    └── string-literal.svelte      "import" inside a string literal (§10.2)
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/App.svelte` | 1–10 | Primary paste/drop **destination** (the open editor; empty `<script>`) |
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
| `src/angular/widget.component.js` | 5.8 | Angular suffix on a `.js` source → **still** PascalCase (`.svelte` ≠ `.tsx`) |
| `src/angular/2fa.service.ts` | 5.10 | Angular suffix, illegal derived id (leading digit) → bare `$1` |
| `src/classes/event-bus.ts` | 5.7 | `export class EventBus` → still bare `$1` (`.svelte` never reads classes) |
| `assets/logo.png` | 1.9, 2.2, 4B, 4B.1, 7.4, 8.3, 9.2, 9.9 | Image — `${1:name}` (the primary asset across the checklist) |
| `assets/data.json` | 1.6 | Data — `${1:name}` (`.vue`/`.svelte`/`.astro` are the only destinations that accept data) |
| `assets/config.yaml` | 1.7 | Data — `${1:name}` |
| `assets/config.yml` | 1.8 | Data — `${1:name}` |
| `assets/clip.mp4` | 1.10, 2.3, 4B, 9.2 | Video — `${1:url}` (empty placeholder) |
| `assets/theme.mp3` | 1.11, 9.2 | Audio — `${1:url}` (empty placeholder) |
| `assets/subs.vtt` | 1.12, 9.2 | Text-track — `${1:url}` |
| `assets/Card.svelte` | 1.5, 10.3 | `.svelte` self-source → **asset-routed** `${1:name}` (the `.svelte`→`.svelte` quirk) |
| `assets/page.mdx` | 1.13, 9.3 | **Reject** — script-category but not accepted (the instructive reject) |
| `assets/Demo.vue` | 1.14, 9.3 | **Reject** — other framework |
| `assets/Layout.astro` | 1.15 | **Reject** — other framework |
| `assets/global.css` | 1.16, 9.3 | **Reject** — stylesheet (raw-text fallback on drop, §9.3) |
| `assets/theme.scss` | 1.17 | **Reject** — stylesheet |
| `assets/page.html` | 1.18 | **Reject** — html |
| `assets/notes.md` | 1.19 | **Reject** — markdown |
| `assets/font.woff2` | 1.20 | **Reject** — font (empty placeholder) |
| `assets/manual.pdf` | 1.21 | **Reject** — document (empty placeholder) |
| `destinations/module-and-instance.svelte` | 6.1 | Instance `<script>` wins over `<script context="module">` (block-selection preference) |
| `destinations/instance-only.svelte` | 6.2.2 | Instance `<script>` only — empty-block fallback |
| `destinations/module-only.svelte` | 6.2.3 | `<script context="module">` only — tier-3 fallback (no instance `<script>`) |
| `destinations/with-imports.svelte` | 6.2.1, 6.3.1, 6.4.1, 6.4.2, 9.4, 9.5 | Two imports — Bottom/Top/Cursor placement tests |
| `destinations/with-require.svelte` | 6.2.4, 10.1 | `require()` — Bottom detects as import marker, scoped to the block |
| `destinations/comment-cursor.svelte` | 6.4.3, 9.6 | Cursor on `/* */` block — adjusts above the comment (in-block) |
| `destinations/template-only.svelte` | 6.5, 9.10 | No `<script>` — create-if-missing wrapper at line 0 |
| `destinations/indented-imports.svelte` | 6.6 | 2-space-indented import — adopts detected block indentation |
| `destinations/string-literal.svelte` | 10.2 | `import` substring inside a string literal (known heuristic) |

## File count

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/` | 14 | Script sources (all four exts → TS arm) + nested source + `angular/` (7) + `classes/` (1) + primary destination `App.svelte` |
| `assets/` | 17 | Non-script sources — **8 accepted** (fixed shapes) + **9 rejected** (gated out, co-located; no `rejected/` dir) |
| `destinations/` | 9 | Pre-filled SFC `<script>`-block placement-test destinations (incl. `module-only.svelte`, the tier-3 fallback vue did not need) |
| **Total** | **40** |
