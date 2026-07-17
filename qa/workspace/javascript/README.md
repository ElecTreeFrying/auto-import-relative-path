# qa/workspace/javascript/

Fixtures for the JavaScript destination checklist ([`checklists/javascript.md`](../../checklists/javascript.md)).

`.js` has **no** smart-identifier behavior (`smartId: none`), so — unlike [`typescript/`](../typescript/) —
there is no `src/classes/` or `src/angular/` subtree. The unicode/space filename edge cases
and the no-extension `Makefile` case are owned by [`general.md`](../../checklists/general.md)
and are **not** duplicated here. Every fixture below is referenced by `javascript.md`, so the
directory is checklist↔workspace 1:1 with no orphans.

## Layout

```
javascript/
├── src/                        Source files (copy/drag FROM these)
│   ├── foo.js                  Plain source — no smart-id (inserted name is always a bare $1)
│   └── bar.js                  Primary paste/drop destination
├── destinations/               Pre-filled paste destinations (placement tests)
│   ├── empty.js                0 bytes
│   ├── whitespace-only.js      Blank lines only
│   ├── with-imports.js         Two import lines + code
│   ├── with-require.js         const fs = require('fs')
│   ├── commented-imports.js    Commented import + real import
│   ├── comments-only.js        Only comment lines
│   ├── multiline-comment.js    Import + /* block comment */ + code
│   ├── comment-group.js        Three consecutive // comment lines
│   ├── single-comment.js       Single isolated // comment line
│   ├── string-with-import.js   "import" inside a string literal
│   ├── mixed-imports.js        import + require mixed
│   └── large-file.js           520 lines — imports at top, padding below
└── rejected/                   Non-.js sources for gating rejection tests
    ├── helper.ts
    ├── widget.tsx
    ├── badge.jsx
    ├── page.mdx
    ├── global.css
    ├── main.scss
    ├── index.html
    ├── notes.md
    ├── logo.png                (empty placeholder)
    ├── icon.svg
    ├── config.json
    ├── config.yaml
    ├── font.woff2              (empty placeholder)
    ├── video.mp4               (empty placeholder)
    ├── audio.mp3               (empty placeholder)
    ├── subs.vtt
    ├── doc.pdf                 (empty placeholder)
    ├── App.vue
    ├── App.svelte
    ├── App.astro
    ├── sample.tex
    ├── refs.bib
    └── diagram.eps
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/foo.js` | 1.1, 2, 3, 4, 7, 8, 9.1, 9.3–9.7 | Plain `.js` source — happy-path paste, every style + drift, `Alt+D`, Pick/Set Default, DnD, preserve-ext |
| `src/bar.js` | 2, 3, 4, 7, 8, 9 | Primary paste/drop destination |
| `destinations/empty.js` | 6.1.1, 6.2.2, 10.1 | Empty file — Bottom/Top fall back to line 1 |
| `destinations/whitespace-only.js` | 10.2 | Blank lines only — no markers found |
| `destinations/with-imports.js` | 6.1.2, 6.2.1, 6.3.1, 6.3.2, 6.3.5, 9.3, 9.4 | Two imports + code — placement tests |
| `destinations/with-require.js` | 6.1.3 | `require()` — Bottom detects as import marker |
| `destinations/commented-imports.js` | 6.1.4 | Comment skipping — Bottom ignores commented import |
| `destinations/comments-only.js` | 6.1.5 | Only comments — Bottom falls back to line 1 |
| `destinations/multiline-comment.js` | 6.3.3, 9.5.2 | Cursor inside `/* */` block — adjusts above block |
| `destinations/comment-group.js` | 6.3.4 | Cursor on `//` line — adjusts above group |
| `destinations/single-comment.js` | 6.3.7, 9.5.1 | Single isolated `//` comment — no block adjustment |
| `destinations/string-with-import.js` | 10.4 | `import` inside string literal — NOT a Bottom marker (line-leading only) |
| `destinations/mixed-imports.js` | 10.5 | `import` + `require` mixed — Bottom finds last |
| `destinations/large-file.js` | 10.3 | 520 lines — Bottom still finds imports at top |
| `rejected/*` | 1.2–1.24, 9.2 | Every non-`.js` extension for gating rejection (`helper.ts` also covers the §9.2 `.ts`→`.js` drop reject) |