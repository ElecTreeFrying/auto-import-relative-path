import { copyCommand, pasteCommand } from ".";

export async function patchCommand(): Promise<void> {
  await copyCommand();
  await pasteCommand();
}
