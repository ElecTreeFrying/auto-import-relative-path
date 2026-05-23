import { executeCopyFilePath, executePasteImport } from '.';

export async function executeCopyPaste(): Promise<void> {
  const ok = await executeCopyFilePath();
  if (!ok) {
    return;
  }
  await executePasteImport();
}
