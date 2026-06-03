# qa.new/workspace/mdx/

Fixtures for the MDX destination checklist ([`checklists/mdx.md`](../../checklists/mdx.md)).

`.mdx` shares the **exact same builder** as [`tsx/`](../tsx/) — `dispatch.ts` routes both `.tsx` and `.mdx` to
`tsx.ts:buildSnippet` — so every **import shape** is byte-identical to `.tsx`: a `.ts`/`.tsx` source renders via the
TS `primarySnippet`, a `.js`/`.jsx` source via the JS `fallbackSnippet`, and a non-script source via a fixed asset
shape. Because of that fallback, **every gated-in source renders a non-empty import** — there is **no
empty-snippet case** and **no raw-text-fallback drop**. `.mdx ∈ CROSS_IMPORT_DESTINATIONS` → **accept-all**, so
non-script sources live in **`assets/`** (each *accepted* with a fixed shape) and there is **no `rejected/` dir**.

The **one** `.mdx` ≠ `.tsx` divergence is the **markdown-star Cursor quirk**: `isMarkdownDestination('.mdx')` is
`true`, so a Cursor insertion on a leading-`*` line lands **AT** that line in `.mdx` (the `*` is Markdown content)
but is pushed **ABOVE** it in the byte-identical `.tsx` buffer. The `destinations/leading-star.mdx` (native) +
`destinations/leading-star.tsx` (cross) pair — kept **byte-identical** — is the proof (§6.3.8, §10.1).

Like `.tsx`, `.mdx` has **Angular-only** smart identifiers (style 0; `generateAngularLegacyImportName` fires, but
`readExportedClassName` is never called → **no exported-class fill**). That is why **`src/angular/`** (suffix →
PascalCase, no `export class`) and **`src/classes/event-bus.ts`** (the no-fill counter-case, which *does* contain
`export class`) exist. Every fixture below is referenced by `mdx.md`, so the directory is checklist↔workspace 1:1
with no orphans.

## Layout

```
mdx/
├── src/                          Script sources + the .mdx paste/drop destination (copy/drag FROM these)
│   ├── Page.mdx                  Primary paste/drop DESTINATION (open this; paste/drop into it)
│   ├── Widget.tsx                .tsx source, no Angular suffix → TS primary `import { $1 } from './Widget';`
│   ├── model.ts                  .ts source → TS primary
│   ├── helper.js                 .js source → JS fallback `import $1 from './helper';`
│   ├── Card.jsx                  .jsx source → JS fallback
│   ├── components/
│   │   └── Card.tsx              Nested source — §7.3 basename-vs-full-path
│   ├── angular/                  Angular-suffix .ts sources (NO `export class`) → style-0 PascalCase
│   │   ├── user.component.ts      → UserComponent
│   │   ├── highlight.directive.ts → HighlightDirective
│   │   ├── trim.pipe.ts           → TrimPipe
│   │   ├── user.service.ts        → UserService
│   │   ├── auth.module.ts         → AuthModule
│   │   └── widget.component.js     Angular suffix on a .js source → JS fallback, NO PascalCase (§5.8)
│   └── classes/
│       └── event-bus.ts          `export class EventBus` — the no-exported-class-fill counter-case (§5.7)
├── assets/                       Non-script sources — every one ACCEPTED with a fixed shape (accept-all)
│   ├── logo.png                  image      (empty placeholder) → import ${1:name}
│   ├── manual.pdf                document   (empty placeholder) → import ${1:name}
│   ├── Hero.vue                  framework            → import ${1:name}
│   ├── page.html                 html                 → import ${1:name}
│   ├── page.mdx                  script-category .mdx → asset (not primary/fallback) → import ${1:name}
│   ├── notes.md                  markdown             → import ${1:name}
│   ├── data.json                 data                 → import ${1:name}
│   ├── config.yaml               data                 → import ${1:name}
│   ├── styles.module.css         CSS module           → import ${1:styles}  (checked FIRST)
│   ├── global.css                stylesheet           → side-effect import (no tab stop)
│   ├── font.woff2                font       (empty placeholder) → side-effect import (no tab stop)
│   ├── clip.mp4                  video      (empty placeholder) → import ${1:url}
│   ├── theme.mp3                 audio      (empty placeholder) → import ${1:url}
│   └── subs.vtt                  text-track           → import ${1:url}
└── destinations/                 Pre-filled .mdx files for placement tests (undo after each paste)
    ├── empty.mdx                 0 bytes
    ├── with-imports.mdx          Two import lines + `# Page` (Markdown body)
    ├── with-require.mdx          const fs = require('fs')
    ├── commented-imports.mdx     Commented import + real import
    ├── comments-only.mdx         Only comment lines
    ├── multiline-comment.mdx     Import + /* block comment */ + `# Page`
    ├── comment-group.mdx         Three consecutive // comment lines
    ├── single-comment.mdx        Single isolated // comment line
    ├── leading-star.mdx          JSDoc block whose 2nd body line begins `*` — IS Markdown content (§6.3.8 / §10.1)
    ├── leading-star.tsx          Byte-identical to leading-star.mdx — the .mdx ≠ .tsx proof (§10.1)
    ├── string-with-import.mdx    "import" inside a string literal
    └── mixed-imports.mdx         import + require mixed
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/Page.mdx` | 1–10 | Primary paste/drop **destination** (the open editor) |
| `src/Widget.tsx` | 1.2, 2.1, 3, 4A, 4D.1, 5.6, 7.1, 8.1, 9.1, 9.4–9.5, 9.9 | Plain `.tsx` source → TS primary; bare `$1` (no Angular, no class) |
| `src/model.ts` | 1.1 | `.ts` source → TS primary named shape |
| `src/helper.js` | 1.3, 2.2, 4B, 4D.2, 7.2, 8.2, 9.2 | `.js` source → JS **fallback** default-import shape |
| `src/Card.jsx` | 1.4, 10.4 | `.jsx` source → JS fallback (the running primary-vs-fallback contrast) |
| `src/components/Card.tsx` | 7.3 | Nested source — picker label = basename, inserted = full path |
| `src/angular/user.component.ts` | 5.1, 5.9, 7.4, 9.8 | `.component` suffix → `UserComponent` (no `export class`) |
| `src/angular/highlight.directive.ts` | 5.2 | `.directive` suffix → `HighlightDirective` |
| `src/angular/trim.pipe.ts` | 5.3 | `.pipe` suffix → `TrimPipe` |
| `src/angular/user.service.ts` | 5.4 | `.service` suffix → `UserService` |
| `src/angular/auth.module.ts` | 5.5 | `.module` suffix → `AuthModule` |
| `src/angular/widget.component.js` | 5.8 | Angular suffix on a `.js` source → JS fallback, **NO** PascalCase |
| `src/classes/event-bus.ts` | 5.7 | `export class EventBus` → still bare `$1` (`.mdx` never reads classes) |
| `assets/logo.png` | 1.9, 2.3, 4C, 4C.2, 7.5, 8.4, 9.3, 9.9 | Image — `${1:name}` (the primary asset across the checklist) |
| `assets/styles.module.css` | 1.13, 4C, 4C.1 | CSS module — `${1:styles}` (the `.module.*` check beats side-effect) |
| `assets/global.css` | 1.14, 4C.1 | Plain stylesheet — side-effect `import '…';` (no tab stop) |
| `assets/font.woff2` | 1.15, 4C | Font — side-effect import (empty placeholder) |
| `assets/clip.mp4` | 1.16, 4C | Video — `${1:url}` (empty placeholder) |
| `assets/theme.mp3` | 1.17 | Audio — `${1:url}` (empty placeholder) |
| `assets/subs.vtt` | 1.18 | Text-track — `${1:url}` |
| `assets/page.mdx` | 1.5 | Script-category `.mdx` → **asset** (not in primary/fallback set) — `${1:name}` |
| `assets/Hero.vue` | 1.6 | Framework — `${1:name}` |
| `assets/page.html` | 1.7 | HTML — `${1:name}` |
| `assets/notes.md` | 1.8 | Markdown — `${1:name}` |
| `assets/data.json` | 1.10 | Data — `${1:name}` |
| `assets/config.yaml` | 1.11 | Data — `${1:name}` |
| `assets/manual.pdf` | 1.12 | Document — `${1:name}` (empty placeholder) |
| `destinations/empty.mdx` | 6.1.1, 6.2.2 | Empty file — Bottom/Top fall back to line 0 |
| `destinations/with-imports.mdx` | 6.1.2, 6.2.1, 6.3.1, 6.3.2, 6.3.5, 9.4, 9.5 | Two imports + `# Page` — placement tests |
| `destinations/with-require.mdx` | 6.1.3 | `require()` — Bottom detects as import marker |
| `destinations/commented-imports.mdx` | 6.1.4 | Comment skipping — Bottom ignores commented import |
| `destinations/comments-only.mdx` | 6.1.5 | Only comments — Bottom falls back to line 0 |
| `destinations/multiline-comment.mdx` | 6.3.3, 9.6.2 | Cursor inside `/* */` block — `/*`/`*/` adjust above; the `*` body line lands **AT** (markdown-star) |
| `destinations/comment-group.mdx` | 6.3.4 | Cursor on `//` line — adjusts above group |
| `destinations/single-comment.mdx` | 6.3.7, 9.6.1 | Single isolated `//` — no block adjustment |
| `destinations/leading-star.mdx` | 6.3.8, 10.1 | Leading-`*` line **IS** Markdown content (lands AT) — the markdown-star quirk |
| `destinations/leading-star.tsx` | 10.1 | Byte-identical to `leading-star.mdx` — the `.mdx` ≠ `.tsx` proof (in `.tsx` the `*` is a comment → adjusts above) |
| `destinations/string-with-import.mdx` | 10.2 | `import` inside string literal — known heuristic |
| `destinations/mixed-imports.mdx` | 10.3 | `import` + `require` mixed — Bottom finds last |

## File count

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/` | 13 | Script sources (TS-primary + JS-fallback) + nested source + `angular/` (6) + `classes/` (1) + primary destination |
| `assets/` | 14 | One non-script source per category — all accepted, fixed shapes |
| `destinations/` | 12 | Pre-filled placement-test destinations (incl. `leading-star.tsx` for the `.mdx` ≠ `.tsx` proof) |
| **Total** | **39** |
