import { defineConfig } from '@vscode/test-cli';

// Coverage is read ONLY from the `{ tests, coverage }` global form — a single-object
// config silently drops it (see @vscode/test-cli config loader). Coverage is opt-in via the
// `--coverage` flag (npm run test:coverage); a plain `npm test` ignores this block.
export default defineConfig({
  tests: [
    {
      files: 'out/test/**/*.test.js',
      mocha: {
        ui: 'bdd',
      },
    },
  ],
  coverage: {
    // Count every source file, not just those imported at runtime, so files with zero
    // tests surface as 0% instead of vanishing from the denominator.
    includeAll: true,
    // src/types/** is type-only (unions, no runtime statements) — including it reports a
    // phantom 0% that understates real coverage. The compiler is its test.
    exclude: [ '**/test/**', '**/*.test.*', '**/types/**' ],
    reporter: [ 'text', 'html' ],
  },
});
