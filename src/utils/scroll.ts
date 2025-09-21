import { Vector2d } from "@/types";

/**
 * Recursively checks if a target or any of its ancestors can scroll in the given dir.
 *
 * @param target - The starting element to check.
 * @param root - The root element to stop checking at.
 * @param dir - A 2D vector [x, y] representing a scroll direction:
 *   [0,1] = down, [0,-1] = up, [1,0] = right, [-1,0] = left.
 * @returns true if target or any ancestor up to root can scroll in the given direction.
 */
export function canScrollInDirection(
  target: HTMLElement,
  root: HTMLElement | null,
  dir: Vector2d,
): boolean {
  if (!target) return false;

  const [dx, dy] = dir;

  if (dy !== 0) {
    // down
    if (dy > 0) {
      if (target.scrollTop > 0) return true;
    } else {
      // down
      if (Math.ceil(target.scrollTop + target.clientHeight) < target.scrollHeight) return true;
    }
  }

  if (dx !== 0) {
    // right
    if (dx > 0) {
      if (target.scrollLeft > 0) return true;
      // left
    } else {
      if (Math.ceil(target.scrollLeft + target.clientWidth) < target.scrollWidth) return true;
    }
  }

  if (root && target === root) return false;

  return target.parentElement ? canScrollInDirection(target.parentElement, root, dir) : false;
}
