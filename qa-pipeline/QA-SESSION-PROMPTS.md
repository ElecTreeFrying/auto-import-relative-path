# QA Pipeline — Session Prompts (sessions 4–25)

Copy-paste drivers for the **22 remaining sessions** of the checklist codegen
pipeline. Sessions 1–3 (scaffold, populate-profile, migrate-typescript) are
committed. Governing spec: [`qa-pipeline/QA-PIPELINE-SPEC.md`](qa-pipeline/QA-PIPELINE-SPEC.md)
(§10 execution order, §11 per-session workflow).

## How to run one session

1. Open a **fresh** Claude Code session in this repo.
2. Toggle plan mode on (**Shift+Tab** until it shows `plan mode`).
3. Paste the session's **Kickoff** → review and approve the plan it proposes.
4. Paste the session's **Loop prompt** → it generates, ticking its runbook `[ ]`→`[x]`.
5. **Checklist (`a`) sessions only, optional:** paste the **Verify trigger** (below)
   → it runs the report-only `checklist-verify` workflow and returns a defect list.
   Triage (fix interactively or accept), then continue. Workspace (`b`) sessions skip this.
6. Review the deliverable → it makes **one commit**. Session done.

**Rules**

- Run sessions strictly top-to-bottom. Each language's **checklist (a)** MUST be
  committed before its **workspace (b)** — the workspace kickoff halts if the
  checklist isn't on disk (the §13 handshake).
- One session = one fresh chat = one commit.
- **Two pastes per session** (three on a verified checklist session — plus the verify
  trigger after the loop). The loop prompt can't go first: it reads a runbook
  that doesn't exist until the kickoff's plan is approved and the runbook is written.
- **Optional verification workflow (step 5).** After the Loop prompt finishes and the
  checklist is on disk (uncommitted), paste the trigger below in the SAME session. It
  runs the report-only, multi-agent `checklist-verify` workflow — re-derives each
  checklist claim from the PROFILE row + RECIPE + source across ~9 dimensions (gating ·
  styles + tab-stops · smartId · placement · pick-style / set-default delta ·
  drag-and-drop · settings · general.md boundary · executable-instruction compliance),
  consolidates, then adversarially verifies each defect. Every agent is read-only
  (`Explore`) — it makes **no writes** and can never tick a `[ ]` box; you triage before
  the commit.
  Each checklist (`a`) session below carries its own copy-paste **Verify trigger** block —
  paste it after that session's Loop prompt.

  My lean: run `4a` (.js) first as the calibration baseline, then decide whether the pass
  earns its keep for the other ten. Workspace (`b`) sessions don't need it.

## Progress tracker

> These boxes track **your** progress driving sessions — a separate tier from the
> runbook boxes (agent) and the checklist boxes (the EDH human). Tick freely.

- [ ] 4a — javascript · checklist
- [ ] 4b — javascript · workspace
- [ ] 5a — css · checklist
- [ ] 5b — css · workspace
- [ ] 6a — scss · checklist
- [ ] 6b — scss · workspace
- [ ] 7a — html · checklist
- [ ] 7b — html · workspace
- [ ] 8a — markdown · checklist
- [ ] 8b — markdown · workspace
- [ ] 9a — jsx · checklist
- [ ] 9b — jsx · workspace
- [ ] 10a — tsx · checklist
- [ ] 10b — tsx · workspace
- [ ] 11a — mdx · checklist
- [ ] 11b — mdx · workspace
- [ ] 12a — vue · checklist
- [ ] 12b — vue · workspace
- [ ] 13a — svelte · checklist
- [ ] 13b — svelte · workspace
- [ ] 14a — astro · checklist
- [ ] 14b — astro · workspace

---

## 4a — JavaScript checklist (Phase A)

*Validates that RECIPE's `smartId` conditional suppresses §5; `.js` default style is `import $1 from '<path>';` (default import, not TS's `import { $1 }`). Gating: same-only.*

**Kickoff:**

```
Start session 4a of the QA checklist codegen pipeline — generate-javascript-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .js row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .js PROFILE row + RECIPE + the source-of-truth files Template A lists for .js) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/javascript.md + qa.new/_authoring/runbook-javascript-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/javascript.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-javascript-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/javascript.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/javascript.md (args: javascript) — report-only, give me the defect list before I review.
```

---

## 4b — JavaScript workspace (Phases B + C)

**Kickoff:**

```
Start session 4b of the QA checklist codegen pipeline — generate-javascript-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/javascript.md exists on disk (committed in session 4a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/javascript.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/javascript/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 4a (qa.new/checklists/javascript.md) is committed. Output: qa.new/workspace/javascript/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/javascript.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-javascript-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/javascript.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 5a — CSS checklist (Phase A)

*First stylesheet destination: `@import` always keeps the source extension (no preserve toggle); an image source → fixed `url('<path>')` with `inline-url` placement (the setting is ignored). Gating: allow-list (`.css` + image).*

**Kickoff:**

```
Start session 5a of the QA checklist codegen pipeline — generate-css-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .css row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .css PROFILE row + RECIPE + the source-of-truth files Template A lists for .css) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/css.md + qa.new/_authoring/runbook-css-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/css.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-css-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/css.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/css.md (args: css) — report-only, give me the defect list before I review.
```

---

## 5b — CSS workspace (Phases B + C)

**Kickoff:**

```
Start session 5b of the QA checklist codegen pipeline — generate-css-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/css.md exists on disk (committed in session 5a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/css.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/css/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 5a (qa.new/checklists/css.md) is committed. Output: qa.new/workspace/css/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/css.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-css-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/css.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 6a — SCSS checklist (Phase A)

*The rarest quirks: `_partial` normalization + the `preserveStylesheetFileExtension` toggle (distinct from the script key); a `.css` source always preserves `.css`. `stylesheet` placement anchors on `@use`/`@forward`/`@import`. One-way: SCSS imports CSS, CSS rejects SCSS.*

**Kickoff:**

```
Start session 6a of the QA checklist codegen pipeline — generate-scss-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .scss row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .scss PROFILE row + RECIPE + the source-of-truth files Template A lists for .scss) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/scss.md + qa.new/_authoring/runbook-scss-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/scss.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-scss-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/scss.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/scss.md (args: scss) — report-only, give me the defect list before I review.
```

---

## 6b — SCSS workspace (Phases B + C)

**Kickoff:**

```
Start session 6b of the QA checklist codegen pipeline — generate-scss-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/scss.md exists on disk (committed in session 6a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/scss.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/scss/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 6a (qa.new/checklists/scss.md) is committed. Output: qa.new/workspace/scss/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/scss.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-scss-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/scss.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 7a — HTML checklist (Phase A)

*6-way source-type dispatch (script/image/video/audio/stylesheet/text-track); image/video/audio style-0 entries are tagless; `forced-cursor` placement; `.html`→`.html` is a rejection row.*

**Kickoff:**

```
Start session 7a of the QA checklist codegen pipeline — generate-html-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .html row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .html PROFILE row + RECIPE + the source-of-truth files Template A lists for .html) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/html.md + qa.new/_authoring/runbook-html-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/html.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-html-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/html.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/html.md (args: html) — report-only, give me the defect list before I review.
```

---

## 7b — HTML workspace (Phases B + C)

**Kickoff:**

```
Start session 7b of the QA checklist codegen pipeline — generate-html-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/html.md exists on disk (committed in session 7a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/html.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/html/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 7a (qa.new/checklists/html.md) is committed. Output: qa.new/workspace/html/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/html.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-html-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/html.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 8a — Markdown checklist (Phase A)

*Simpler 2-way source-type dispatch (fixed markdown-link shape + image options); `forced-cursor` placement with the markdown-star Cursor quirk; accepts `.md` + image only (no media, no `.vtt`). Destination word is `markdown`, file is `markdown.md`.*

**Kickoff:**

```
Start session 8a of the QA checklist codegen pipeline — generate-markdown-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .md row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .md PROFILE row + RECIPE + the source-of-truth files Template A lists for .md) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/markdown.md + qa.new/_authoring/runbook-markdown-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/markdown.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-markdown-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/markdown.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/markdown.md (args: markdown) — report-only, give me the defect list before I review.
```

---

## 8b — Markdown workspace (Phases B + C)

**Kickoff:**

```
Start session 8b of the QA checklist codegen pipeline — generate-markdown-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/markdown.md exists on disk (committed in session 8a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/markdown.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/markdown/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 8a (qa.new/checklists/markdown.md) is committed. Output: qa.new/workspace/markdown/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/markdown.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-markdown-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/markdown.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 9a — JSX checklist (Phase A)

*First source-extension dispatch: `.ts`/`.tsx` source → empty snippet (nothing inserted, 0 picker variants); non-script → fixed asset shapes (CSS-module shape beats side-effect). Gating: accept-all (no source-ext reject rows).*

**Kickoff:**

```
Start session 9a of the QA checklist codegen pipeline — generate-jsx-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .jsx row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .jsx PROFILE row + RECIPE + the source-of-truth files Template A lists for .jsx) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/jsx.md + qa.new/_authoring/runbook-jsx-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/jsx.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-jsx-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/jsx.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/jsx.md (args: jsx) — report-only, give me the defect list before I review.
```

---

## 9b — JSX workspace (Phases B + C)

**Kickoff:**

```
Start session 9b of the QA checklist codegen pipeline — generate-jsx-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/jsx.md exists on disk (committed in session 9a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/jsx.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/jsx/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 9a (qa.new/checklists/jsx.md) is committed. Output: qa.new/workspace/jsx/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/jsx.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-jsx-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/jsx.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 10a — TSX checklist (Phase A)

*Source-extension dispatch; accept-all gating; Angular-PascalCase on style 0 with NO exported-class fill (`readExportedClassName` never called for tsx). CSS-module shape beats the side-effect shape.*

**Kickoff:**

```
Start session 10a of the QA checklist codegen pipeline — generate-tsx-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .tsx row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .tsx PROFILE row + RECIPE + the source-of-truth files Template A lists for .tsx) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/tsx.md + qa.new/_authoring/runbook-tsx-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/tsx.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-tsx-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/tsx.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/tsx.md (args: tsx) — report-only, give me the defect list before I review.
```

---

## 10b — TSX workspace (Phases B + C)

**Kickoff:**

```
Start session 10b of the QA checklist codegen pipeline — generate-tsx-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/tsx.md exists on disk (committed in session 10a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/tsx.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/tsx/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 10a (qa.new/checklists/tsx.md) is committed. Output: qa.new/workspace/tsx/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/tsx.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-tsx-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/tsx.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 11a — MDX checklist (Phase A)

*⚠️ The `.mdx` PROFILE row is byte-identical to `.tsx`, but generate it INDEPENDENTLY from the `.mdx` row — do NOT seed from `tsx.md`. The one true divergence is the markdown-star quirk: a Cursor insertion lands AT a leading-`*` line in `.mdx`, but jumps ABOVE it in the byte-identical `.tsx` buffer.*

**Kickoff:**

```
Start session 11a of the QA checklist codegen pipeline — generate-mdx-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Note: the .mdx PROFILE row is byte-identical to .tsx, but generate this checklist INDEPENDENTLY from the .mdx PROFILE row — do not seed from or copy tsx.md. The markdown-star Cursor quirk is the intended divergence from .tsx.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .mdx row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .mdx PROFILE row + RECIPE + the source-of-truth files Template A lists for .mdx) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/mdx.md + qa.new/_authoring/runbook-mdx-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/mdx.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-mdx-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/mdx.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/mdx.md (args: mdx) — report-only, give me the defect list before I review.
```

---

## 11b — MDX workspace (Phases B + C)

**Kickoff:**

```
Start session 11b of the QA checklist codegen pipeline — generate-mdx-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/mdx.md exists on disk (committed in session 11a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/mdx.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/mdx/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 11a (qa.new/checklists/mdx.md) is committed. Output: qa.new/workspace/mdx/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/mdx.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-mdx-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/mdx.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 12a — Vue checklist (Phase A)

*`framework-component.ts` builder: **script** sources (`.ts`/`.tsx`/`.js`/`.jsx`) → the 7-style TS table; **non-script** sources → fixed single-variant asset shapes (shared `buildAssetImportStatement`, same split as `.tsx`); `sfc-script` placement (clamped in `<script>`, prefers `<script setup>`); Angular-PascalCase on style 0 (script sources), no exported-class fill.*

**Kickoff:**

```
Start session 12a of the QA checklist codegen pipeline — generate-vue-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .vue row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .vue PROFILE row + RECIPE + the source-of-truth files Template A lists for .vue) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/vue.md + qa.new/_authoring/runbook-vue-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/vue.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-vue-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/vue.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/vue.md (args: vue) — report-only, give me the defect list before I review.
```

---

## 12b — Vue workspace (Phases B + C)

**Kickoff:**

```
Start session 12b of the QA checklist codegen pipeline — generate-vue-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/vue.md exists on disk (committed in session 12a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/vue.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/vue/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 12a (qa.new/checklists/vue.md) is committed. Output: qa.new/workspace/vue/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/vue.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-vue-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/vue.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 13a — Svelte checklist (Phase A)

*Same `framework-component.ts` builder as `.vue`; `sfc-script` placement bounded by the `<script>` block (no `context=` preference). Script sources → the 7-style TS table; non-script sources → the shared fixed asset shapes (single variant each) — same split as `.tsx`/`.vue`.*

**Kickoff:**

```
Start session 13a of the QA checklist codegen pipeline — generate-svelte-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .svelte row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .svelte PROFILE row + RECIPE + the source-of-truth files Template A lists for .svelte) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/svelte.md + qa.new/_authoring/runbook-svelte-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/svelte.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-svelte-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/svelte.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/svelte.md (args: svelte) — report-only, give me the defect list before I review.
```

---

## 13b — Svelte workspace (Phases B + C)

**Kickoff:**

```
Start session 13b of the QA checklist codegen pipeline — generate-svelte-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Handshake first: confirm qa.new/checklists/svelte.md exists on disk (committed in session 13a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/svelte.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/svelte/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 13a (qa.new/checklists/svelte.md) is committed. Output: qa.new/workspace/svelte/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/svelte.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-svelte-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/svelte.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

## 14a — Astro checklist (Phase A)

*Same framework builder; `astro-frontmatter` placement — imports clamped within the `---` fences (creates a fresh `---` block at line 0 if none exists). Last language; benefits from every prior stress test.*

**Kickoff:**

```
Start session 14a of the QA checklist codegen pipeline — generate-astro-checklist (Phase A only), per qa-pipeline/QA-PIPELINE-SPEC.md §10.

Orient first: read the spec's §6 (runbook Template A), §10 (execution order), §11 (per-session workflow); qa.new/_authoring/README.md; qa.new/_authoring/RECIPE.md; and the .astro row of qa.new/_authoring/PROFILE.md.

Then follow §11: read this step's inputs (the .astro PROFILE row + RECIPE + the source-of-truth files Template A lists for .astro) and propose a plan for my approval. Do NOT write the runbook or the checklist until I approve.

Context: earlier pipeline sessions in §10 are committed; this is the next step. Output: qa.new/checklists/astro.md + qa.new/_authoring/runbook-astro-checklist.md, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/astro.md — those belong to the human running EDH.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-astro-checklist.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/astro.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

**Verify trigger** *(optional — paste after the Loop prompt, before you review):*

```
Run the checklist-verify workflow on qa.new/checklists/astro.md (args: astro) — report-only, give me the defect list before I review.
```

---

## 14b — Astro workspace (Phases B + C) — final session

**Kickoff:**

```
Start session 14b of the QA checklist codegen pipeline — generate-astro-workspace (Phases B + C), per qa-pipeline/QA-PIPELINE-SPEC.md §10. This is the final session of the migration.

Handshake first: confirm qa.new/checklists/astro.md exists on disk (committed in session 14a). If it does not, stop and report — do not proceed.

Orient: read the spec's §6 (runbook Template B) and §11 (per-session workflow); qa.new/_authoring/README.md; and qa.new/checklists/astro.md — extract every fixture path and its inline content spec from the checklist.

Then follow §11: propose a plan for my approval (Phase B = fixtures to create under qa.new/workspace/astro/; Phase C = the qa.new inventory/sync docs to update). Do NOT create fixtures or edit docs until I approve.

Context: session 14a (qa.new/checklists/astro.md) is committed. Output: qa.new/workspace/astro/* + updated qa.new inventory/sync docs, as one commit. Two-tier checkbox rule: never tick [ ] boxes inside qa.new/checklists/astro.md.
```

**Loop prompt:**

```
Read qa.new/_authoring/runbook-astro-workspace.md.

Find the first task with `[ ]`. Execute it. Mark it `[x]` and save the runbook.
Repeat until no `[ ]` boxes remain.

Hard rule: NEVER tick `[ ]` boxes inside qa.new/checklists/astro.md.
Those belong to the human running EDH.

If a task fails or you need clarification, stop and report — do not skip.
```

---

*Convenience driver file — safe to gitignore or commit, your call. All prompts are
verbatim-pasteable; only the per-session italic notes are annotations (don't paste them).*
