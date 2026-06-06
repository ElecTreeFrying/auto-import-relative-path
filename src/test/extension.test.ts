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

  it('registers the eight auto-import commands', async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes('extension.copyFilePath'), 'extension.copyFilePath not registered');
    assert.ok(commands.includes('extension.pasteImport'), 'extension.pasteImport not registered');
    assert.ok(commands.includes('extension.copyPaste'), 'extension.copyPaste not registered');
    assert.ok(commands.includes('extension.pasteImportWithStyle'), 'extension.pasteImportWithStyle not registered');
    assert.ok(commands.includes('extension.setDefaultImportStyle'), 'extension.setDefaultImportStyle not registered');
    assert.ok(commands.includes('extension.setImportPlacement'), 'extension.setImportPlacement not registered');
    assert.ok(commands.includes('extension.togglePreserveScriptExtension'), 'extension.togglePreserveScriptExtension not registered');
    assert.ok(commands.includes('extension.resetImportStyles'), 'extension.resetImportStyles not registered');
  });

  // package.json ↔ registration parity. We can't compare against ALL registered `extension.*` commands
  // (VS Code ships its own, e.g. extension.bisect.*), so we pin against our canonical set: package.json
  // must declare exactly these (catches an added/removed/renamed command), and each must be registered
  // at runtime (catches a declared-but-unregistered command — a menu entry that does nothing).
  it('package.json declares exactly the eight commands, and all are registered', async () => {
    const ours = [
      'extension.copyFilePath',
      'extension.pasteImport',
      'extension.copyPaste',
      'extension.pasteImportWithStyle',
      'extension.setDefaultImportStyle',
      'extension.setImportPlacement',
      'extension.togglePreserveScriptExtension',
      'extension.resetImportStyles',
    ].sort();

    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    const declared: string[] = pkg.contributes.commands.map((c: { command: string }) => c.command).sort();
    assert.deepStrictEqual(declared, ours, 'package.json contributes.commands drifted from the registered set');

    const registered = await vscode.commands.getCommands(true);
    for (const cmd of ours) {
      assert.ok(registered.includes(cmd), `declared command not registered: ${cmd}`);
    }
  });

  // Keybindings parity: the three keybound commands documented in the root CLAUDE.md must each have a
  // contributes.keybindings entry (cmd/ctrl+shift+a, cmd/ctrl+i, alt+d).
  it('declares keybindings for the three keybound commands', () => {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    const boundCommands = new Set((pkg.contributes.keybindings ?? []).map((k: { command: string }) => k.command));

    assert.ok(boundCommands.has('extension.copyFilePath'), 'missing keybinding for copyFilePath');
    assert.ok(boundCommands.has('extension.pasteImport'), 'missing keybinding for pasteImport');
    assert.ok(boundCommands.has('extension.copyPaste'), 'missing keybinding for copyPaste');
  });
});
