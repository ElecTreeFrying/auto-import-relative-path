# qa/workspace/markdown/CLAUDE.md

Fixtures for `checklists/markdown.md` — the `.md` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `markdown.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `markdown.md`.

## Layout

```
markdown/
├── notes.md                      Primary target — §2 paste, §3 Alt+D, §4 styles, §7 picker, §8 set-default, §9a drop
├── src/                          Import sources — one per source-type branch
│   ├── docs/intro.md             markdown (.md)   → fixed [${1:text}](./src/docs/intro.md) link
│   └── images/logo.png           image (.png)     → ![${1:alt-text}](…)   (empty placeholder)
├── destinations/                 Pre-filled placement targets (undo after each paste; paths resolve as ../src/…)
│   ├── blank.md                  Empty line 2 — placement setting-ignored test (§6, §9c-i)
│   ├── indented.md               Line 2 = exactly six spaces — column-follows-cursor test at col 6 (§6, §9c-ii)
│   ├── with-comments.md          markdown `*` bullet vs `//` / `/*` runs (§6, §9c-iii, §10)
│   └── with-comments.tsx         §10 contrast — byte-identical to with-comments.md, `.tsx` ext
└── rejected/                     One source per rejected category (no `.md` — own ext accepted)
    ├── widget.ts   App.vue    theme.css   page.html   captions.vtt
    ├── data.json   intro.mp4  theme.mp3   font.woff2  doc.pdf
    └── sample.tex  refs.bib   diagram.eps
```

## Subdirectories

| Location | Purpose |
|----------|---------|
| root | `notes.md` — the primary paste/drop/picker/set-default/DnD target. Sits at the root so its §2 happy-path inserts read `./src/…`. Holds a `<!-- paste / drop on the empty line below -->` marker above an empty target line; **undo after each paste** so the buffer returns to its expected state. |
| `src/docs/` | `intro.md` — the markdown source (`.md` → fixed `[text](…)` link). Single-variant, so Pick Style silent-inserts and Set Default returns the `.md → .md` fixed-style message (`no-configurable-style`). |
| `src/images/` | `logo.png` — the image source (→ `![alt-text](…)`). The single most-referenced source: it also drives placement (§6), edge cases (§10), and drop (§9). Empty placeholder — `.md` keys on the `.png` extension, not bytes. |
| `destinations/` | Pre-filled `.md` (+ one `.tsx`) placement targets, one level deep (so paste inserts resolve as `../src/…`). `blank.md` (empty line 2), `indented.md` (line 2 = **exactly six spaces** — the column-follows-cursor test), `with-comments.md` (markdown `*` bullets vs `//` / `/*` runs), `with-comments.tsx` (**byte-identical** to `with-comments.md` — the §10 `isMarkdown` contrast). **Undo after each paste.** |
| `rejected/` | One source per rejected extension for allow-list gating. Content is irrelevant — only the extension matters. **No `.md` stub** — `.md` accepts its own extension (there is no `.md`→`.md` rejection, unlike `.html`). |

## Fixture content expectations

- **Source files (`src/docs/intro.md`)** — content is cosmetic (any valid Markdown); it is imported, never edited by a test. The snippet depends only on the path + extension. `.md` **always keeps the full extension** (`[text](./src/docs/intro.md)`) — no preserve toggle applies.
- **`notes.md`** — the primary target. Keep the empty paste-target line below the `<!-- … -->` comment intact; the tester places the cursor there. Pasting then undoing is the normal cycle.
- **`src/images/logo.png`, `rejected/intro.mp4`, `rejected/theme.mp3`, `rejected/font.woff2`, `rejected/doc.pdf`** — empty 0-byte placeholders. `.md` keys on the extension (`.png`/`.mp4`/`.mp3`/`.woff2`/`.pdf`), not the bytes; gating and the generated snippet are identical regardless of content.
- **`destinations/*` targets** — content matters and is whitespace-sensitive. `indented.md` line 2 **must stay exactly six spaces** (the §6 column-6 / §9 c-ii assertions fail otherwise); `with-comments.md` must keep the contiguous `*` bullet run (lines 3–5), `//` run (lines 7–8), and `/*` run (lines 10–11) — they exercise the markdown-star quirk in §6/§10; `with-comments.tsx` must stay **byte-identical** to `with-comments.md` (the §10 contrast — do **not** make it valid TSX). `blank.md` keeps one empty line 2. Do not reformat them without updating the checklist.
- **`rejected/*`** — content is irrelevant; only the extension matters for gating. `intro.mp4`/`theme.mp3`/`font.woff2`/`doc.pdf` are empty 0-byte placeholders; the text stubs (`widget.ts`, `App.vue`, `theme.css`, `page.html`, `captions.vtt`, `data.json`, `sample.tex`, `refs.bib`) hold a one-line body; `diagram.eps` carries the two-line EPS form — the mandatory `%!PS-Adobe-3.0 EPSF-3.0` magic line plus a one-line `%` comment.
