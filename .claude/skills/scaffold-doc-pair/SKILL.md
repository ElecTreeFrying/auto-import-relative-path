---
name: scaffold-doc-pair
version: 1.0.0
description: Use when adding a new directory under src/ that needs its README.md + CLAUDE.md documentation pair. Generates both files from the project's canonical doc-pair shape, pre-filled from the directory's actual .ts files and exported symbols, then proposes the registration-table edits in root CLAUDE.md, src/README.md, and src/CLAUDE.md. Refuses the src/ root and src/test/ pairs (documented exceptions) and never overwrites an existing pair. Triggers - "scaffold docs for src/<dir>", "new src directory needs its README/CLAUDE pair", "add a doc pair for src/foo".
---

# Scaffold Doc Pair

Generate a `README.md` + `CLAUDE.md` pair for a **new** `src/<dir>/` from the project's one canonical
shape, pre-filled from the directory's real files, then register the directory in the project's index
tables. **Core principle:** the pair has a fixed skeleton; only the prose is per-directory. This skill
fills the skeleton mechanically so every new directory matches the existing nine.

## When to use

- A new directory was just added under `src/` (e.g. `src/foo/`) and has no docs yet.
- You're about to hand-write a `README.md`/`CLAUDE.md` for a `src/` directory — use this instead so
  the shape can't drift.

**When NOT to use (refuse these):**
- `src/` itself — the root pair is an *index* over the children, not a leaf module (different shape).
- `src/test/` or any `src/test/**` — the test pair documents a *runner*, not source modules.
- Any directory that **already has** a `README.md` or `CLAUDE.md` — never clobber existing docs.

## The one shape (background)

Every leaf directory under `src/` carries a pair with a fixed role split:
- **`README.md`** — navigation / onboarding: a one-line purpose, a `## Files` table, optional topic
  sections, a `## Where to add new code` section, and a trailing pointer to `CLAUDE.md`.
- **`CLAUDE.md`** — invariants / gotchas: a one-line purpose+invariant, a `## Files` bullet list,
  per-file/per-topic deep-dives, and an `## Adding a new <thing>` checklist.

`src/` (index) and `src/test/` (runner) deliberately break this — they are the two documented
exceptions and this skill refuses to scaffold them.

## Hard constraints (always enforced)

1. **No clobber.** If `README.md` or `CLAUDE.md` already exists in the target, stop. Don't overwrite,
   don't "merge", don't rename the existing file.
2. **No source edits.** Files under `src/` are read **only** to extract export signatures for the
   tables. No `.ts` file is ever modified.
3. **Refuse the exceptions.** `src/`, `src/test/`, `src/test/**` are never scaffolded.
4. **Reversible.** Both generated files and any registration edits land in the working tree only —
   everything is visible in `git diff` and revertible with `git checkout`.
5. **Idempotent.** Re-running against a directory that already has a pair is a no-op (per #1).

## Workflow

### 1. Validate the target directory

Take the target path (e.g. `src/foo`). Run the guard snippet; abort on any `REFUSE`.

```bash
DIR="${1%/}"   # target dir, trailing slash stripped, e.g. src/foo

case "$DIR" in
  src|src/|src/test|src/test/*)
    echo "REFUSE: $DIR is a documented exception (index/runner) — not scaffolded."; exit 1;;
  src/*) : ;;   # ok: a leaf dir under src/
  *) echo "REFUSE: $DIR is not under src/."; exit 1;;
esac

if [ -f "$DIR/README.md" ] || [ -f "$DIR/CLAUDE.md" ]; then
  echo "REFUSE: a doc pair already exists in $DIR (no clobber)."; exit 1
fi
echo "OK: $DIR is a scaffoldable leaf directory."
```

### 2. Pre-flight git check

```bash
git status --porcelain
```

- **Clean** → continue.
- **Dirty** → pause and ask: **stop** (default — let the user commit/stash first, so the scaffold
  doesn't get mixed into unrelated staged work) vs **proceed anyway**. This mirrors the sibling `qa-doc-sync`
  skill and avoids the mixed-staging trap.

### 3. Discover files + exports

```bash
DIR="${1%/}"
for f in "$DIR"/*.ts; do
  [ -f "$f" ] || continue
  case "$f" in *.test.ts) continue;; esac          # exclude tests
  echo "== ${f##*/} =="
  grep -nE '^export (async )?(function|const|class|type|interface|default|abstract)' "$f" || echo "  (no top-level exports found)"
done
```

Note `_`-prefixed files (`_foo.ts`) — they are **directory-internal** modules; say so in their row.
Use the grep output to fill the symbol column (README) and the file bullets (CLAUDE).

### 4. Generate both files from the templates

Fill the templates in **Canonical templates** below:
- Title + `src/<dir>/` — mechanical.
- `## Files` rows — one per discovered `.ts`, with the detected symbol(s).
- Everything that needs judgment — the one-line purpose, the invariant deep-dives, the
  `## Adding a new X` steps, and **which symbol-column header** to use — left as an explicit
  `<TODO: …>` slot for the user to fill. Don't invent invariants you can't see in the code.

### 5. Checkpoint

Print **both** generated files in full. Get explicit approval before writing anything.

### 6. Write the pair

Write `README.md` and `CLAUDE.md` into the target directory.

### 7. Register the new directory

A new `src/` directory must be wired into the project's index tables, or it's invisible to the docs.
Propose concrete edits for each site below; **apply the mechanical rows on approval**, and for the
**judgment** rows (dependency direction, architecture tree) propose a value and confirm it — the
layer a directory belongs to is a design decision, not a lookup.

| Site | Section | Edit | Kind |
|------|---------|------|------|
| `/CLAUDE.md` (root) | `## Subdirectory guides` table | add a `Directory \| Scope \| Guides` row | mechanical |
| `/CLAUDE.md` (root) | `## Architecture` tree + "Allowed dependency direction" | add the dir + its allowed imports | judgment |
| `src/README.md` | `## Layout` table | add a `Path \| Purpose` row | mechanical |
| `src/README.md` | `## Where to add new code` table | add a row if the dir introduces a new "what" | judgment |
| `src/CLAUDE.md` | `## Layered architecture` tree + "Allowed dependency direction" list | add the dir + its allowed imports | judgment |
| `src/CLAUDE.md` | `## Per-directory invariants` table | add a `Directory \| What it owns \| Key invariant` row | judgment |

### 8. Done

Print `git status --porcelain` so the user sees exactly the new + modified files. Remind them
everything is in `git diff` and revertible. Do **not** auto-commit (the maintainer commits docs).

## Canonical templates

Copy these verbatim, then fill the `<…>` slots. Keep the section skeleton; specialize only the prose.

**`README.md`**

```
# src/<dir>/

<One sentence: what this directory owns.>

## Files

| File | <symbol column — choose one: Export | Public function | Public type | Key exports | or omit> | Purpose |
|------|----------------------------------------------------------------------------------------------|---------|
| `<file>.ts` | `<exportedSymbol>` | <What it does — one line.> |

## Where to add new code

- <When code belongs here vs. a sibling directory.> Defer the deep rules to CLAUDE.md.

See [`CLAUDE.md`](CLAUDE.md) (this directory) for <the invariants / gotchas this directory owns>.
```

**`CLAUDE.md`**

```
# src/<dir>/CLAUDE.md

<One sentence: purpose + the single headline invariant of this directory.>

## Files

- `<file>.ts` — <exported symbol / role>

## <Per-file or per-topic invariant deep-dive>

<The non-obvious rules: sync contracts, ordering, error semantics, "don't do X". One H2 per topic.>

## Adding a new <thing this directory contains>

1. <ordered step; cite any cross-site sync rule by relative path, e.g. ../types/CLAUDE.md>
```

> Single-file directories: keep the section header `## Files` (plural) even with one entry — that's
> the canonical form across the tree (e.g. `src/config/`, `src/constants/`).

## Verification (for editing this skill)

This skill is authored under `writing-skills` (TDD-for-skills). After any change, re-verify:
1. **Dry-run** in a throwaway git worktree against a scratch dir (`src/__scratch__/` with a couple of
   dummy `.ts` files); diff the generated pair against a real leaf pair (e.g. `src/path/`) for
   skeleton parity; discard the worktree.
2. **Guards:** confirm it refuses `src/`, `src/test/`, `src/test/sub`, and a dir that already has a
   pair; confirm step 7 proposes correct rows for all three sites.

## Common mistakes

- **Inventing invariants.** If you can't see the rule in the code, leave a `<TODO>` — don't fabricate
  a sync contract. The deep-dive sections are the maintainer's to fill.
- **Skipping registration.** A pair with no row in the three index tables is orphaned; the docs won't
  point to it. Step 7 is not optional.
- **Flattening semantic section names.** `## Adding a new command` / `## Where to add new code` are
  the same slot with a dir-appropriate name — keep the slot, pick the fitting name; don't force a
  single generic header.
- **Scaffolding an exception.** `src/` and `src/test/` are intentionally different. Refuse them.

## Future use

Invoke via Claude Code (`/scaffold-doc-pair` or "scaffold docs for src/<dir>") whenever a new `src/`
directory needs its pair. Project-local; lives in `.claude/skills/` and is tracked with the repo. To use on
another VS Code extension with the same convention, copy the folder.

## Changelog

### 1.0.0
- Initial: validate + refuse-list, pre-flight git check, file/export discovery, template generation,
  checkpoint, write, and three-site registration. Templates inline; light safety (no audit log).
