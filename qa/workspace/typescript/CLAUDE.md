# qa/workspace/typescript/CLAUDE.md

Fixtures for `checklists/typescript.md` — the `.ts` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `typescript.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `typescript.md`.

## Layout

```
typescript/
├── src/                        Source files (copy/drag FROM these)
│   ├── foo.ts                  Plain source — no export class, no Angular suffix
│   ├── bar.ts                  Primary paste destination
│   ├── helpers.ts              Non-Angular, no export class
│   ├── angular/                Angular-convention files (NO export class)
│   │   ├── app-root.component.ts
│   │   ├── highlight.directive.ts
│   │   ├── trim.pipe.ts
│   │   ├── user.service.ts
│   │   ├── auth.module.ts
│   │   ├── 2fa.service.ts      Angular suffix, illegal derived id (leading digit) → bare $1 (5.B.11)
│   │   └── dest.ts             Same-directory destination for section 5.B.10
│   ├── classes/                Files WITH export class declarations
│   │   ├── event-bus.ts        export class EventBus
│   │   ├── base-service.ts     export abstract class BaseService
│   │   ├── commented-class.ts  // export class FakeClass (commented out)
│   │   ├── block-commented-class.ts  /* export class FakeClass */ (block comment)
│   │   ├── multi-class.ts      export class First + export class Second
│   │   ├── default-class.ts    export default class Widget (NOT detected)
│   │   ├── app-root.component.ts     export class AppRoot (Angular name WITH class)
│   │   └── tsx-dest.tsx        .tsx destination for §5.A.9 (class detection is .ts-dest-only)
│   ├── components/
│   │   ├── widget.ts           Extra fixture, not directly referenced
│   │   └── ui/
│   │       └── button.ts       Extra fixture, not directly referenced
│   └── utils/
│       └── helpers/
│           └── format.ts       Extra fixture, not directly referenced
├── destinations/               Pre-filled paste destinations (placement tests)
│   ├── empty.ts                0 bytes
│   ├── whitespace-only.ts      Blank lines only
│   ├── with-imports.ts         Two import lines + code
│   ├── with-require.ts         const fs = require('fs')
│   ├── commented-imports.ts    Commented import + real import
│   ├── comments-only.ts        Only comment lines
│   ├── multiline-comment.ts    Import + /* block comment */ + code
│   ├── comment-group.ts        Three consecutive // comment lines
│   ├── single-comment.ts       Single comment line
│   ├── string-with-import.ts   "import" inside a string literal
│   ├── mixed-imports.ts        import + require mixed
│   └── large-file.ts           520 lines — imports at top, padding below
├── rejected/                   Non-.ts sources for gating rejection tests
│   ├── widget.tsx
│   ├── sibling.js
│   ├── badge.jsx
│   ├── global.css
│   ├── main.scss
│   ├── index.html
│   ├── notes.md
│   ├── logo.png                (empty placeholder)
│   ├── config.json
│   ├── config.yaml
│   ├── font.woff2              (empty placeholder)
│   ├── icon.svg
│   ├── video.mp4               (empty placeholder)
│   ├── audio.mp3               (empty placeholder)
│   ├── subs.vtt
│   ├── doc.pdf                 (empty placeholder)
│   ├── page.mdx
│   ├── App.vue
│   ├── App.svelte
│   ├── App.astro
│   ├── sample.tex
│   ├── refs.bib
│   └── diagram.eps
└── Makefile                    No file extension (copy/Alt+D rejection test)
```

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Source files to copy/drag FROM. Contains plain `.ts` files, Angular-convention files (no `export class`), and files WITH `export class` declarations. Also used as paste destinations for some tests. |
| `destinations/` | Pre-filled `.ts` files for placement tests. Each file has specific content (imports, comments, code) that the checklist expects. **Undo after each paste** so the file returns to its expected state. |
| `rejected/` | Non-`.ts` files (one per rejected extension) for gating rejection tests. Most are empty placeholders — content doesn't matter, only the file extension. |

## Fixture content expectations

- **`src/classes/*.ts`** — must contain real `export class` declarations (or commented-out versions) matching what the checklist specifies. The class name detection reads actual file content.
- **`src/angular/*.ts`** — must NOT contain `export class` (otherwise class detection takes priority over Angular PascalCase naming). The checklist tests the fallthrough path.
- **`destinations/*.ts`** — content matters. The checklist specifies exact file contents and expected insertion line numbers. Do not change these files without updating the checklist.
- **`rejected/*`** — content is irrelevant. Only the file extension matters for gating tests. Binary-type files (`.png`, `.mp4`, `.woff2`, `.mp3`, `.pdf`) are empty placeholders. The `.tex`/`.bib`/`.eps` reject stubs each carry a short self-documenting header naming the checklist case they exercise (§1.22–§1.24); content is still irrelevant to gating.
