# qa/workspace/typescript/

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
│   └── App.astro
└── Makefile                    No file extension (copy/Alt+D rejection test)
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/foo.ts` | 1.1, 2, 4, 9.1, 9.3–9.6, 9.9, 9.10 | Plain `.ts` source (happy-path paste, all 7 styles + drift, DnD, drop precondition) |
| `src/bar.ts` | 2, 4, 5, 6, 9 | Primary paste/drop destination |
| `src/helpers.ts` | 5.B.7 | Non-Angular basename — verify no auto-fill |
| `src/angular/app-root.component.ts` | 5.B.1, 5.B.8, 5.B.9 | Angular `.component` WITHOUT export class |
| `src/angular/highlight.directive.ts` | 5.B.2 | Angular `.directive` WITHOUT export class |
| `src/angular/trim.pipe.ts` | 5.B.3 | Angular `.pipe` WITHOUT export class |
| `src/angular/user.service.ts` | 5.B.4, 5.A.7, 9.8 | Angular `.service` WITHOUT export class |
| `src/angular/auth.module.ts` | 5.B.5, 5.B.10 | Angular `.module` WITHOUT export class |
| `src/angular/2fa.service.ts` | 5.B.11 | Angular suffix, illegal derived identifier (leading digit) → bare `$1` |
| `src/angular/dest.ts` | 5.B.10 | Same-directory destination for Angular same-dir test |
| `src/classes/event-bus.ts` | 4 (drift), 5.A.1, 5.A.9, 7.3, 9.7 | `export class EventBus` — class detection |
| `src/classes/base-service.ts` | 5.A.2 | `export abstract class BaseService` |
| `src/classes/commented-class.ts` | 5.A.3 | `// export class FakeClass` — must NOT detect |
| `src/classes/block-commented-class.ts` | 5.A.4 | `/* export class FakeClass */` — must NOT detect |
| `src/classes/multi-class.ts` | 5.A.5 | Two exported classes — only first detected |
| `src/classes/default-class.ts` | 5.A.8 | `export default class Widget` — must NOT detect |
| `src/classes/app-root.component.ts` | 5.A.6 | Angular name WITH `export class AppRoot` — class wins |
| `src/classes/tsx-dest.tsx` | 5.A.9 | `.tsx` destination — proves exported-class detection is `.ts`-dest-only |
| `src/components/widget.ts` | — | Child directory source (extra fixture, not directly referenced) |
| `src/components/ui/button.ts` | — | Deep traversal destination (extra fixture) |
| `src/utils/helpers/format.ts` | — | Deep traversal source (extra fixture) |
| `destinations/empty.ts` | 6.1.1, 10.1 | Empty file — Bottom falls back to line 1 |
| `destinations/whitespace-only.ts` | 10.2 | Blank lines only — no markers found |
| `destinations/with-imports.ts` | 6.1.2, 6.2.1, 6.3.1, 6.3.2, 6.3.5, 9.3, 9.4 | Two imports + code — placement tests |
| `destinations/with-require.ts` | 6.1.3 | `require()` — Bottom detects as import marker |
| `destinations/commented-imports.ts` | 6.1.4 | Comment skipping — Bottom ignores commented import |
| `destinations/comments-only.ts` | 6.1.5 | Only comments — Bottom falls back to line 1 |
| `destinations/multiline-comment.ts` | 6.3.3, 9.5.2 | Cursor inside `/* */` block — adjusts above block |
| `destinations/comment-group.ts` | 6.3.4 | Cursor on `//` line — adjusts above group |
| `destinations/single-comment.ts` | 6.3.7, 9.5.1 | Single isolated `//` comment — no block adjustment |
| `destinations/string-with-import.ts` | 10.4 | `import` inside string literal — NOT a Bottom marker (line-leading only) |
| `destinations/mixed-imports.ts` | 10.5 | `import` + `require` mixed — Bottom finds last |
| `destinations/large-file.ts` | 10.3 | 520 lines — Bottom still finds imports at top |
| `rejected/*` (20 files) | 1.2–1.21, 9.2 | Every non-`.ts` extension for gating rejection |
| `Makefile` | — | No file extension (tested via general.md) |

## File count

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/` | 21 | Sources + primary destinations |
| `destinations/` | 12 | Pre-filled placement-test destinations |
| `rejected/` | 20 | Non-`.ts` sources for gating tests |
| Root | 1 | `Makefile` (no extension) |
| **Total** | **54** |
