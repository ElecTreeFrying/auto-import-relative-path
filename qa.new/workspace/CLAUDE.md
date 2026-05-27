# qa.new/workspace/CLAUDE.md

Fixture workspace for manual QA. Each subdirectory mirrors a checklist in `checklists/`.

## Sync rule

- **Workspace changes do NOT update checklists.** Fixtures can be added, renamed, or modified without touching any checklist file. The workspace can have extra files the checklist doesn't reference.
- **Checklist changes DO update the workspace.** When a checklist is edited to reference a new fixture, add that fixture here. The checklist is the source of truth for what must exist.

## Directory mapping

```
workspace/general/      ←  checklists/general.md
workspace/typescript/   ←  checklists/typescript.md
```

## Conventions

- Binary-type fixtures (`.png`, `.mp4`, `.woff2`, `.mp3`, `.pdf`) are empty placeholder files. Only the file extension matters for gating tests.
- Destination files used in placement tests have specific content the checklist depends on. Their `README.md` documents the expected content.
- Each language directory has its own `CLAUDE.md` (edit rules) and `README.md` (file tree + fixture mapping).
