import * as assert from 'assert';
import * as vscode from 'vscode';

describe('extension activation', () => {
  before(async () => {
    const extension = vscode.extensions.getExtension('ElecTreeFrying.auto-import');
    await extension?.activate();
  });

  it('registers the four auto-import commands', async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes('extension.copyFilePath'), 'extension.copyFilePath not registered');
    assert.ok(commands.includes('extension.pasteImport'), 'extension.pasteImport not registered');
    assert.ok(commands.includes('extension.copyPaste'), 'extension.copyPaste not registered');
    assert.ok(commands.includes('extension.pasteImportWithStyle'), 'extension.pasteImportWithStyle not registered');
  });
});
