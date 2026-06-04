# docs/CLAUDE.md

The **design library** — the home for *why the extension is built the way it is*. It holds the long-form design records that are too detailed for the product spec and don't belong beside the code. One sentence on the division of labour:

| Doc | Question it answers | Lives in |
|-----|---------------------|----------|
| [`../README.md`](../README.md) | What is this, and how do I use it? | root (user-facing) |
| [`../SPEC.md`](../SPEC.md) | What *exactly* does the extension do? | root (product front-matter, paired with `README.md`) |
| **`docs/`** (this tree) | **Why** is it designed this way? | here (design rationale) |
| `../src/**/CLAUDE.md` | **How** is the code structured? | beside the code |

> The product spec is **[`../SPEC.md`](../SPEC.md)** in the repo root — front-matter paired with `README.md`, **not** a library doc. The library is the *why*; the spec is the *what*.

## Residents

- **[import-statements/](import-statements/CLAUDE.md)** — the finalized design tree for the import-statement picker: the inclusion/rejection **rubric** (`CRITERIA.md`), the **shipped** per-language picker shapes (`spec/`), the **rationale + rejection ledgers** behind them (`decisions/`), and the **designed-but-unbuilt** backlog (`future/`). Answers *why each import shape is in or out*. Self-indexed — start at its own `CLAUDE.md`.
- **[qa-pipeline.md](qa-pipeline.md)** — a reader-facing design doc for the spec-driven pipeline that generates the per-language manual-QA checklists. Answers *how and why the QA checklists are generated* (the compiler mental model, the frozen-IR/recipe concept, the guarantees). The runnable machinery lives in [`../qa/_authoring/`](../qa/_authoring/README.md).

## Reading order

- **Why a given import shape exists (or was rejected)** — open [import-statements/](import-statements/CLAUDE.md) and follow its own order (rubric → spec → decisions → future).
- **How the QA checklists are generated** — read [qa-pipeline.md](qa-pipeline.md), then [`../qa/_authoring/README.md`](../qa/_authoring/README.md) for the operator's how-to-run.
- **What the extension does (not why)** — leave the library; read [`../SPEC.md`](../SPEC.md).

## Status legend

- **LIVING** — an actively-maintained design tree whose decision gates stay open for new rows. (`import-statements/`, this index.)
- **REFERENCE** — describes finished machinery; edit only to track a change in what it documents. (`qa-pipeline.md`.)

## Map table

Every resident of the library, with its role and status:

| Resident | Role | Status |
|----------|------|--------|
| [import-statements/](import-statements/CLAUDE.md) | Why each import-statement shape is in or out — rubric, shipped shapes, rejection ledgers, deferred designs. Self-indexed subtree. | **LIVING** |
| [qa-pipeline.md](qa-pipeline.md) | How & why the per-language QA checklists are generated — the spec-driven codegen pipeline, reader-facing. | **REFERENCE** |
| [CLAUDE.md](CLAUDE.md) | This file — the library index. | **LIVING** |
| [`../SPEC.md`](../SPEC.md) | *Pointer, not a resident:* the product functionality spec, in root. | — (root front-matter) |

## Conventions

- Residents are linked by bare relative path from this file (`import-statements/CLAUDE.md`, `qa-pipeline.md`); the root spec is `../SPEC.md`. No `./` prefix.
- `import-statements/` carries its own full index, status legend, and sync rules — this file maps *to* it; it does not restate them.
- This is the only `CLAUDE.md` at the `docs/` root; each subtree brings its own.
