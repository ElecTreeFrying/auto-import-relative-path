# qa/workspace/vue/CLAUDE.md

Fixtures for `checklists/vue.md` — the `.vue` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `vue.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `vue.md`.

## Layout

```
vue/
├── src/                          Script sources + the .vue paste/drop destination (copy/drag FROM these)
│   ├── App.vue                   Primary paste/drop DESTINATION (open this; empty <script setup>)
│   ├── Widget.tsx                .tsx source, no Angular suffix → TS named `import { $1 } from './Widget';`
│   ├── model.ts                  .ts source → TS named
│   ├── helper.js                 .js source → TS named (NOT a JS default — the .vue divergence)
│   ├── Card.jsx                  .jsx source → TS named
│   ├── components/
│   │   └── Widget.tsx            Nested source — §7.2 basename-vs-full-path
│   ├── angular/                  Angular-suffix sources (NO `export class`) → style-0 PascalCase
│   │   ├── user.component.ts      → UserComponent
│   │   ├── highlight.directive.ts → HighlightDirective
│   │   ├── trim.pipe.ts           → TrimPipe
│   │   ├── user.service.ts        → UserService
│   │   ├── auth.module.ts         → AuthModule
│   │   ├── widget.component.js     Angular suffix on a .js source → STILL PascalCase (§5.8)
│   │   └── 2fa.service.ts          Illegal derived id (leading digit) → bare $1 (§5.10)
│   └── classes/
│       └── event-bus.ts          `export class EventBus` — the no-exported-class-fill counter-case (§5.7)
├── assets/                       Non-script sources — ACCEPTED (fixed shape) + REJECTED (gated out)
│   ├── logo.png                  image      (0-byte)  → import ${1:name}
│   ├── data.json                 data                 → import ${1:name}
│   ├── config.yaml               data                 → import ${1:name}
│   ├── config.yml                data                 → import ${1:name}
│   ├── clip.mp4                  video      (0-byte)  → import ${1:url}
│   ├── theme.mp3                 audio      (0-byte)  → import ${1:url}
│   ├── subs.vtt                  text-track           → import ${1:url}
│   ├── BaseButton.vue            framework (self)     → import ${1:name}  (asset-routed — §1.5 / §10.3)
│   ├── page.mdx                  REJECTED — script-category, not accepted (§1.13)
│   ├── Widget.svelte             REJECTED — other framework (§1.14)
│   ├── Layout.astro              REJECTED — other framework (§1.15)
│   ├── global.css                REJECTED — stylesheet (§1.16)
│   ├── theme.scss                REJECTED — stylesheet (§1.17)
│   ├── page.html                 REJECTED — html (§1.18)
│   ├── notes.md                  REJECTED — markdown (§1.19)
│   ├── font.woff2                REJECTED — font (0-byte) (§1.20)
│   ├── manual.pdf                REJECTED — document (0-byte) (§1.21)
│   ├── sample.tex                REJECTED — latex source (§1.22)
│   ├── refs.bib                  REJECTED — bibliography source (§1.23)
│   └── diagram.eps               REJECTED — eps / LaTeX vector graphics (§1.24)
└── destinations/                 Pre-filled .vue files for placement tests (undo after each paste)
    ├── setup-and-instance.vue    <script setup> + instance <script> — block-selection preference (§6.1)
    ├── with-imports.vue          <script setup> with two imports — Bottom/Top/Cursor (§6.2.1, 6.3.1, 6.4)
    ├── instance-only.vue         instance <script> only — empty-block + instance-selected (§6.2.2–3)
    ├── with-require.vue          <script> with require() — IMPORT_INDICATORS marker (§6.2.4, 10.1)
    ├── comment-cursor.vue        <script setup> + /* */ block — cursor comment adjust (§6.4.3, 9.6)
    ├── template-only.vue         NO <script> — create-if-missing wrapper (§6.5, 9.10)
    ├── indented-imports.vue      2-space-indented import — detected indentation (§6.6)
    └── string-literal.vue        "import" inside a string literal (§10.2)
```

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Script sources to copy/drag FROM + the primary paste/drop destination (`App.vue`). **All four** script exts route to the TypeScript arm: `model.ts`/`Widget.tsx` (`.ts`/`.tsx`) **and** `helper.js`/`Card.jsx` (`.js`/`.jsx`) all render the TS named shape — there is **no** JS arm for `.vue`. `components/Widget.tsx` is the nested §7.2 source. `.vue` has Angular-only smart-id, so `src/angular/` (suffix → PascalCase, fires for all four exts) and `src/classes/` (the no-fill counter-case) exist. |
| `assets/` | Non-script sources. **`.vue` is allow-list**, so this dir holds **both** the *accepted* non-script sources (each a fixed shape) **and** the *gated-out reject* fixtures (`page.mdx`, `Widget.svelte`, `Layout.astro`, `global.css`, `theme.scss`, `page.html`, `notes.md`, `font.woff2`, `manual.pdf`, `sample.tex`, `refs.bib`, `diagram.eps`). `vue.md` co-locates the rejects here, so there is **no `rejected/` dir** (the divergence from `javascript/`/`css/`/`scss/`/`html/`/`markdown/`). |
| `destinations/` | Pre-filled `.vue` files for SFC `<script>`-block placement tests. Each has specific content (script blocks, imports, comments) that the checklist expects, with exact insertion line numbers. **Undo after each paste** so the file returns to its expected state. |

## Fixture content expectations

- **`src/angular/*`** — content **matters**: these files must **NOT** contain `export class`. They exercise the Angular-suffix path (style-0 `generateAngularLegacyImportName`), which derives the identifier from the **filename suffix**, not the file body. Each carries a non-class `export const …`. `widget.component.js` is the `.js`-source case (Angular suffix on a `.js` source → **still** PascalCase, because all four script exts route to the TS builder — the `.vue` ≠ `.tsx`/`.mdx` distinction, §5.8). `2fa.service.ts` derives an illegal identifier (leading digit) → bare `$1` (§5.10).
- **`src/classes/event-bus.ts`** — content **matters**: it must contain `export class EventBus`. This proves the `.vue` builder **never** calls `readExportedClassName` — the import is still a bare `$1`, the signature `.vue` ≠ `.ts` case (§5.7). The builder is invoked one-arg (no `detectedImportName`), so no exported-class fill ever happens.
- **Other `src/*`** — content is irrelevant. The TS arm emits a bare `$1` for any non-Angular source regardless of bytes; these are minimal valid stubs.
- **`assets/*`** — content is irrelevant; the import shape (or the reject) keys on the file **extension**, not the bytes. Binary-type files (`logo.png`, `clip.mp4`, `theme.mp3`, `font.woff2`, `manual.pdf`) are empty placeholders; the text assets carry a one-line stub for readability only. `BaseButton.vue` is a `.vue` source that is **asset-routed** (named-default `${1:name}`), not script-routed — the `.vue`→`.vue` quirk (§10.3).
- **`destinations/*`** — content matters and is **byte-verbatim from `vue.md`** (§6 + §10). The checklist specifies exact file contents and expected insertion line numbers; do not change these files without updating the checklist. The `import { Header } from '../src/Header';` / `Footer` lines are inert textual scan-bait for the Bottom-placement scan — they need not resolve, so there is **no** `src/Header.*` or `src/Footer.*`.
