# Runbook — `.ts` migration (Phase 0 + A + A.5 + B-verify + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> migration tasks. The `[ ]` boxes inside `qa.new/checklists/typescript.md`
> are for the HUMAN running QA in the Extension Development Host.
> **NEVER tick boxes in `qa.new/checklists/typescript.md` during generation.**

> **Single-session exception.** Unlike the 11 new languages (checklist session +
> workspace session), TS runs in ONE session: Phase 0 → A → A.5 (parity) → B
> (verify-only — the workspace already exists) → C. This is the pipeline's stress
> test: if `RECIPE.md` + `PROFILE.md` cannot reproduce the hand-written
> `typescript.md`, the infrastructure is wrong (spec §7).

---

## Phase 0 — Parity baseline (TS only)

- [x] Extract the test-case inventory from the existing `qa.new/checklists/typescript.md`
- [x] Save the inventory to `qa.new/_authoring/parity-ts.md` as a flat list of cases
      (one line per case, grouped by section, with each case's identifying assertion)

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.ts`
- [x] Read `qa.new/_authoring/RECIPE.md`
- [x] Read source-of-truth files (per `dispatch.ts`: `.ts` → `languages/typescript.ts`):
      - `src/snippets/languages/typescript.ts` — builder, Angular PascalCase, 7 style indexes
      - `src/snippets/_styles.ts` — `TYPESCRIPT_IMPORT_OPTIONS` literal strings + tab stops
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — picker variants + dispatch
      - `src/snippets/_class-name.ts` — exported-class detection (smart-ID destination)
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — `placement` (generic mode)
      - `src/gating.ts` — `isPairSupported` (`.ts` same-only)
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — closed `SOURCE_UNIVERSE`
      - `package.json` (`contributes.configuration` enums + `default`) — `defaultStyle`
- [x] Write `qa.new/checklists/typescript.NEW.md` per recipe + profile,
      with expected fixture content inlined for every referenced path
- [x] Self-verify: every recipe section the profile marks required is present
      (1 gating, 2 happy, 3 Alt+D, 4 styles, 5 smartId, 6 placement, 7 Pick Style,
      8 Set Default, 9 DnD, 10 edge, 11 sign-off) — confirmed: 11 `## N` headers
- [x] Self-verify: no recipe section the profile excludes was emitted
      — `.ts` is the maximal destination (smartId=both); nothing excluded
- [x] Self-verify: section 4 enumerates exactly N = 7 styles (profile.styles count)
      — confirmed: 7 `### Style N` headers (drift case is a separate header)
- [x] Self-verify: section 4 carries the style-name-drift sub-item (RECIPE Item 4)
- [x] Self-verify: every fixture path referenced has inline content described
      (placement destinations as fenced blocks; class/Angular sources as inline
      `contains …` assertions; the new `tsx-dest.tsx` content stated)
- [x] Self-verify: every actionable step is executable — names the exact fixture file,
      the exact gesture (keybinding / Command Palette / drag-drop), and the exact
      expected result; no step requires the tester to guess (the previously-vague
      §5.9 now names `tsx-dest.tsx`; the drift step names the exact settings.json key)
- [x] Self-verify: the three general.md DELTA cross-references (§8 DnD, §9 Pick Style,
      §10 Set Default) are present and resolve

## Phase A.5 — Parity gate (TS only)

- [x] Diff `typescript.NEW.md` against the `parity-ts.md` inventory at test-case granularity
- [x] List orphans (cases in old missing from new) — **ORPHANS = 0.** All 86 baseline
      cases (+ the §1 View-Supported-Files button sub-assertion) have a verified home:
      §1→§1 (21), §2→§2, §3→§3, §4→§4 (7), old §5.1–5.9 → §5.A.1–5.A.9 (9),
      old §6.1–6.10 → §5.B.1–5.B.10 (10), old §7.x → §6.x (16), old §8 → §7 (3),
      old §9 → §8 (2), old §10 → §9 (11), old §11 → §10 (5). Counts confirmed
      mechanically per section.
- [x] For each orphan: patch the PROFILE row or RECIPE entry, re-run Phase A — N/A (no orphans;
      IR source-verified faithful, gate converged on the first pass)
- [x] Iterate until the orphan list is empty OR all remaining deltas are documented
      as intentional improvements. **Deltas (all intentional, RECIPE-mandated):**
      (1) structural — old §5 (exported-class) + §6 (Angular) merged into §5.A + §5.B,
      §7→§6 … §11→§10 renumber, internal xref §7.3.3 → §6.3.3;
      (2) enrichment — +§4 style-name-drift (RECIPE Item 4), +§9.10 universal drop
      precondition (RECIPE Item 9, emit-once);
      (3) consistency — §5.A.9 now names a concrete `tsx-dest.tsx` fixture (was the
      non-executable "a .tsx file"); §5.B.9 gains a restore step; §7.2 asserts both
      label-basename and full-path insertion.
- [x] Atomic swap: replace `qa.new/checklists/typescript.md` with `typescript.NEW.md`
- [x] Delete `qa.new/_authoring/parity-ts.md` (contents copied into the commit body for audit)

## Phase B — Workspace (verify-only for TS)

- [x] Verify every fixture path the regenerated `typescript.md` references exists in
      `qa.new/workspace/typescript/` — 48 referenced paths + `Makefile`; all present
      except the one genuinely-new path below
- [x] Add fixtures only for any genuinely-new paths the regeneration introduced —
      created `workspace/typescript/src/classes/tsx-dest.tsx` (`export const TsxDest = () => null;`),
      the `.tsx` destination that makes §5.A.9 executable. Workspace count 54 → 55.

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` — count `~86` → `~88`; scope now reads
      "smart identifiers (exported-class detection + Angular PascalCase)" + style-name drift
- [x] Update `qa.new/checklists/CLAUDE.md` — scope row updated (same merge wording)
- [x] Update `qa.new/README.md` — no change; scope strings describe *what* is tested
      (class detection, Angular, placement), still accurate after the §5/§6 merge
- [x] Update `qa.new/CLAUDE.md` — no change; carries no TS case count or detailed scope
- [x] Update `qa.new/workspace/README.md` — file count `54` → `55` (new `tsx-dest.tsx`)
- [x] Update `qa.new/workspace/typescript/README.md` — added `tsx-dest.tsx` to the tree +
      mapping; renumbered every stale section reference to the new scheme (old §5/§6 →
      §5.A/§5.B, §7→§6, §10→§9, §11→§10); `src/` count 19 → 20, Total 54 → 55.
      (`workspace/typescript/CLAUDE.md` left unchanged — edit rules unaffected; the README
      documents the new fixture.)
- [x] Validate: every path referenced in `typescript.md` exists in `workspace/typescript/`
      — confirmed (48 paths + `Makefile`, all present)
- [x] Validate: no orphan fixtures in `workspace/typescript/` — the 5 unreferenced fixtures
      (`components/widget.ts`, `components/ui/button.ts`, `utils/helpers/format.ts`,
      `edge-cases/komponent-日本語.ts`, `edge-cases/my folder/spaced.ts`) are all documented
      as intentional "extra / tested via general.md" in the workspace README
