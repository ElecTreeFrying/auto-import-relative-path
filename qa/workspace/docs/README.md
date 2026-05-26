# Auto Import Demo Project

This is a manual-QA fixture workspace for the **Auto Import Relative Path** VS Code extension. It mirrors a realistic mid-size frontend codebase so that every paste-import path can be exercised by a human tester.

## What lives here

- `src/` — application source: TypeScript, JavaScript, JSX, TSX, plus Angular and React component samples.
- `styles/` — CSS and SCSS, including partials and a `_partials/_nested.scss` for nested-partial path tests.
- `pages/` — HTML pages.
- `docs/` — Markdown documents for paste-into-Markdown checks.
- `assets/` — images, fonts, and icons.
- `data/` — JSON and YAML config fixtures.
- `unsupported/` — files whose extensions are deliberately unsupported, used for rejection-clause testing.
- `my files/`, `unicode-paths/`, `deeply/nested/...` — special-character and deep-path fixtures.

## How to use

Open this folder as a workspace inside the Extension Development Host (F5 from the parent project) and follow [`../../checklists/00-setup.md`](../../checklists/00-setup.md) onwards.
