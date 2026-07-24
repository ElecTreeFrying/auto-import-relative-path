// Mocha config for the ExTester UI suite (`npm run qa:ui`). The headless suite is configured
// separately in .vscode-test.mjs — this file governs only out/test/ui/**/*.ui-test.js.
module.exports = {
  ui: 'bdd',
  color: true,
  timeout: 120000, // the first test absorbs workbench + extension warm-up
  slow: 15000,
  retries: 1, // absorbs one-shot animation/focus races; deterministic failures still fail twice
  bail: false, // report the whole board, not the first red square
};
