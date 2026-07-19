# Roadmap

Planned work for upcoming releases of **Auto Import Relative Path**. Nothing here has shipped yet — scope, shape, and ordering may change. For what *has* shipped, see [`CHANGELOG.md`](CHANGELOG.md).

## To Do — v1.1.0

- **Drag-and-drop always lands on its own line.** A dropped import is placed on a fresh line above the drop point, never spliced into the middle of the line it lands on.

## Planned — future releases

- **Auto-detect the script import extension.** A `never` / `always` / `auto` setting that reads the destination project's runtime (Deno, TypeScript NodeNext, Node ESM, browser ESM) and emits — and rewrites — the correct extension automatically. *(Review checkpoint: December 2026.)*
- **PascalCase auto-naming for framework components.** Derive the conventional PascalCase identifier for Vue, Svelte, and Astro default imports (`my-button.vue` → `import MyButton from './my-button.vue'`).
- **Stylesheet sources into framework SFCs.** Import `.css` / `.scss` into `.vue` / `.svelte` / `.astro`, choosing the right shape for where the cursor sits (`<script>` vs `<style>` block).
- **Framework components into plain `.ts` / `.js`.** Import `.vue` / `.svelte` / `.astro` sources into TypeScript and JavaScript files (common in test and setup code).
- **Markdown / MDX sources into Vue and Svelte.** Import `.md` / `.mdx` as components into Vue and Svelte destinations (Astro already supports this).

---

*Have a request, or want to help build one of these? Open an issue or a pull request.*
