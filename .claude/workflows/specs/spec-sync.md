# Spec Sync Workflow — Spec

> **This Markdown is the source of truth.** The implementation lives in `spec-sync.js`
> (generated from this doc). To change the workflow's behaviour, edit *this file first*, then
> regenerate the script from it. Both files are under `.claude/` → local-only (gitignored).

## Purpose

The deep, **spec-only** counterpart to `release-align`'s broad release sweep: audit the existing
`SPEC.md` against the code and report (or, in fix mode, apply) the gaps and corrections —
keeping everything already right. **It is not a rebuild** — the current `SPEC.md` is preserved and
improved in place. **Heavy / rare** — run when you doubt the spec's completeness, not per-commit.
**Report/draft by default**; `args {mode:"fix"}` edits `SPEC.md` only.

When to run: when in doubt about `SPEC.md`, before a release, or after a big refactor. Broad
per-release file alignment is `release-align`'s job; per-commit doc upkeep is `doc-sync-auditor`'s.

## Ground truth

The **code** under `src/` (non-test), plus **`package.json`** (its `contributes`: commands,
keybindings, activationEvents, configuration), is the source of truth. The current `SPEC.md` is the
**audited document**, not ground truth — every SPEC claim is checked against the code, and every code
behavior is checked for SPEC coverage. Same posture as `doc-sync-full`, with `SPEC.md` as the doc.

## What it audits (the `/_rot` taxonomy, spec-flavoured)

- **Gap** — a behavior / command / keybinding / setting / gating clause that exists in code but
  `SPEC.md` documents nowhere.
- **Stale** — a `SPEC.md` claim no longer true.
- **Drift** — `SPEC.md` and code diverged, especially byte-exact contract values.
- **Broken invariant** — a documented invariant/contract violated in code (reported, never code-edited).

## Coverage — exhaustive

Denominator = every non-test `.ts` under `src/` (the caller passes `args.sourceFiles` from
`git ls-files`) + `package.json`. Every target gets one **full-read** agent; the verified inventory is
the ground truth the spec is then checked against. The four cross-file contracts + gating + layering
get dedicated agents.

## Output & mode

**Report/draft by default** — returns confirmed findings (Gap/Stale/Drift/Broken-invariant, each with
SPEC section + location + reality + `proposedFix`), the full inventories, and a reconciliation. The
caller writes a throwaway `SPEC.audit.md` from the findings; `SPEC.md` is untouched. **`args
{mode:"fix"}`** runs a **single writer** that edits **only `SPEC.md`**, applying confirmed findings.

## Workflow phases

1. **Extract → Verify** — full-read Opus agent per source file (+ `package.json`); the schema forces
   complete inventories; an independent verify stage corrects/augments. Runs in **small sequential batches**
   (`EXTRACT_BATCH`), like Audit/Verify (see Decisions).
2. **Contracts** — one agent per cross-file contract (four-site, three-site, two-site, runtime-mirror,
   gating, layering).
3. **Audit** — per-file + per-contract agents read the live `./SPEC.md` and check it against the
   verified inventory → findings; deduped. Extract, Audit, and Verify all run in **small sequential
   batches**, not wide `parallel()`/`pipeline()` fan-outs (see Decisions).
4. **Verify** — adversarial refute-by-default per finding; only survivors are confirmed.
5. **Apply** *(fix mode only)* — single writer edits `SPEC.md`.

## Decisions / toggles

- **Full-read default subagent, NOT `Explore` — deliberate deviation from this directory's convention.**
  `Explore` reads excerpts; exhaustive whole-file reading is the point. Write-safety is preserved by the
  report-mode default + the single writer existing only in fix mode (and touching only `SPEC.md`).
- **Tests excluded from ground truth.** The spec describes *shipped* behavior; tests verify it, they
  don't add it — so extraction and verify read `src/` (non-test) + `package.json` only. (The verify
  stage could consult a test as a tiebreaker via a one-line toggle, off by default.)
- **Opus across all agents.** ~36 files + the manifest; cost acceptable, model-tier doubt removed.
  Levers: `sonnet` (or drop) the per-file verify; 3-lens the finding-verify for extra rigour.
- **Extract, Audit & Verify all run in small sequential batches (`EXTRACT_BATCH` / `AUDIT_BATCH` / `VERIFY_BATCH`, default 6), not wide `parallel()` / `pipeline()` fan-outs.** By the time Audit runs (~80 prior agents, >1M tokens), firing all ~42 audit
  + all verify *schema* agents as one barrier throttles the API and agents return prose instead of calling
  `StructuredOutput` — observed 2026-05-31: 25/43 audit agents (incl. **all 6 contract audits**) mass-failed.
  Small waves keep the instantaneous rate under the throttle — **PROVEN 2026-05-31**: a batched re-run
  completed **43/43 audits, `droppedAudits: []`**, 38 raw → 26 confirmed → 24 applied. **Extract was the last un-batched phase (a bare `pipeline()`) until 2026-06-04, when a transient throttle dropped its tail — `pipeline[21..36]` = 14/37 targets (incl. `package.json` + all 9 `languages/` builders); it now uses the same `runBatched` waves.** Slower wall-clock,
  reliably complete. Reconciliation reports `droppedAudits`/`auditCompleted` (+ dropped targets) so any residual gap is visible.
  Levers: raise the batch sizes when rate-comfortable, or make the audit agents free-text.
- **Audit agents read the live `./SPEC.md`, not an embedded `args.specText` snapshot.** Avoids passing a
  ~25 KB arg and any transcription/staleness skew; safe because the fix-mode writer edits only at the very
  end, after every audit/verify agent has finished. `args.specText` is now optional and ignored.
- Rough scale: ~90 opus agents, ~1–1.3M tokens, one-shot.

## Maintenance

Edit this doc → regenerate `spec-sync.js`; on drift, the doc wins. No cheap agent counterpart yet
(standalone heavy audit); complements `release-align` (broad release sweep). If a daily "is `SPEC.md`
accurate" driver is added later, record it in `.claude/workflows/CLAUDE.md`'s pairing table.
