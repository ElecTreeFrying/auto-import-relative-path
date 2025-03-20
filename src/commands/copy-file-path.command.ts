import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Copies the active file's path to the clipboard and displays a notification.
 *
 * 1. Clears all notifications.
 * 2. Executes the built-in `copyFilePath` command.
 * 3. Reads the file path from the clipboard.
 * 4. Shows a message indicating that the file path was copied.
 * 5. Writes the path back to the clipboard (ensuring consistency).
 */
export async function executeCopyFilePathCommand(): Promise<void> {

  // Clear existing notifications
  vscode.commands.executeCommand('notifications.clearAll');

  // Copy the active file path to the clipboard
  vscode.commands.executeCommand('copyFilePath');
  
  // Read the file path from the clipboard
  const filePath = await vscode.env.clipboard.readText();

  // Show a confirmation message
  vscode.window.showInformationMessage(`Auto Import: Copied ${path.basename(filePath)}`);

  // Write the file path back to the clipboard
  vscode.env.clipboard.writeText(filePath);
}
