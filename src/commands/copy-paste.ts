import { executeCopyFilePath, executePasteImport } from '.';

/** Runs the copy-file-path command then the paste-import command in sequence. Bails when copy fails so paste-import does not run against stale clipboard. */
export async function executeCopyPaste(): Promise<void> {
  const ok = await executeCopyFilePath();
  if (!ok) {
    return;
  }
  await executePasteImport();
}
