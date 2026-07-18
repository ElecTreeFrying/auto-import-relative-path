# qa/workspace/tsx/CLAUDE.md

Fixtures for `checklists/tsx.md` — the `.tsx` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `tsx.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `tsx.md`.

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

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Script sources to copy/drag FROM + the primary paste/drop destination (`Panel.tsx`). `Widget.tsx`/`model.ts` are `.ts`/`.tsx` sources → the TS **primary** arm; `helper.js`/`Card.jsx` are `.js`/`.jsx` sources → the JS **fallback** arm; `components/Card.tsx` is the nested §7.3 source. Unlike `jsx/`, `.tsx` has Angular-only smart-id, so `src/angular/` (suffix → PascalCase) and `src/classes/` (the no-fill counter-case) **do** exist here. |
| `assets/` | One non-script source per `SOURCE_UNIVERSE` category (image, document, framework, html, `.mdx`, markdown, data, CSS-module, stylesheet, font, video, audio, text-track, **latex**). **`.tsx` is accept-all** (gating accepts every source), so each is gating-accepted — most get a fixed shape, but `.tex`/`.bib`/`.eps` have no asset-switch case → empty snippet (the same empty-snippet path as `.jsx`'s `.ts`/`.tsx`). There is **no `rejected/` dir**. |
| `destinations/` | Pre-filled `.tsx` (+ one `.mdx`) files for placement tests. Each has specific content (imports, comments, code) that the checklist expects, with exact insertion line numbers. **Undo after each paste** so the file returns to its expected state. |

## Fixture content expectations

- **`src/angular/*`** — content **matters**: these files must **NOT** contain `export class`. They exercise the Angular-suffix path (style-0 `generateAngularLegacyImportName`), which derives the identifier from the **filename suffix**, not the file body. Each carries a non-class `export const …`. `widget.component.js` is the `.js`-source counter-case (Angular suffix, but JS-fallback → no PascalCase).
- **`src/classes/event-bus.ts`** — content **matters**: it must contain `export class EventBus`. This proves the `.tsx` builder **never** calls `readExportedClassName` — the import is still a bare `$1`, the signature `.tsx` ≠ `.ts` case (§5.7). Mirrors the `workspace/typescript/src/classes/` precedent.
- **Other `src/*`** — content is irrelevant. The TS-primary / JS-fallback arms emit a bare `$1` for any non-Angular source regardless of bytes; these are minimal valid stubs.
- **`assets/*`** — content is irrelevant; the import shape keys on the file **extension**, not the bytes. Binary-type files (`logo.png`, `manual.pdf`, `font.woff2`, `clip.mp4`, `theme.mp3`) are empty placeholders; the text assets carry a one-line stub for readability only.
- **`destinations/*`** — content matters and is **byte-verbatim from `tsx.md`** (§6 + §10). The checklist specifies exact file contents and expected insertion line numbers; do not change these files without updating the checklist. `leading-star.mdx` is **byte-identical** to `leading-star.tsx` — the only-difference-is-`isMarkdownDestination` proof (§10.1); keep them in lockstep. The `import { Header } from '../src/Header';` / `Footer` lines are inert textual scan-bait for the Bottom-placement scan — they need not resolve, so there is no `src/Header.tsx` or `src/Footer.tsx`.
