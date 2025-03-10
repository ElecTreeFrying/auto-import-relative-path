import { executeCopyFilePathCommand } from './copy-file-path.command';
import { executePasteImportCommand } from './paste-import.command';

/**
 * Performs a two-step process:
 * 1. Copies the active file path to the clipboard.
 * 2. Pastes/imports that path into the current file (if supported).
 */
export async function executeCopyPasteCommand(): Promise<void> {

  console.log('\n\n@@@ ', 'Command start: executeCopyPasteCommand');  

  await executeCopyFilePathCommand();
  await executePasteImportCommand();
}
