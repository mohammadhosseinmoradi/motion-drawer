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
