# QA Checklist — `.css` destination

Manual QA for generating relative-path imports **into `.css` files**. Run inside the
Extension Development Host (**F5**) against the `qa.new/workspace/css/` fixtures.

> **Checkbox tier — these `[ ]` boxes are yours (the human tester).** Tick them as you
> run each case in the EDH. The generation pipeline never touches them.

> **Assumes `general.md` has passed.** This checklist covers only the `.css`-specific
> DELTA. Cross-destination behavior — Copy File Path, clipboard validation, same-file
> rejection, notification wording + toast buttons, path computation — and the *universal*
> mechanics of **Pick Style** (`general.md §9`), **Set Default Import Style**
> (`general.md §10`), and **Drag-and-drop** (`general.md §8`) are owned by `general.md`
> and not retested here.

## `.css` at a glance

The first **stylesheet** destination and the first **source-type-dispatched** destination
— so every applicable section forks into two arms:

- **Two source branches.** A **stylesheet** source (`.css`) → `@import` (2 styles); an
  **image** source (`.gif .jpeg .jpg .png .svg .avif .webp`) → a fixed `url('<path>')`
  shape (not configurable).
- **No tab stops.** Every `.css` snippet is a literal string — the cursor never lands in a
  `$1`/`${1:…}` placeholder. (A real delta from the JS/TS script destinations.)
- **Extension always kept.** `@import './theme.css';`, never `./theme`. `.css` reads **no**
  preserve setting.
- **Two placement modes.** stylesheet source → column-0 statement (Top/Bottom/Cursor
  honored, Bottom anchors on the last `@import`/`@use`/`@forward` line); image source →
  inline `url()` at the **exact** cursor, no trailing newline, **placement ignored**.
- **Gating: allow-list** (`.css` + image). One-way: SCSS imports CSS, but **CSS rejects
  `.scss`**.

## Gestures (universal — see `general.md`)

| Action | Gesture | Command title |
|--------|---------|---------------|
| Copy File Path | select source, **`Cmd/Ctrl+Shift+A`** | `Auto Import: Copy File Path` |
| Paste as Import | in destination, **`Cmd/Ctrl+I`** | `Auto Import: Paste as Import` |
| Insert from Selected File | Explorer select, **`Alt+D`** | `Auto Import: Insert Import from Selected File` |
| Paste as Import (Pick Style) | Command Palette (or **Paste with Style** on the copy toast) | `Auto Import: Paste as Import (Pick Style)` |
| Set Default Import Style | Command Palette | `Auto Import: Set Default Import Style` |

A **paste** is always three ordered steps: **copy the source path** → **focus the
destination** → **`Cmd/Ctrl+I`**. After any case that mutates a file, press **`Cmd+Z`** to
restore before the next case. After any case that changes a setting, restore it to its
default.

## Fixtures — `qa.new/workspace/css/`

> Created in session **5b**. The content below is both the spec for that session and the
> expected state for every step in this checklist.

```
css/
├── app.css                     # primary paste/drop target
├── theme.css                   # stylesheet source  → @import './theme.css';
├── logo.png                    # image source       → url('./logo.png')
├── vendor/
│   └── normalize.css           # nested stylesheet source (basename-collapse demo)
├── placement/
│   ├── with-imports.css        # target with existing @import lines (Bottom anchor)
│   ├── with-comment-block.css  # target with a /* */ block (Cursor adjustment)
│   ├── widget.css              # stylesheet source for placement tests → ./widget.css
│   └── with-use.css            # target with a @use line (shared-marker edge, §10.2)
└── rejects/                    # one source per rejected category
```

**`css/app.css`** — paste/drop target (the `background-image:` slot is the inline-`url()` spot):

```css
/* Application styles. */
.hero {
  background-image: ;
}
```

**`css/theme.css`** — stylesheet source:

```css
:root {
  --brand: #4f46e5;
}
```

**`css/logo.png`** — image source: any small raster image (e.g. a 1×1 PNG). Binary
content is irrelevant; only the `.png` extension matters.

**`css/vendor/normalize.css`** — nested stylesheet source:

```css
html { line-height: 1.15; }
```

**`css/placement/with-imports.css`** — target with existing imports (note: one quoted, one
`url()` form, to exercise both Bottom anchors). The `./reset.css` / `./tokens.css` targets
are text anchors only and need not exist:

```css
@import './reset.css';
@import url('./tokens.css');

body { margin: 0; }
```

**`css/placement/with-comment-block.css`** — target with a multi-line block comment:

```css
/*
 * Theme overrides.
 * Tune these per brand.
 */
.button { color: var(--brand); }
```

**`css/placement/widget.css`** — stylesheet source for placement tests:

```css
.widget { display: grid; }
```

**`css/placement/with-use.css`** — target with a Sass-style `@use` line (the `@use` /
`@forward` markers are shared with `.scss`):

```css
@use './tokens.css';
.card { padding: 1rem; }
```

**`css/rejects/*`** — one zero-content source per rejected category (content is irrelevant;
gating keys on the extension): `styles.scss`, `util.ts`, `widget.vue`, `page.html`,
`notes.md`, `data.json`, `config.yaml`, `clip.mp4`, `chime.mp3`, `captions.vtt`,
`body.woff2`, `manual.pdf`.

---

## §1 — Cross-import gating matrix

`.css` is an **allow-list** destination: it accepts `.css` + every image extension and
rejects everything else. Each reject shows a warning toast and inserts nothing.

- [ ] **§1.1 — Accepted sources** (into `css/app.css`):

  | Source | Type | `Cmd/Ctrl+I` inserts |
  |--------|------|----------------------|
  | `css/theme.css` | stylesheet | `@import './theme.css';` |
  | `css/logo.png` | image | `url('./logo.png')` (inline at cursor) |

  The image row stands in for all seven image extensions
  (`.gif .jpeg .jpg .png .svg .avif .webp`) — each behaves identically.

- [ ] **§1.2 — Rejected sources** (into `css/app.css`): each shows
  `Auto Import: Cannot import .X into .css files.` (warning toast, with a **View Supported
  Files** button) and inserts **nothing**.

  | Source | Reject category | Verbatim toast |
  |--------|-----------------|----------------|
  | `css/rejects/styles.scss` | **stylesheet (one-way)** | `Auto Import: Cannot import .scss into .css files.` |
  | `css/rejects/util.ts` | script | `Auto Import: Cannot import .ts into .css files.` |
  | `css/rejects/widget.vue` | framework | `Auto Import: Cannot import .vue into .css files.` |
  | `css/rejects/page.html` | html | `Auto Import: Cannot import .html into .css files.` |
  | `css/rejects/notes.md` | markdown | `Auto Import: Cannot import .md into .css files.` |
  | `css/rejects/data.json` | data | `Auto Import: Cannot import .json into .css files.` |
  | `css/rejects/config.yaml` | data (yaml) | `Auto Import: Cannot import .yaml into .css files.` |
  | `css/rejects/clip.mp4` | video | `Auto Import: Cannot import .mp4 into .css files.` |
  | `css/rejects/chime.mp3` | audio | `Auto Import: Cannot import .mp3 into .css files.` |
  | `css/rejects/captions.vtt` | text-track | `Auto Import: Cannot import .vtt into .css files.` |
  | `css/rejects/body.woff2` | font | `Auto Import: Cannot import .woff2 into .css files.` |
  | `css/rejects/manual.pdf` | document | `Auto Import: Cannot import .pdf into .css files.` |

- [ ] **§1.3 — One-way `.scss` ↔ `.css` asymmetry.** The `css/rejects/styles.scss` row above
  is **mandatory**: a `.scss` source is rejected by a `.css` destination, even though the
  reverse (a `.css` source into a `.scss` destination) is accepted. CSS has no `@use`/Sass
  module system, so it cannot consume `.scss`.

---

## §2 — Paste as Import (happy path)

One case per source branch, using the **default** style (`@import '_relativePath_';`) and
default settings. (Where the import lands is §6; here, assert the inserted string.)

- [ ] **§2.1 — stylesheet source.** Select `css/theme.css` in the Explorer →
  `Cmd/Ctrl+Shift+A` (Copy File Path) → focus `css/app.css` → `Cmd/Ctrl+I`. Inserts:

  ```css
  @import './theme.css';
  ```

  **No tab stop** — after insertion the cursor does not sit inside a placeholder. `Cmd+Z`.

- [ ] **§2.2 — image source.** Copy `css/logo.png` → in `css/app.css`, click to place the
  cursor right after `background-image: ` (inside the `.hero` rule) → `Cmd/Ctrl+I`. The
  value is inserted **inline at the exact cursor, with no trailing newline**:

  ```css
    background-image: url('./logo.png');
  ```

  `Cmd+Z`.

---

## §3 — Insert Import from Selected File (`Alt+D`)

- [ ] **§3.1.** With `css/app.css` open as the active editor, select `css/theme.css` in the
  Explorer and press **`Alt+D`** (`Auto Import: Insert Import from Selected File`). In one
  gesture (no separate copy) it inserts the §2.1 string into `app.css`:

  ```css
  @import './theme.css';
  ```

  `Cmd+Z`.

---

## §4 — All styles + image arm + style-name drift

`.css` exposes **N = 2** configurable stylesheet styles (`cssImportStyle`), plus the fixed
image `url()` shape (not counted among the 2). All shapes have **no tab stop**.

- [ ] **§4.1 — Style 0 (default)** `@import '_relativePath_';`. With `cssImportStyle` at its
  default, copy `css/theme.css` → `Cmd/Ctrl+I` → `@import './theme.css';` (no tab stop).
  `Cmd+Z`.

- [ ] **§4.2 — Style 1** `@import url('_relativePath_');`. Set
  `auto-import.importStatement.styleSheet.cssImportStyle` = `@import url('_relativePath_');`
  → copy `css/theme.css` → `Cmd/Ctrl+I` →

  ```css
  @import url('./theme.css');
  ```

  No tab stop. Restore the setting to default.

- [ ] **§4.3 — Image fixed arm.** The image shape is **not configurable** (the
  `cssImageImportStyle` setting has a single value). Regardless of `cssImportStyle`, copy
  `css/logo.png` → paste into a value slot → always `url('./logo.png')`. (One shape, no
  picker, no styles to enumerate.)

- [ ] **§4.4 — Extension always kept (no preserve toggle).** The `@import` path always keeps
  the source extension — `@import './theme.css';`, never `./theme`. `css.ts` reads **neither**
  `preserveScriptFileExtension` nor `preserveStylesheetFileExtension`, so — unlike `.scss` —
  there is **no** preserve-toggle case to run for a `.css` destination. (A note, not a test.)

- [ ] **§4.5 — Style-name drift → style-0 fallback.** Set
  `auto-import.importStatement.styleSheet.cssImportStyle` to a string matching **no** enum
  value (e.g. `@import "_relativePath_";` with double quotes, or `banana`) — as if
  hand-typed into `settings.json`. Copy `css/theme.css` → `Cmd/Ctrl+I` → the import still
  inserts using the **style-0 shape** `@import './theme.css';` (never nothing). This is
  style-**name** drift (resolves to the builder's `default:` arm); distinct from the
  style-**count** check. Restore the setting to default.

---

> **§5 (Smart identifier) — N/A for `.css`:** no exported-class detection, no Angular
> PascalCase (`smartId: none`). No style pre-fills an identifier; every shape is a literal
> string with no tab stop. §5 is intentionally **absent** — the §4 → §6 gap is the signal.

---

## §6 — Placement

Two modes. Default `importStatementPlacement` is **Bottom**. `.css` statement imports are
forced to **column 0**.

**stylesheet mode** (`.css` source — honors Top/Bottom/Cursor, column 0):

- [ ] **§6.1 — Top.** Set `Import statement placement` = `Top`. Open
  `css/placement/with-imports.css`, copy `css/placement/widget.css`, `Cmd/Ctrl+I` →
  `@import './widget.css';` is inserted at **line 0**, before `@import './reset.css';`,
  column 0. `Cmd+Z`; restore the setting.

- [ ] **§6.2 — Bottom (anchor).** Set placement = `Bottom`. Same files → `@import
  './widget.css';` is inserted **after the last import line** — after
  `@import url('./tokens.css');` and before the blank line / `body` rule — column 0.
  (Bottom anchors on the shared markers `@import '` · `@import url(` · `@use '` ·
  `@forward '` · `import ` · `require(`; here the last anchor is the `url()` form.) `Cmd+Z`;
  restore.

- [ ] **§6.3 — Cursor, comment-block adjustment.** Set placement = `Cursor`. Open
  `css/placement/with-comment-block.css`, click inside the block comment (e.g. on the
  `* Tune these per brand.` line), copy `css/placement/widget.css`, `Cmd/Ctrl+I` → the
  import is pushed **above the whole `/* … */` block** (inserted at the `/*` line), not
  inside it. `Cmd+Z`; restore.

- [ ] **§6.4 — Cursor, plain line.** Placement = `Cursor`. In the same file, click on the
  `.button { … }` rule (a non-comment line) → the import inserts **at that line**, column 0.
  `Cmd+Z`; restore.

**inline-url mode** (image source — exact position, no newline, placement ignored):

- [ ] **§6.5 — Setting ignored.** Set placement = `Top`. Open `css/app.css`, place the
  cursor after `background-image: ` (mid-line, **not** column 0), copy `css/logo.png`,
  `Cmd/Ctrl+I` → `url('./logo.png')` lands at the **exact cursor line and column** (not line
  0, not column 0), with **no trailing newline** → `  background-image: url('./logo.png');`.
  The `Top` setting had **no effect**. `Cmd+Z`; restore the setting.

---

## §7 — Paste as Import (Pick Style) — DELTA

Universal QuickPick mechanics (placeholder `Select an import style`, escape to dismiss,
filter-by-description, clipboard validation, single-variant silent insert, one-shot
no-default-write) are **`general.md §9`** — not retested here. The `.css` delta is the
items shown.

- [ ] **§7.1 — stylesheet source: 2 items.** Copy `css/theme.css`, focus `css/app.css`, run
  `Auto Import: Paste as Import (Pick Style)`. The picker shows **exactly 2** items:

  | # | LABEL (preview, basename) | DESCRIPTION (tag) | Inserts (full path) |
  |---|---------------------------|-------------------|---------------------|
  | 1 | `@import 'theme.css';` | `@import with quoted path` | `@import './theme.css';` |
  | 2 | `@import url('theme.css');` | `@import with url() function` | `@import url('./theme.css');` |

  Assert **both**: the LABEL uses the **basename** (`theme.css`), while the INSERTED text
  uses the **full relative path** (`./theme.css`). Select item 1 → inserts
  `@import './theme.css';`. `Cmd+Z`.

- [ ] **§7.2 — basename collapse.** Copy `css/vendor/normalize.css`, focus `css/app.css`,
  run Pick Style → item 1's LABEL is `@import 'normalize.css';` (basename only — **not**
  `vendor/normalize.css`), but selecting it inserts the full path
  `@import './vendor/normalize.css';`. `Cmd+Z`.

- [ ] **§7.3 — image source: single variant (no picker).** Copy `css/logo.png`, focus
  `css/app.css`, run Pick Style. The image arm produces a **single** hardcoded variant, so
  the QuickPick is bypassed (single-variant silent insert — `general.md §9`) and
  `url('./logo.png')` is inserted **directly**. `Cmd+Z`.

---

## §8 — Set Default Import Style — DELTA

Universal mechanics (placeholder `Set default import style`, the current default spliced to
position 0 with `$(check) Current default`, escape, filter, clipboard validation, **never
inserts**) are **`general.md §10`** — not retested. The `.css` delta is the persisted
setting + the saved toast.

- [ ] **§8.1 — save a style.** Copy `css/theme.css`, focus `css/app.css`, run `Auto Import:
  Set Default Import Style`, select **`@import with url() function`** (item 2). Then:
  - info toast (verbatim): `Auto Import: Default style saved — @import url('_relativePath_');`
  - `auto-import.importStatement.styleSheet.cssImportStyle` now holds
    `@import url('_relativePath_');` (verify in Settings JSON).

  Restore the setting to its default `@import '_relativePath_';`.

- [ ] **§8.2 — toast string ≠ Pick-Style description.** The saved toast surfaces the **enum
  value string** (`@import url('_relativePath_');`), whereas the §7 picker showed that same
  style's **tag** (`@import with url() function`). Same style, two different surfaced
  strings — confirm they are not conflated.

- [ ] **§8.3 — image source: no configurable style.** Copy `css/logo.png`, focus
  `css/app.css`, run Set Default → no style is offered to save; instead a warning toast
  (verbatim): `Auto Import: .png → .css imports use a fixed style.` Nothing is written to
  settings.

---

## §9 — Drag-and-drop — DELTA

A drop reuses the **same** snippet + placement pipeline as paste, so the inserted string is
**byte-identical** to the §2 happy path. Drag the source **from the Explorer** and drop it
into the editor at a position. Universal drag-and-drop mechanics are **`general.md §8`**.

- [ ] **§9.1 — happy-path drop (stylesheet).** Drag `css/theme.css` and drop it into
  `css/app.css` → inserts `@import './theme.css';` — identical to §2.1. (With default
  Bottom and no existing imports, it lands at line 0.) `Cmd+Z`.

- [ ] **§9.2 — unsupported-pair drop.** Drag `css/rejects/styles.scss` and drop it into
  `css/app.css` → warning toast `Auto Import: Cannot import .scss into .css files.` **and no
  import is generated**. Because the drop edit resolves to `null`, VS Code falls back to its
  default text-drop and the **raw path text** lands at the drop point (distinct from paste,
  which inserts nothing at all). `Cmd+Z`.

- [ ] **§9.3 — image drop = inline `url()` at the drop position.** Drag `css/logo.png` and
  drop it inside the `background-image: ` value in `css/app.css` → `url('./logo.png')` is
  inserted at the **exact drop line and column**, with no trailing newline (placement
  setting ignored — same inline rule as §6.5). `Cmd+Z`.

- [ ] **§9.4 — placement modes on drop (stylesheet).** A stylesheet drop honors the
  placement setting exactly like paste. Set placement = `Cursor`, drop `css/placement/widget.css`
  onto a line inside `css/placement/with-comment-block.css`'s comment block → it lands
  **above** the block (re-confirming §6.3 through the drop pipeline). `Cmd+Z`; restore.

- [ ] **§9.5 — smart-id / preserve on drop: N/A.** `.css` has no smart-identifier or
  preserve-extension behavior (see the §5 marker and §4.4), so there is nothing extra to
  re-test on drop.

- [ ] **§9.6 — untitled-buffer no-op (pointer, not retested here).** The drop gesture is
  registered only for **saved** (`scheme: 'file'`) files across the 12 drop languages; a
  drop into an untitled/unsaved buffer is a no-op. This cross-cutting precondition is
  verified **once for all 12 destinations** in `typescript.md §9.10` — not duplicated here.

---

## §10 — Edge cases

- [ ] **§10.1 — inline `url()` bypasses comment-block adjustment.** Open
  `css/placement/with-comment-block.css`, click inside the block comment (the
  `* Tune these per brand.` line — the **same** position as §6.3), copy `css/logo.png`,
  `Cmd/Ctrl+I` → `url('./logo.png')` lands at the **exact cursor, inside the comment** — it is
  **not** pushed above the block. Direct contrast with §6.3, where a stylesheet `@import` at
  that same position *is* pushed above: inline mode precedes the comment-block rule. `Cmd+Z`.

- [ ] **§10.2 — shared import markers in a `.css` file.** The Bottom-anchor marker set is
  shared across stylesheets, so `@use '…'` / `@forward '…'` lines (Sass syntax) are treated as
  anchors even in a `.css` file. Open `css/placement/with-use.css`, set placement = `Bottom`,
  copy `css/theme.css`, `Cmd/Ctrl+I` → `@import './theme.css';` lands **after** the
  `@use './tokens.css';` line (line 1). Confirms the anchor set is shared, not CSS-only.
  `Cmd+Z`; restore placement.

---

## §11 — Sign-off

| Section | Cases | Covered |
|---------|:-----:|---------|
| §1 Gating matrix | 3 | accept (`.css` + image) · 12-category reject matrix · mandatory `.scss → .css` one-way |
| §2 Happy path | 2 | `@import './theme.css';` · inline `url('./logo.png')` |
| §3 Insert from Selected File | 1 | `Alt+D` → `@import './theme.css';` |
| §4 All styles + image arm + drift | 5 | style 0 · style 1 · image fixed arm · always-keep-extension · style-name drift → style 0 |
| §5 Smart identifier | — | **omitted** (`smartId: none`) |
| §6 Placement | 5 | stylesheet Top/Bottom/Cursor(×2) · inline-url setting-ignored |
| §7 Pick Style (DELTA) | 3 | 2 styled items (label=basename, insert=full) · basename collapse · single image variant |
| §8 Set Default (DELTA) | 3 | saved toast + persisted value · toast ≠ tag · image no-configurable-style |
| §9 Drag-and-drop (DELTA) | 6 | happy · unsupported (raw text) · image inline · placement · N/A smart-id · untitled pointer |
| §10 Edge cases | 2 | inline bypasses comment adjust · shared `@use`/`@forward` markers |
| **Total** | **30** | |

**Both source branches present** in §1/§2/§4/§6/§7/§8/§9 (stylesheet `@import` + image
`url()`). **No** `preserve*FileExtension` toggle test is emitted (always-preserve-css);
the always-keep-extension note lives in §4.4. **No** exported-class or Angular language
appears anywhere (§5 omitted).

- [ ] **§11.1 — Sign-off.** All cases above pass on the current build.
