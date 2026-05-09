import { executeCopyFilePath, executePasteImport } from '.';

/** Runs the copy-file-path command then the paste-import command in sequence. */
export async function executeCopyPaste(): Promise<void> {
  await executeCopyFilePath();
  await executePasteImport();
}
