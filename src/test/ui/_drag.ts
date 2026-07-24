import { execFileSync } from 'child_process';
import { VSBrowser, WebElement } from 'vscode-extension-tester';

import { sleep } from './_helpers';

/** A point in macOS global display coordinates (points — 1:1 with CSS px, no Retina ×2). */
export interface ScreenPoint {
  x: number;
  y: number;
}

export type DragBackend = 'cliclick' | 'nutjs' | null;

let cachedBackend: DragBackend | undefined;
let dragBroken = false;

/** Detects the available OS-input injector: cliclick (brew) first, the nut.js fallback second. */
export function detectDragBackend(): DragBackend {
  if (cachedBackend !== undefined) {
    return cachedBackend;
  }
  try {
    execFileSync('which', ['cliclick'], { stdio: 'pipe' });
    cachedBackend = 'cliclick';
    return cachedBackend;
  } catch {
    // cliclick not installed — try the npm fallback
  }
  try {
    require.resolve('@nut-tree-fork/nut-js');
    cachedBackend = 'nutjs';
  } catch {
    cachedBackend = null;
  }
  return cachedBackend;
}

/**
 * Maps a WebDriver element to its center in screen points: viewport rect + window origin + the
 * window-chrome height. CGEvent-based injectors (cliclick, nut.js) take points, matching
 * `window.screenX` — never multiply by devicePixelRatio.
 */
export async function screenPointOf(element: WebElement): Promise<ScreenPoint> {
  const rect = await element.getRect();
  const [screenX, screenY, chromeHeight] = await VSBrowser.instance.driver.executeScript<number[]>(
    'return [window.screenX, window.screenY, window.outerHeight - window.innerHeight];',
  );
  return {
    x: Math.round(screenX + rect.x + rect.width / 2),
    y: Math.round(screenY + chromeHeight + rect.y + rect.height / 2),
  };
}

/** OS-clicks a neutral point so the test window is frontmost before the drag injects. */
export async function ensureOsFocus(point: ScreenPoint): Promise<void> {
  const backend = detectDragBackend();
  if (backend === 'cliclick') {
    execFileSync('cliclick', [`c:${point.x},${point.y}`], { stdio: 'pipe' });
  } else if (backend === 'nutjs') {
    const { mouse, Point, Button } = await import('@nut-tree-fork/nut-js');
    await mouse.setPosition(new Point(point.x, point.y));
    await mouse.click(Button.LEFT);
  }
  await sleep(300);
}

/**
 * Performs the native drag: press → small initial move (crosses the drag threshold) → waypoint →
 * target → dwell (lets VS Code compute the drop edit) → release.
 */
export async function nativeDrag(from: ScreenPoint, to: ScreenPoint): Promise<void> {
  const backend = detectDragBackend();
  const mid: ScreenPoint = { x: Math.round((from.x + to.x) / 2), y: Math.round((from.y + to.y) / 2) };
  if (backend === 'cliclick') {
    execFileSync('cliclick', [
      '-e', '120',
      `dd:${from.x},${from.y}`,
      `m:${from.x + 4},${from.y + 4}`,
      `m:${mid.x},${mid.y}`,
      `m:${to.x},${to.y}`,
      'w:350',
      `du:${to.x},${to.y}`,
    ], { stdio: 'pipe' });
    return;
  }
  if (backend === 'nutjs') {
    const { mouse, Point, Button, straightTo } = await import('@nut-tree-fork/nut-js');
    mouse.config.mouseSpeed = 800;
    await mouse.setPosition(new Point(from.x, from.y));
    await mouse.pressButton(Button.LEFT);
    await mouse.move(straightTo(new Point(from.x + 4, from.y + 4)));
    await mouse.move(straightTo(new Point(mid.x, mid.y)));
    await mouse.move(straightTo(new Point(to.x, to.y)));
    await sleep(350);
    await mouse.releaseButton(Button.LEFT);
    return;
  }
  throw new Error('no drag backend available');
}

/** Drags with verification: up to `attempts` tries, polling `didLand` after each. */
export async function dragWithVerify(
  from: ScreenPoint,
  to: ScreenPoint,
  didLand: () => Promise<boolean>,
  attempts = 2,
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    await nativeDrag(from, to);
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      if (await didLand().catch(() => false)) {
        return true;
      }
      await sleep(250);
    }
  }
  return false;
}

/** Latches the drag as broken so sibling tests skip instead of re-paying failed drags. */
export function markDragBroken(): void {
  dragBroken = true;
}

export function isDragBroken(): boolean {
  return dragBroken;
}

/** Skips the current test with a loud, actionable banner — permission state is machine config. */
export function skipForAccessibility(context: Mocha.Context, backend: DragBackend): never {
  console.error([
    '',
    '='.repeat(78),
    'NATIVE DRAG SKIPPED — macOS blocked synthetic input (a silent no-op, not an error).',
    'Grant Accessibility to the app running this test process:',
    '  System Settings → Privacy & Security → Accessibility → enable your terminal app',
    '  (Terminal / iTerm / the IDE whose integrated terminal ran npm).',
    backend === null ? 'Also install the injector first:  brew install cliclick' : '',
    'Then re-run:  npm run qa:ui',
    '='.repeat(78),
    '',
  ].filter(line => line !== '').join('\n'));
  context.skip();
  throw new Error('unreachable'); // context.skip() throws — this satisfies the `never` return
}
