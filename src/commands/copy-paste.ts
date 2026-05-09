import { executeCopyFilePathCommand, executePasteImportCommand } from '.';

/** Runs the copy-file-path command then the paste-import command in sequence. */
export async function executeCopyPasteCommand(): Promise<void> {
  await executeCopyFilePathCommand();
  await executePasteImportCommand();
}
