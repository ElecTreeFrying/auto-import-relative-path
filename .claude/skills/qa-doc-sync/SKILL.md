---
name: qa-doc-sync
version: 1.0.0
description: Use to keep the qa/ documentation web in sync after editing manual-QA checklists or fixtures, or before publishing. When a checklist under qa/checklists/ is added, removed, or updated, propagate the change across every interconnected qa/ doc — the inventory + case-count + scope tables in qa/checklists/README.md and CLAUDE.md, the language inventory + Layout tree in qa/README.md and qa/CLAUDE.md, the languages + file-count tables in qa/workspace/README.md, and each qa/workspace/{lang}/ README/CLAUDE — and verify the one-way checklist→workspace 1:1 fixture pairing. Locates /_rot (stale / drift / gap / orphan / broken-invariant) across the qa/ markdown. Report/draft by default; review the cascade before it lands. Use this whenever you touch qa/ checklists or fixtures, run a pre-publish QA-doc audit, or say "sync the qa docs" / "the qa docs are stale" — even without the words "doc-sync". Never re-derives PROFILE.md from src/ (human-gated) and never ticks checklist [ ] boxes. Triggers - "sync the qa docs", "I edited a checklist, propagate it", "audit qa/ before release", "qa counts look off".
---

# QA Doc Sync

Keep the **qa/ documentation web** truthful against the qa/ contents. A single checklist edit ripples
into a fixed set of inventory tables, scope cells, count columns, a Layout tree, and a 1:1 fixture map.
**Core principle:** the propagation shape is already written down in [`qa/CLAUDE.md`](../../../qa/CLAUDE.md)
("Propagation rule — checklist changes ripple outward"). This skill *executes that known cascade* and
flags `/_rot` along it — it does not re-invent what to check. That's why it's a skill, not an
open-ended audit: the targets are enumerated; the work is doing them correctly and completely.

This is the qa/ counterpart to `scaffold-doc-pair` (src/ doc generation) and the `doc-sync-auditor`
agent (src/ doc upkeep). It owns qa/ only.

## When to use

- You just **added / removed / updated a checklist** under `qa/checklists/` and need the change to
  ripple outward (the most common trigger).
- You **added a new language** to the QA suite (new checklist + workspace dir).
- You're doing a **pre-publish QA-doc audit** and want the whole web checked at once.
- A count or scope cell **looks stale** ("the README says 55 cases but general.md has more now").

**When NOT to use (refuse or redirect these):**

- **PROFILE.md ↔ src/ faithfulness.** Whether `qa/_authoring/PROFILE.md` still reflects current `src/`
  behavior is **human-gated re-derivation** ([`qa/_authoring/README.md`](../../../qa/_authoring/README.md),
  "Stability rules") — explicitly *not* auto-detected, and owned by the checklist-verify concern. This
  skill never reads `src/` to re-derive a checklist. It keeps qa/ docs ↔ qa/ *contents* in sync.
- **`qa/demo-workspace/`** — a standalone framework sandbox that sits *outside* the checklist↔workspace
  model ([`qa/CLAUDE.md`](../../../qa/CLAUDE.md), "demo-workspace"). Never audit or edit it here.
- **Ticking checklist boxes** — see Hard constraint #1. If the request is "tick off what I tested,"
  that's the human's job in the Extension Development Host, not this skill's.

## The qa/ sync model (background)

Two subtrees: `checklists/` (what to test) and `workspace/` (fixtures to test with), plus inventory
docs that index them. The contract is **one-way**:

- **The checklist is the source of truth.** Checklist changed → the workspace and the inventory docs
  must catch up.
- **Workspace-only changes do NOT propagate back.** A fixture that no checklist references is fine —
  convenience files and future-test prep are allowed. Never edit a checklist to match stray fixtures.

The propagation cascade (from [`qa/CLAUDE.md`](../../../qa/CLAUDE.md), verbatim intent): a checklist add/
remove/update ripples to `checklists/{README,CLAUDE}.md` → `qa/{README,CLAUDE}.md` → `workspace/README.md`
→ `workspace/{lang}/` fixtures + `workspace/{lang}/{README,CLAUDE}.md`.

## Hard constraints (always enforced)

These are the ways this skill can do real damage. Each is here because the cost of getting it wrong is
high, not as ceremony.

1. **Never tick `[ ]` boxes inside `checklists/{lang}.md`.** This is the single most dangerous failure
   mode of the whole QA pipeline ([`qa/_authoring/README.md`](../../../qa/_authoring/README.md),
   "Two-tier checkbox rule"): the `[ ]` boxes belong to the human running QA in the EDH. Tick one
   during a doc sync and a QA artifact ships with a phantom "tested" mark. This skill edits inventory /
   scope / count / mapping **prose and tables** — never a checklist's test-item checkboxes.
2. **One-way sync.** Checklist → workspace/docs only. An existing-but-unreferenced fixture is *not* a
   finding. Never "fix" a checklist to mention a stray file.
3. **Respect the exclusions.** `qa/demo-workspace/` is outside the model; `qa/_authoring/` is frozen
   upstream (RECIPE + the human-reviewed PROFILE IR) — read it for context if needed, never regenerate
   from it here.
4. **Doc-only, report-default, reversible.** Touch only the qa/ inventory/scope docs and (when a
   checklist demands it) `workspace/{lang}/` fixtures. Never edit `src/`, tests, `package.json`,
   `PROFILE.md`, or `RECIPE.md`. **Propose edits and get approval before applying.** Everything lands in
   the working tree (visible in `git diff`); never auto-commit.
5. **Idempotent.** Re-running on an already-synced tree finds nothing and changes nothing.

## Workflow

### 1. Scope the run

Decide the trigger and let it bound the work:
- **One/few checklists changed** → audit those languages' cascade only.
- **Pre-publish / "audit qa/"** → full sweep across all in-scope dirs.

If `git` shows checklist changes, let that be your default scope:

```bash
git -C "$(git rev-parse --show-toplevel)" status --porcelain qa/checklists/
git diff --stat -- qa/checklists/        # what changed since last commit
```

### 2. Pre-flight git check

```bash
git status --porcelain qa/
```

- **Clean** → continue.
- **Dirty** → pause and ask: **stop** (default — let the user commit/stash first so the sync doesn't
  mix into unrelated staged work) vs **proceed anyway**. Mirrors `scaffold-doc-pair`'s pre-flight.

### 3. Enumerate the web (in-scope doc-dirs)

```bash
# The doc-dirs this skill owns. EXCLUDE demo-workspace/ (outside the model) and _authoring/ (frozen).
{ echo qa; echo qa/checklists; echo qa/workspace; ls -d qa/workspace/*/ 2>/dev/null; } \
  | sed 's:/$::' | grep -vE 'qa/(demo-workspace|_authoring)'
```

### 4. Detect `/_rot`

Judge each propagation target against the qa/ `/_rot` taxonomy:
- **Stale** — a count or scope cell no longer matches the checklist (e.g. `Cases` says 55 but a section
  was added). Note: several `Cases` figures are deliberately approximate (`~65`) — flag a count only
  when it's clearly wrong, not for ±a few.
- **Drift** — two places that must agree don't (e.g. the scope cell in `checklists/README.md` vs the
  one in `qa/README.md` for the same language; a `workspace/README.md` file count vs the actual tree).
- **Gap** — a new checklist with no row in the inventory tables, or a new fixture dir missing from a map.
- **Orphan** — a removed/renamed checklist still listed in an inventory table or mapping.
- **Broken invariant** — a checklist references a fixture path that doesn't exist (the 1:1 pairing), or
  a per-destination checklist re-tests something `general.md` owns.

Run the **1:1 pairing check** per language — the part that's error-prone by eye. Referenced fixture
paths are workspace-relative and begin with the language dir name (e.g. `` `typescript/src/foo.ts` ``):

```bash
# Report fixture paths a checklist references that are MISSING from its workspace (a real finding).
# Existing-but-unreferenced fixtures are NOT reported — that's the one-way rule.
LANG="$1"                                   # e.g. typescript | general | scss
CHK="qa/checklists/${LANG}.md"
# Pull backtick-delimited tokens (so unicode + spaces in fixture names survive), keep those that are
# workspace paths (begin with the language dir), and resolve each — incl. `dir/*` glob references.
grep -oE '`[^`]+`' "$CHK" | tr -d '`' | grep -E "^${LANG}/" | sort -u | while IFS= read -r p; do
  p="${p%/}"                                # strip trailing slash on directory refs
  case "$p" in
    */\*) d="qa/workspace/${p%/\*}"         # `dir/*` glob → the directory itself must exist
          [ -d "$d" ] || echo "MISSING-DIR: $CHK -> $d/ (glob $p, no such dir)";;
    *)    [ -e "qa/workspace/$p" ] || echo "MISSING: $CHK -> qa/workspace/$p (referenced, no such fixture)";;
  esac
done
```

Backtick extraction beats a bare path-regex here: qa/ fixtures legitimately have **unicode** names
(`komponent-日本語.ts`), **spaces** (`my folder/spaced.ts`), and **glob** refs (`assets/*`), all of
which a `[A-Za-z0-9._-]` pattern truncates into phantom misses. It's still a candidate-surfacer, not an
oracle — confirm each hit by reading the checklist line (a backtick token that isn't really a path, or
a glob over an empty dir, can still slip through).

### 5. Report + checkpoint

Present findings grouped by **target × `/_rot` category**, each with `file:line`, the current claim, the
reality, and a concrete **Before / After** edit. Then stop for approval. (Running this skill in
plan-mode makes this the natural review gate before the cascade lands.) In report/draft mode, stop here.

### 6. Apply (on approval)

Apply the approved edits — doc-only, minimal, matching the existing voice and table shapes. Re-read each
target before editing and drop any finding that no longer holds. Add/update `workspace/{lang}/` fixtures
only when a checklist now references a path that doesn't exist (constraint #2's allowed direction).

### 7. Done

```bash
git status --porcelain qa/
```

Show exactly what changed, remind the user it's all in `git diff` and revertible, and do **not**
auto-commit (the maintainer commits docs).

## What this skill maintains

| Target | What stays in sync |
|--------|--------------------|
| `qa/checklists/README.md` | `## Inventory` table — **Cases** column + scope cells; the 14-row workspace-counterpart map |
| `qa/checklists/CLAUDE.md` | `## Files` per-checklist scope rows |
| `qa/README.md` | `## Layout` tree (checklist one-liners + workspace dirs) + `## Current inventory` table |
| `qa/CLAUDE.md` | checklist↔workspace sync rule, propagation rule, execution order, "Adding a new language" |
| `qa/workspace/README.md` | languages table + file counts |
| `qa/workspace/{lang}/README.md` | file tree, fixture mapping, file counts |
| `qa/workspace/{lang}/CLAUDE.md` | edit rules — **only** if the change affects them |
| **1:1 pairing** | every fixture path `checklists/{lang}.md` references exists under `workspace/{lang}/` |

## Common mistakes

- **Ticking a checklist's `[ ]` box.** The most dangerous one. Inventory prose and tables only — never
  the human's test-item boxes inside `checklists/{lang}.md`.
- **Back-propagating from the workspace.** A stray fixture is not a checklist gap. Sync is one-way.
- **Re-deriving PROFILE from src.** Out of scope and out of bounds — that's a human-reviewed freeze.
- **Touching `demo-workspace/`.** It's outside the model; leave it alone.
- **Updating one count but not its twin.** A language's scope/count lives in *both* `checklists/README.md`
  and `qa/README.md` — fix both, or you've just created drift instead of removing it.
- **Treating approximate counts as exact.** The `~65`-style figures are intentional; don't churn them.

## Verification (for editing this skill)

After any change to this skill, re-verify against the live tree (read-only — no edits):
1. **Dry-run report mode** over the full qa/ tree; confirm it produces a sane finding list and proposes
   **zero** checklist-checkbox edits.
2. **Pairing check** runs for every language and surfaces a genuinely missing fixture if you remove one
   in a scratch worktree (then discard the worktree).
3. **Exclusions:** confirm it never lists `qa/demo-workspace/` or proposes touching `qa/_authoring/`
   (PROFILE/RECIPE).

## Future use

Invoke via Claude Code (`/qa-doc-sync` or "sync the qa docs") after editing checklists/fixtures or before
a release. Project-local; lives in `.claude/skills/` and is tracked with the repo. Run it in plan-mode when you want
to review the whole proposed cascade before any edit lands.

## Changelog

### 1.0.0
- Initial: scope + pre-flight git check, in-scope doc-dir enumeration (excluding demo-workspace/ &
  _authoring/), `/_rot` detection across the propagation web + the 1:1 checklist→workspace pairing check,
  report/checkpoint with Before/After, doc-only apply, done summary. Report/draft default; opus. Encodes
  the propagation rule from `qa/CLAUDE.md`; honors the two-tier checkbox rule and one-way sync.
