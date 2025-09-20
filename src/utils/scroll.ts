import { Vector2d } from "@/types";

/**
 * Recursively checks if an element or any of its ancestors can scroll in the given dir.
 *
 * @param el - The element to start from.
 * @param dir - A 2D vector [x, y]:
 *   [0,1] = down, [0,-1] = up, [1,0] = right, [-1,0] = left.
 * @returns true if any ancestor (including el) can scroll in that dir.
 */
export function canScrollInDirection(
  el: HTMLElement | null,
  dir: Vector2d,
): boolean {
  if (!el) return false;

  const [dx, dy] = dir;

  if (dy !== 0) {
    if (dy > 0) {
      if (el.scrollTop + el.clientHeight < el.scrollHeight) return true; // down
    } else {
      if (el.scrollTop > 0) return true; // up
    }
  }

  if (dx !== 0) {
    if (dx > 0) {
      if (el.scrollLeft + el.clientWidth < el.scrollWidth) return true; // right
    } else {
      if (el.scrollLeft > 0) return true; // left
    }
  }

  return el.parentElement ? canScrollInDirection(el.parentElement, dir) : false;
}

export function getMaxScrollTop(element: HTMLElement) {
  return element.scrollHeight - element.clientHeight;
}