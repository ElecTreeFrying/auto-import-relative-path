# qa/workspace/CLAUDE.md

Fixture workspace for manual QA. Each subdirectory mirrors a checklist in `checklists/`.

## Sync rule

- **Workspace changes do NOT update checklists.** Fixtures can be added, renamed, or modified without touching any checklist file. The workspace can have extra files the checklist doesn't reference.
- **Checklist changes DO update the workspace.** When a checklist is edited to reference a new fixture, add that fixture here. The checklist is the source of truth for what must exist.

## Directory mapping

```
workspace/astro/        ←  checklists/astro.md
workspace/css/          ←  checklists/css.md
workspace/general/      ←  checklists/general.md
workspace/html/         ←  checklists/html.md
workspace/javascript/   ←  checklists/javascript.md
workspace/jsx/          ←  checklists/jsx.md
workspace/latex/        ←  checklists/latex.md
workspace/markdown/     ←  checklists/markdown.md
workspace/mdx/          ←  checklists/mdx.md
workspace/scss/         ←  checklists/scss.md
workspace/svelte/       ←  checklists/svelte.md
workspace/tsx/          ←  checklists/tsx.md
workspace/typescript/   ←  checklists/typescript.md
workspace/vue/          ←  checklists/vue.md
```

## Conventions

- Binary-type fixtures (`.png`, `.mp4`, `.woff2`, `.mp3`, `.pdf`, `.eps`) are empty (or near-empty stub) placeholder files. Only the file extension matters for gating tests — the bytes are never read. (Many `.eps`/`.tex`/`.bib` fixtures — the cross-language **reject** stubs and the accept-all jsx/tsx/mdx `assets/` empty-snippet stubs — carry a short self-documenting header naming the checklist case they exercise (`.tex`/`.bib` are a single line; each `.eps` adds a leading `%!PS-Adobe-3.0 EPSF-3.0` magic line, so it is two lines); the LaTeX-accepted graphics under `latex/src/figures/` are 0-byte placeholders like the rest.)
- Destination files used in placement tests have specific content the checklist depends on. Each language directory's `CLAUDE.md` documents the expected content.
- Each language directory has its own `CLAUDE.md` (layout tree, fixture purposes, edit rules).
