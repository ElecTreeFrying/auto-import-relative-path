import { copy, paste } from ".";

export async function patch(): Promise<void> {
  await copy();
  await paste();
}
