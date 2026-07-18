# qa/workspace/jsx/CLAUDE.md

Fixtures for `checklists/jsx.md` — the `.jsx` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `jsx.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `jsx.md`.

## Layout

```
jsx/
├── src/                          Script sources + the .jsx paste/drop destination (copy/drag FROM these)
│   ├── App.jsx                   Primary .jsx script source → `import $1 from './App';`
│   ├── Panel.jsx                 Primary paste/drop DESTINATION (open this; paste/drop into it)
│   ├── helper.js                 Script .js source (§1.2)
│   ├── components/
│   │   └── Card.jsx              Nested source — §7.2 basename-vs-full-path
│   ├── model.ts                  .ts source → empty snippet (not-supported)
│   └── Widget.tsx                .tsx source → empty snippet (not-supported)
├── assets/                       Non-script sources — gating-accepted; most get a fixed shape, but .tex/.bib/.eps empty-snippet (no asset-switch case)
│   ├── logo.png                  image      (empty placeholder) → import ${1:name}
│   ├── manual.pdf                document   (empty placeholder) → import ${1:name}
│   ├── Hero.vue                  framework            → import ${1:name}
│   ├── page.html                 html                 → import ${1:name}
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
└── destinations/                 Pre-filled .jsx files for placement tests (undo after each paste)
    ├── empty.jsx                 0 bytes
    ├── with-imports.jsx          Two import lines + code
    ├── with-require.jsx          const fs = require('fs')
    ├── commented-imports.jsx     Commented import + real import
    ├── comments-only.jsx         Only comment lines
    ├── multiline-comment.jsx     Import + /* block comment */ + code
    ├── comment-group.jsx         Three consecutive // comment lines
    ├── single-comment.jsx        Single isolated // comment line
    ├── leading-star.jsx          JSDoc block whose 2nd body line begins `*` (NOT Markdown — §6.3.8 / §10.4)
    ├── string-with-import.jsx    "import" inside a string literal
    └── mixed-imports.jsx         import + require mixed
```

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Script sources to copy/drag FROM (`App.jsx`, `helper.js`, nested `components/Card.jsx`) plus the primary paste/drop destination (`Panel.jsx`), plus the two `.ts`/`.tsx` sources (`model.ts`, `Widget.tsx`) that exercise the empty-snippet case. `.jsx` has no smart-identifier detection, so — unlike `typescript/` — there are no `classes/` or `angular/` subtrees. |
| `assets/` | One non-script source per `SOURCE_UNIVERSE` category (image, document, framework, html, markdown, data, CSS-module, stylesheet, font, video, audio, text-track, **latex**). **`.jsx` is accept-all** (gating accepts every source), so each is gating-accepted — most get a fixed shape, but `.tex`/`.bib`/`.eps` have no asset-switch case → empty snippet (the same path as `src/`'s `.ts`/`.tsx`). There is **no `rejected/` dir** (the structural difference from `javascript/`). |
| `destinations/` | Pre-filled `.jsx` files for placement tests. Each has specific content (imports, comments, code) that the checklist expects, with exact insertion line numbers. **Undo after each paste** so the file returns to its expected state. |

## Fixture content expectations

- **`src/*`** — content is irrelevant. `.jsx` has no smart-identifier detection, so the inserted tab stop is always a bare `$1`; no `export class` or Angular naming is needed (or honored). `model.ts` / `Widget.tsx` only need to *exist* with their extension — they route to the empty snippet regardless of bytes.
- **`assets/*`** — content is irrelevant; the import shape keys on the file **extension**, not the bytes. Binary-type files (`.png`, `.pdf`, `.woff2`, `.mp4`, `.mp3`) are empty placeholders; the text assets carry a one-line stub for readability only.
- **`destinations/*.jsx`** — content matters and is **byte-verbatim from `jsx.md`** (§6 + §10). The checklist specifies exact file contents and expected insertion line numbers; do not change these files without updating the checklist. Their `import { Header } from '../src/Header';` / `Footer` lines are inert textual scan-bait for the Bottom-placement scan — they need not resolve, so there is no `src/Header.jsx` or `src/Footer.jsx`.
