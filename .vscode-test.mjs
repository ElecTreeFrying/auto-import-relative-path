import { defineConfig } from '@vscode/test-cli';
import os from 'node:os';
import path from 'node:path';

// VS Code's default user-data-dir lives inside the project (.vscode-test/user-data). On deep project
// paths that pushes the Extension Host IPC socket past macOS's ~103-char unix-socket limit
// (listen EINVAL: ...-main.sock). Relocate it to a short temp path so `npm test` runs anywhere.
const userDataDir = path.join(os.tmpdir(), 'auto-import-vscode-test');

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
      launchArgs: [ '--user-data-dir', userDataDir ],
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
