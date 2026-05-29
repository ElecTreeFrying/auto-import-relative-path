# qa.new/workspace/typescript/

Fixtures for the TypeScript destination checklist ([`checklists/typescript.md`](../../checklists/typescript.md)).

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
│   │   └── dest.ts             Same-directory destination for section 6.10
│   ├── classes/                Files WITH export class declarations
│   │   ├── event-bus.ts        export class EventBus
│   │   ├── base-service.ts     export abstract class BaseService
│   │   ├── commented-class.ts  // export class FakeClass (commented out)
│   │   ├── block-commented-class.ts  /* export class FakeClass */ (block comment)
│   │   ├── multi-class.ts      export class First + export class Second
│   │   ├── default-class.ts    export default class Widget (NOT detected)
│   │   └── app-root.component.ts     export class AppRoot (Angular name WITH class)
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
│   └── App.astro
├── edge-cases/                 Special filenames
│   ├── komponent-日本語.ts      Unicode characters in filename
│   └── my folder/
│       └── spaced.ts           Spaces in directory path
└── Makefile                    No file extension (copy/Alt+D rejection test)
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/foo.ts` | 1.1, 2, 4, 10.1, 10.3–10.6, 10.9 | Plain `.ts` source (happy-path paste, all 7 styles, DnD) |
| `src/bar.ts` | 2, 4, 5, 6, 10 | Primary paste/drop destination |
| `src/helpers.ts` | 6.7 | Non-Angular basename — verify no auto-fill |
| `src/angular/app-root.component.ts` | 6.1, 6.8, 6.9 | Angular `.component` WITHOUT export class |
| `src/angular/highlight.directive.ts` | 6.2 | Angular `.directive` WITHOUT export class |
| `src/angular/trim.pipe.ts` | 6.3 | Angular `.pipe` WITHOUT export class |
| `src/angular/user.service.ts` | 6.4, 5.7, 10.8 | Angular `.service` WITHOUT export class |
| `src/angular/auth.module.ts` | 6.5, 6.10 | Angular `.module` WITHOUT export class |
| `src/angular/dest.ts` | 6.10 | Same-directory destination for Angular same-dir test |
| `src/classes/event-bus.ts` | 5.1, 5.9, 8.3, 10.7 | `export class EventBus` — class detection |
| `src/classes/base-service.ts` | 5.2 | `export abstract class BaseService` |
| `src/classes/commented-class.ts` | 5.3 | `// export class FakeClass` — must NOT detect |
| `src/classes/block-commented-class.ts` | 5.4 | `/* export class FakeClass */` — must NOT detect |
| `src/classes/multi-class.ts` | 5.5 | Two exported classes — only first detected |
| `src/classes/default-class.ts` | 5.8 | `export default class Widget` — must NOT detect |
| `src/classes/app-root.component.ts` | 5.6 | Angular name WITH `export class AppRoot` — class wins |
| `src/components/widget.ts` | — | Child directory source (extra fixture, not directly referenced) |
| `src/components/ui/button.ts` | — | Deep traversal destination (extra fixture) |
| `src/utils/helpers/format.ts` | — | Deep traversal source (extra fixture) |
| `destinations/empty.ts` | 7.1.1, 11.1 | Empty file — Bottom falls back to line 0 |
| `destinations/whitespace-only.ts` | 11.2 | Blank lines only — no markers found |
| `destinations/with-imports.ts` | 7.1.2, 7.2.1, 7.3.1, 7.3.2, 7.3.5, 10.3, 10.4 | Two imports + code — placement tests |
| `destinations/with-require.ts` | 7.1.3 | `require()` — Bottom detects as import marker |
| `destinations/commented-imports.ts` | 7.1.4 | Comment skipping — Bottom ignores commented import |
| `destinations/comments-only.ts` | 7.1.5 | Only comments — Bottom falls back to line 0 |
| `destinations/multiline-comment.ts` | 7.3.3, 10.5.2 | Cursor inside `/* */` block — adjusts above block |
| `destinations/comment-group.ts` | 7.3.4 | Cursor on `//` line — adjusts above group |
| `destinations/single-comment.ts` | 7.3.7, 10.5.1 | Single isolated `//` comment — no block adjustment |
| `destinations/string-with-import.ts` | 11.4 | `import` inside string literal — known heuristic |
| `destinations/mixed-imports.ts` | 11.5 | `import` + `require` mixed — Bottom finds last |
| `destinations/large-file.ts` | 11.3 | 520 lines — Bottom still finds imports at top |
| `rejected/*` (20 files) | 1.2–1.21, 10.2 | Every non-`.ts` extension for gating rejection |
| `edge-cases/komponent-日本語.ts` | — | Unicode characters (tested via general.md) |
| `edge-cases/my folder/spaced.ts` | — | Spaces in directory path (tested via general.md) |
| `Makefile` | — | No file extension (tested via general.md) |

## File count

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/` | 19 | Sources + primary destinations |
| `destinations/` | 12 | Pre-filled placement-test destinations |
| `rejected/` | 20 | Non-`.ts` sources for gating tests |
| `edge-cases/` | 2 | Unicode and spaces in path |
| Root | 1 | `Makefile` (no extension) |
| **Total** | **54** |
