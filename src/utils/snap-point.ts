import { SnapPoint } from "@/types";

export function resolveSnapPoint(
  snapPoint: SnapPoint,
  autoSize: number,
  maxSize: number,
): number {
  if (snapPoint === "auto") return autoSize;
  if (snapPoint.endsWith("px")) return parseInt(snapPoint);
  if (snapPoint.endsWith("%")) {
    return Math.round((parseInt(snapPoint) / 100) * maxSize);
  }
  return 0;
}

/**
 * Gets the nearest snap point to the current position.
 * Throws an error when snapPoints array is empty.
 * @param snapPoints - Array of snap points
 * @param position - Current position to compare against
 * @param autoSize - The automatically calculated size based on content height
 * @param maxSize - The max size of available viewport
 * @returns The nearest snap point value
 */
export function getNearestSnapPoint(
  snapPoints: SnapPoint[],
  position: number,
  autoSize: number,
  maxSize: number,
) {
  return snapPoints.reduce((nearest, current) => {
    const currentResolved = resolveSnapPoint(current, autoSize, maxSize);
    const nearestResolved = resolveSnapPoint(nearest, autoSize, maxSize);
    return Math.abs(currentResolved - position) <
      Math.abs(nearestResolved - position)
      ? current
      : nearest;
  });
}