# qa/workspace/jsx/

Fixtures for the JSX destination checklist ([`checklists/jsx.md`](../../checklists/jsx.md)).

`.jsx` is a **React-family** (accept-all) destination (`.jsx ∈ CROSS_IMPORT_DESTINATIONS` → **accept-all**):
every source is accepted, so — unlike [`javascript/`](../javascript/), whose non-`.js` sources sit in a
`rejected/` dir — jsx's non-script sources live in **`assets/`** and are each *accepted* with a fixed
shape. There is therefore **no `rejected/` dir**. `.jsx` also has **no** smart-identifier behavior
(`smartId: none`), so script imports are always a bare `$1` — no `src/classes/` or `src/angular/`
subtree. Every fixture below is referenced by `jsx.md`, so the directory is checklist↔workspace 1:1
with no orphans.

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

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/App.jsx` | 1.1, 2.1, 3, 4A, 4D, 6, 7.1, 8.1, 9.1, 9.4–9.8 | Primary `.jsx` script source — happy path, every style + drift, `Alt+D`, placement, Pick/Set Default, DnD, preserve-ext |
| `src/Panel.jsx` | 1–10 | Primary paste/drop **destination** (the open editor) |
| `src/helper.js` | 1.2 | Script `.js` source — default-import shape |
| `src/components/Card.jsx` | 7.2 | Nested source — picker label = basename, inserted = full path |
| `src/model.ts` | 1.3, 4C, 7.4, 9.3, 10.1 | `.ts` source → empty snippet + `not-supported` toast |
| `src/Widget.tsx` | 1.4, 4C, 10.1 | `.tsx` source → empty snippet + `not-supported` toast |
| `assets/logo.png` | 1.8, 2.2, 4B, 4B.2, 7.3, 8.3, 9.2, 9.8 | Image — `${1:name}` shape (primary asset across the checklist) |
| `assets/styles.module.css` | 1.12, 4B, 4B.1 | CSS module — `${1:styles}` (the `.module.*` check beats side-effect) |
| `assets/global.css` | 1.13, 4B.1 | Plain stylesheet — side-effect `import '…';` (no tab stop) |
| `assets/font.woff2` | 1.14, 4B | Font — side-effect import (empty placeholder) |
| `assets/clip.mp4` | 1.15, 4B | Video — `${1:url}` (empty placeholder) |
| `assets/theme.mp3` | 1.16 | Audio — `${1:url}` (empty placeholder) |
| `assets/subs.vtt` | 1.17 | Text-track — `${1:url}` |
| `assets/Hero.vue` | 1.5 | Framework — `${1:name}` |
| `assets/page.html` | 1.6 | HTML — `${1:name}` |
| `assets/notes.md` | 1.7 | Markdown — `${1:name}` |
| `assets/data.json` | 1.9 | Data — `${1:name}` |
| `assets/config.yaml` | 1.10 | Data — `${1:name}` |
| `assets/manual.pdf` | 1.11 | Document — `${1:name}` (empty placeholder) |
| `assets/sample.tex` | 1.18 | LaTeX source → empty snippet (not-supported) |
| `assets/refs.bib` | 1.19 | Bibliography → empty snippet (not-supported) |
| `assets/diagram.eps` | 1.20 | EPS graphics → empty snippet (not-supported) |
| `destinations/empty.jsx` | 6.1.1, 6.2.2 | Empty file — Bottom/Top fall back to line 1 |
| `destinations/with-imports.jsx` | 6.1.2, 6.2.1, 6.3.1, 6.3.2, 6.3.5, 9.4, 9.5 | Two imports + code — placement tests |
| `destinations/with-require.jsx` | 6.1.3 | `require()` — Bottom detects as import marker |
| `destinations/commented-imports.jsx` | 6.1.4 | Comment skipping — Bottom ignores commented import |
| `destinations/comments-only.jsx` | 6.1.5 | Only comments — Bottom falls back to line 1 |
| `destinations/multiline-comment.jsx` | 6.3.3, 9.6.2 | Cursor inside `/* */` block — adjusts above block |
| `destinations/comment-group.jsx` | 6.3.4 | Cursor on `//` line — adjusts above group |
| `destinations/single-comment.jsx` | 6.3.7, 9.6.1 | Single isolated `//` — no block adjustment |
| `destinations/leading-star.jsx` | 6.3.8, 10.4 | Leading-`*` line is a **comment** (NOT Markdown) — counter-case to `.md`/`.mdx` |
| `destinations/string-with-import.jsx` | 10.2 | `import` inside string literal — NOT a Bottom marker (line-leading only) |
| `destinations/mixed-imports.jsx` | 10.3 | `import` + `require` mixed — Bottom finds last |