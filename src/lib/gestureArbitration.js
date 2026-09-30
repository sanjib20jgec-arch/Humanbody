/**
 * Touch gesture arbitration for the 3D atlas.
 *
 * A pointer gesture starts undecided. It only becomes a model interaction once
 * travel reveals which axis the learner meant:
 *
 *   - horizontal travel becomes atlas rotation, and only then may the canvas
 *     capture the pointer and engage model controls;
 *   - vertical travel belongs to the browser, so touch-action: pan-y keeps
 *     scrolling the page.
 *
 * Deciding this *before* any model control engages is what stops the canvas
 * from swallowing vertical swipes. Capturing the pointer on pointerdown would
 * claim the gesture before the browser can tell it is a page scroll, which
 * defeats pan-y no matter what the CSS says.
 *
 * Kept as a pure module so the rule is unit-testable without a browser.
 */

/** Travel in px before a gesture commits to an axis. */
export const GESTURE_AXIS_LOCK_PX = 8;

/**
 * Classify a gesture from its total travel since pointerdown.
 *
 * @param {{ dx?: number, dy?: number, threshold?: number }} input
 * @returns {'horizontal' | 'vertical' | null} null while still undecided.
 */
export function decideGestureAxis({ dx = 0, dy = 0, threshold = GESTURE_AXIS_LOCK_PX } = {}) {
  const travelX = Math.abs(dx);
  const travelY = Math.abs(dy);
  // Below the lock distance the user may still be resting a finger for a tap,
  // so no axis is claimed yet.
  if (travelX < threshold && travelY < threshold) return null;
  // Ties resolve to the page: scrolling is the safe default when ambiguous.
  return travelY >= travelX ? 'vertical' : 'horizontal';
}
