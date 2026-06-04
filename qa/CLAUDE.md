# qa/CLAUDE.md

Manual QA tree for the extension. Two subtrees drive the QA pass: `checklists/` (what to test) and `workspace/` (fixtures to test with). A standalone `demo-workspace/` (framework sandbox) sits alongside them — see the section at the bottom of this file.

## Checklist-workspace sync rule

Every checklist has a 1:1 workspace counterpart:

```
checklists/general.md      ↔  workspace/general/
checklists/typescript.md   ↔  workspace/typescript/
```

**Sync direction is one-way — checklist drives workspace:**

- Checklist updated → verify `workspace/{language}/` has every fixture the checklist references. Add missing files, update content if the checklist changed expectations.
- Workspace updated → do NOT update the checklist. The workspace can have extra fixtures (e.g., convenience files, future test prep) without the checklist needing to mention them.

## Propagation rule — checklist changes ripple outward

When any file in `checklists/` is added, removed, or updated, check these for staleness and update them:

1. **`checklists/README.md`** and **`checklists/CLAUDE.md`** — inventory tables, case counts, scope descriptions.
2. **`README.md`** and **`CLAUDE.md`** (this directory) — language inventory table, mapping list, execution order.
3. **`workspace/README.md`** — languages table, file counts.
4. **`workspace/{language}/`** — add/update/remove fixture files so every path the checklist references exists. Update `workspace/{language}/README.md` (file tree, fixture mapping, file counts) and `workspace/{language}/CLAUDE.md` if the change affects edit rules.

The reverse does NOT apply: workspace-only changes (adding convenience files, tweaking fixture content) do not propagate back to checklists or their docs.

## Execution order

`general.md` runs first. Per-destination checklists (e.g., `typescript.md`) assume `general.md` has already passed — they do not re-test shared behaviors like clipboard validation, same-file rejection, or notification wording.

Do not duplicate `general.md` items in per-destination checklists.

## Adding a new language

1. Create `checklists/{language}.md` with destination-specific test cases.
2. Create `workspace/{language}/` with every fixture the checklist references.
3. Add the language to the tables in `checklists/README.md` and `workspace/README.md`.

## demo-workspace (standalone)

`demo-workspace/` is a small framework fixture workspace (Vue/Svelte/Astro/React
+ real `node_modules`) with its own `package.json` and `tsconfig.json` — don't
confuse them with the root project's. It sits outside the checklist↔workspace
model above: nothing in `checklists/` references it, and the propagation rules do
not apply.

- **Excluded from every toolchain surface.** `qa/` is outside
  `tsconfig.json`'s `src/**` include; `eslint.config.mjs` ignores
  `qa/demo-workspace/**`. Fixtures intentionally import uninstalled packages
  and use undeclared globals — don't "fix" them.
- **`node_modules` is regenerable.** Only the ~16 source files are tracked; run
  `npm install` inside `demo-workspace/` to restore the framework packages.
