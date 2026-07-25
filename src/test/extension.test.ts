import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

describe('extension activation', () => {
  before(async () => {
    const extension = vscode.extensions.getExtension('ElecTreeFrying.auto-import');
    await extension?.activate();
  });

  // Every command carries two ids. `auto-import.*` is canonical — it is what the Command Palette lists
  // and what contributes.keybindings targets. `extension.*` shipped first and stays registered forever:
  // VS Code has no command-alias mechanism, so dropping one silently breaks any keybinding a user
  // already bound, with no error anywhere.
  const SUFFIXES = [
    'copyFilePath',
    'pasteImport',
    'copyPaste',
    'pasteImportWithStyle',
    'setDefaultImportStyle',
    'setImportPlacement',
    'togglePreserveScriptExtension',
    'resetImportStyles',
  ];
  const CANONICAL = SUFFIXES.map((suffix) => `auto-import.${suffix}`);
  const LEGACY = SUFFIXES.map((suffix) => `extension.${suffix}`);

  it('registers both id families for all eight commands', async () => {
    const commands = await vscode.commands.getCommands(true);

    for (const command of [ ...CANONICAL, ...LEGACY ]) {
      assert.ok(commands.includes(command), `${command} not registered`);
    }
  });

  // package.json ↔ registration parity. We can't compare against ALL registered `extension.*` commands
  // (VS Code ships its own, e.g. extension.bisect.*), so we pin against our canonical set: package.json
  // must declare exactly these (catches an added/removed/renamed command), and each must be registered
  // at runtime (catches a declared-but-unregistered command — a menu entry that does nothing).
  it('package.json declares exactly the sixteen ids, and all are registered', async () => {
    const ours = [ ...CANONICAL, ...LEGACY ].sort();

    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    const declared: string[] = pkg.contributes.commands.map((c: { command: string }) => c.command).sort();
    assert.deepStrictEqual(declared, ours, 'package.json contributes.commands drifted from the registered set');

    const registered = await vscode.commands.getCommands(true);
    for (const cmd of ours) {
      assert.ok(registered.includes(cmd), `declared command not registered: ${cmd}`);
    }
  });

  // The legacy family is contributed so it stays bindable, which also makes it palette-visible by
  // default — every command would then appear TWICE under an identical title. `commandPalette` with
  // `when: "false"` is the only thing suppressing that, and nothing else in the suite would notice if it
  // were dropped: the duplication is invisible to every other assertion here.
  it('hides exactly the legacy family from the Command Palette', () => {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    const hidden = (pkg.contributes.menus?.commandPalette ?? []) as { command: string; when: string }[];

    assert.deepStrictEqual(
      hidden.map((entry) => entry.command).sort(),
      [ ...LEGACY ].sort(),
      'the palette-hide list drifted from the legacy id family',
    );
    for (const entry of hidden) {
      assert.strictEqual(entry.when, 'false', `${entry.command} must be hidden with when: "false"`);
    }
  });

  // Keybindings parity: the three keybound commands documented in the root CLAUDE.md must each have a
  // contributes.keybindings entry (cmd/ctrl+shift+a, cmd/ctrl+i, alt+d). They target the canonical
  // family — a binding on a palette-hidden legacy id would still work, but the shortcuts editor would
  // show the user an id the docs never mention.
  it('declares keybindings for the three keybound commands, on the canonical ids', () => {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    const boundCommands = new Set((pkg.contributes.keybindings ?? []).map((k: { command: string }) => k.command));

    assert.ok(boundCommands.has('auto-import.copyFilePath'), 'missing keybinding for copyFilePath');
    assert.ok(boundCommands.has('auto-import.pasteImport'), 'missing keybinding for pasteImport');
    assert.ok(boundCommands.has('auto-import.copyPaste'), 'missing keybinding for copyPaste');

    const legacyBound = [ ...boundCommands ].filter((command) => (command as string).startsWith('extension.'));
    assert.deepStrictEqual(legacyBound, [], 'keybindings should target the canonical auto-import.* ids');
  });
});
