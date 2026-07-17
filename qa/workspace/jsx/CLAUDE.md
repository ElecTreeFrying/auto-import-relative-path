# qa/workspace/jsx/CLAUDE.md

Fixtures for `checklists/jsx.md` — the `.jsx` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `jsx.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `jsx.md`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Script sources to copy/drag FROM (`App.jsx`, `helper.js`, nested `components/Card.jsx`) plus the primary paste/drop destination (`Panel.jsx`), plus the two `.ts`/`.tsx` sources (`model.ts`, `Widget.tsx`) that exercise the empty-snippet case. `.jsx` has no smart-identifier detection, so — unlike `typescript/` — there are no `classes/` or `angular/` subtrees. |
| `assets/` | One non-script source per `SOURCE_UNIVERSE` category (image, document, framework, html, markdown, data, CSS-module, stylesheet, font, video, audio, text-track, **latex**). **`.jsx` is accept-all** (gating accepts every source), so each is gating-accepted — most get a fixed shape, but `.tex`/`.bib`/`.eps` have no asset-switch case → empty snippet (the same path as `src/`'s `.ts`/`.tsx`). There is **no `rejected/` dir** (the structural difference from `javascript/`). |
| `destinations/` | Pre-filled `.jsx` files for placement tests. Each has specific content (imports, comments, code) that the checklist expects, with exact insertion line numbers. **Undo after each paste** so the file returns to its expected state. |

## Fixture content expectations

- **`src/*`** — content is irrelevant. `.jsx` has no smart-identifier detection, so the inserted tab stop is always a bare `$1`; no `export class` or Angular naming is needed (or honored). `model.ts` / `Widget.tsx` only need to *exist* with their extension — they route to the empty snippet regardless of bytes.
- **`assets/*`** — content is irrelevant; the import shape keys on the file **extension**, not the bytes. Binary-type files (`.png`, `.pdf`, `.woff2`, `.mp4`, `.mp3`) are empty placeholders; the text assets carry a one-line stub for readability only.
- **`destinations/*.jsx`** — content matters and is **byte-verbatim from `jsx.md`** (§6 + §10). The checklist specifies exact file contents and expected insertion line numbers; do not change these files without updating the checklist. Their `import { Header } from '../src/Header';` / `Footer` lines are inert textual scan-bait for the Bottom-placement scan — they need not resolve, so there is no `src/Header.jsx` or `src/Footer.jsx`.
