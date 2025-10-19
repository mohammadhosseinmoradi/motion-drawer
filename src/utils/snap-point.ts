import { SnapPoint } from "@/types";
import { getComputedSize } from "@/utils/size";

type ResolveSnapPointParams = {
  drawer: HTMLElement;
  snapPoint: SnapPoint;
  offset: number;
  padding: number;
};

export function resolveSnapPoint(params: ResolveSnapPointParams): number {
  const { drawer, snapPoint, offset, padding } = params;

  if (snapPoint.endsWith("px")) return parseFloat(snapPoint);
  else {
    return Math.min(
      getComputedSize({
        element: drawer,
        height: snapPoint,
      }).height,
      window.innerHeight - offset - padding,
    );
  }
}

type GetNearestSnapPointParams = {
  drawer: HTMLElement;
  snapPoints: SnapPoint[];
  size: number;
  offset: number;
  padding: number;
};

export function getNearestSnapPoint(params: GetNearestSnapPointParams) {
  const { drawer, snapPoints, size, offset, padding } = params;

  return snapPoints.reduce((nearest, current) => {
    const currentResolved = resolveSnapPoint({
      drawer,
      snapPoint: current,
      offset,
      padding,
    });
    const nearestResolved = resolveSnapPoint({
      drawer,
      snapPoint: nearest,
      offset,
      padding,
    });
    return Math.abs(currentResolved - size) < Math.abs(nearestResolved - size)
      ? current
      : nearest;
  });
}
