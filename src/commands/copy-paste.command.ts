import { executeCopyFilePathCommand, executePasteImportCommand } from '.';

/**
 * Performs a two-step process:
 * 1. Copies the active file path to the clipboard.
 * 2. Pastes/imports that path into the current file (if supported).
 */
export async function executeCopyPasteCommand(): Promise<void> {

  await executeCopyFilePathCommand();
  await executePasteImportCommand();
}
