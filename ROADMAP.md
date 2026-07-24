# Roadmap

Planned / deferred work for **auto-import-relative-path**. This is the backlog home referenced by the
design library (`import-statement-design/`): a design that's intended-but-not-yet-shipped lives here
as a short entry, with its detailed design (when one exists) in `.claude/_archive/future/`, and
graduates into an `import-statement-design/` topic file once it ships.

Rejections are **not** here — a "no, with a reason" is a rejection-ledger row in the matching
`import-statement-design/*` Part 2, not a roadmap item.

---

## 1. `.htm` — HTML extension alias  ·  *v1.1.0*

Treat `.htm` as a pure alias of `.html`: the same HTML destination language (VS Code's `html` language
ID already covers `.htm`), the same import shapes, **no new picker entry and no new setting**. Applies
to both gestures (paste + drag).

- **Origin:** GitHub issue [#8](https://github.com/ElecTreeFrying/drag-import-relative-path/issues/8) —
  editing a `.htm` file. Today a `.htm` destination falls through to "not supported" because gating,
  dispatch, and the `HtmlFileExtension` union key on `.html` only.
- **Approach:** thread `.htm` through the four-site extension sync (`types/file-extension.ts` →
  `constants/extensions.ts` `CROSS_IMPORT_DESTINATIONS` → `snippets/dispatch.ts` →
  `snippets/variants.ts`), plus `gating.ts` (HTML-destination clauses), `editor/placement.ts`
  (`shouldRepositionCursor`), and `snippets/_react.ts` (asset switch, for a `.htm` source into
  JSX/TSX/MDX). Pure alias — no criteria re-application; it inherits the HTML audit in
  `import-statement-design/statements.md`.
- **Coupling:** best landed alongside/after item 2 (both reshape HTML-destination gating), so the HTML
  destination story is settled once. Propagates to the `drag-import-relative-path` mirror on re-sync.

## 2. `<a href>` hyperlink support  ·  *v1.1.0*

Drag or paste a navigable file (HTML, PDF) into an HTML destination and generate an `<a href="…">`
navigation link (e.g. `<a href="link.htm">`).

- **Origin:** GitHub issue [#8](https://github.com/ElecTreeFrying/drag-import-relative-path/issues/8) —
  the reporter's literal request. This is the anchor-generation half the extension does not currently
  do: its HTML shapes are resource *embeds* (`<script>`/`<img>`/`<link>`/`<video>`/`<audio>`/`<track>`),
  not navigation links, and HTML-into-HTML is historically rejected.
- **Shape:** a new `hyperlink` import type, an `htmlLink` style setting + `HTML_LINK_IMPORT_OPTIONS`
  table, and admitting HTML/PDF as HTML sources (which makes HTML-into-HTML a supported operation).
- **Design/criteria:** needs a criteria application in `import-statement-design/` before it ships — a
  new admission (navigation `<a href>` vs. the existing resource-embed shapes): which sources count as
  "navigable", the default link shape, and lifting the html→html reject. Prototyped, then reverted
  pending that design.

## 3. Auto-detect script extension (tri-state `preserveScriptFileExtension`)  ·  *v1.2.0*

Expand the `preserveScriptFileExtension` boolean to a tri-state `never` / `always` / `auto`. The `auto`
mode detects the destination runtime (Node ESM / Bun / Deno / bundler) from
`tsconfig.json` / `package.json` / `deno.json` and rewrites `.ts` → `.js` where the runtime requires it;
it also folds in explicit ESM/CJS extensions (`.mts` / `.cts` / `.mjs` / `.cjs`).

- **Origin:** the current boolean produces broken imports for NodeNext users; flagged as a
  Tiebreaker-1 fragility tag in `import-statement-design/CRITERIA.md`.
- **Design:** `.claude/_archive/future/auto-detect-extensions.md`.
- **Migration:** `true` → `always`, `false` → `never`, unset → `never` (Phase 1+2); a later default
  flip to `auto` has its own gate.
