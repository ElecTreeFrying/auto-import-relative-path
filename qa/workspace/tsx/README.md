# qa/workspace/tsx/

Fixtures for the TSX destination checklist ([`checklists/tsx.md`](../../checklists/tsx.md)).

`.tsx` is a **React-family** destination that exercises
`_react.ts`'s **primary + fallback** dispatch: a `.ts`/`.tsx` source renders via the TS
`primarySnippet`, a `.js`/`.jsx` source via the JS `fallbackSnippet`, and a non-script source via a
fixed asset shape. Because of that fallback, **every gated-in source renders a non-empty import except
`.tex`/`.bib`/`.eps`** (no primary/fallback/asset case → `default: null` → empty snippet, like `.jsx`'s
`.ts`/`.tsx`). The `.tsx` ≠ `.jsx` contrast: `.tsx` renders every *script* source non-empty,
but both empty on `.tex`/`.bib`/`.eps`. `.tsx ∈ CROSS_IMPORT_DESTINATIONS` → **accept-all**, so — like jsx — non-script sources
live in **`assets/`** (most accepted with a fixed shape; `.tex`/`.bib`/`.eps` accepted but empty-snippet) and there is **no `rejected/` dir**.

Unlike jsx, `.tsx` has **Angular-only** smart identifiers (style 0; `generateAngularLegacyImportName`
fires, but `readExportedClassName` is never called → **no exported-class fill**). That adds two
subtrees jsx lacked: **`src/angular/`** (suffix → PascalCase, no `export class`) and
**`src/classes/event-bus.ts`** (the no-fill counter-case, which *does* contain `export class`).
Every fixture below is referenced by `tsx.md`, so the directory is checklist↔workspace 1:1 with no
orphans.

## Layout

```
tsx/
├── src/                          Script sources + the .tsx paste/drop destination (copy/drag FROM these)
│   ├── Panel.tsx                 Primary paste/drop DESTINATION (open this; paste/drop into it)
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
│   │   ├── 2fa.component.ts        Illegal derived id (leading digit) → bare $1 (§5.10)
│   │   └── widget.component.js     Angular suffix on a .js source → JS fallback, NO PascalCase (§5.8)
│   └── classes/
│       └── event-bus.ts          `export class EventBus` — the no-exported-class-fill counter-case (§5.7)
├── assets/                       Non-script sources — gating-accepted; most get a fixed shape, but .tex/.bib/.eps empty-snippet (no asset-switch case)
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
│   ├── subs.vtt                  text-track           → import ${1:url}
│   ├── sample.tex                latex source         → empty snippet (not-supported)
│   ├── refs.bib                  bibliography         → empty snippet (not-supported)
│   └── diagram.eps               eps graphics         → empty snippet (not-supported)
└── destinations/                 Pre-filled .tsx files for placement tests (undo after each paste)
    ├── empty.tsx                 0 bytes
    ├── with-imports.tsx          Two import lines + code
    ├── with-require.tsx          const fs = require('fs')
    ├── commented-imports.tsx     Commented import + real import
    ├── comments-only.tsx         Only comment lines
    ├── multiline-comment.tsx     Import + /* block comment */ + code
    ├── comment-group.tsx         Three consecutive // comment lines
    ├── single-comment.tsx        Single isolated // comment line
    ├── leading-star.tsx          JSDoc block whose 2nd body line begins `*` (NOT Markdown — §6.3.8 / §10.1)
    ├── leading-star.mdx          Byte-identical to leading-star.tsx — the .mdx ≠ .tsx proof (§10.1)
    ├── string-with-import.tsx    "import" inside a string literal
    └── mixed-imports.tsx         import + require mixed
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/Panel.tsx` | 1–10 | Primary paste/drop **destination** (the open editor) |
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
| `src/angular/2fa.component.ts` | 5.10 | Angular suffix, illegal derived id (leading digit) → bare `$1` |
| `src/angular/widget.component.js` | 5.8 | Angular suffix on a `.js` source → JS fallback, **NO** PascalCase |
| `src/classes/event-bus.ts` | 5.7 | `export class EventBus` → still bare `$1` (`.tsx` never reads classes) |
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
| `assets/sample.tex` | 1.19 | LaTeX source → empty snippet (not-supported) |
| `assets/refs.bib` | 1.20 | Bibliography → empty snippet (not-supported) |
| `assets/diagram.eps` | 1.21 | EPS graphics → empty snippet (not-supported) |
| `destinations/empty.tsx` | 6.1.1, 6.2.2 | Empty file — Bottom/Top fall back to line 1 |
| `destinations/with-imports.tsx` | 6.1.2, 6.2.1, 6.3.1, 6.3.2, 6.3.5, 9.4, 9.5 | Two imports + code — placement tests |
| `destinations/with-require.tsx` | 6.1.3 | `require()` — Bottom detects as import marker |
| `destinations/commented-imports.tsx` | 6.1.4 | Comment skipping — Bottom ignores commented import |
| `destinations/comments-only.tsx` | 6.1.5 | Only comments — Bottom falls back to line 1 |
| `destinations/multiline-comment.tsx` | 6.3.3, 9.6.2 | Cursor inside `/* */` block — adjusts above block |
| `destinations/comment-group.tsx` | 6.3.4 | Cursor on `//` line — adjusts above group |
| `destinations/single-comment.tsx` | 6.3.7, 9.6.1 | Single isolated `//` — no block adjustment |
| `destinations/leading-star.tsx` | 6.3.8, 10.1 | Leading-`*` line is a **comment** (NOT Markdown) — counter-case to `.md`/`.mdx` |
| `destinations/leading-star.mdx` | 10.1 | Byte-identical to `leading-star.tsx` — the `.mdx` ≠ `.tsx` proof |
| `destinations/string-with-import.tsx` | 10.2 | `import` inside string literal — NOT a Bottom marker (line-leading only) |
| `destinations/mixed-imports.tsx` | 10.3 | `import` + `require` mixed — Bottom finds last |