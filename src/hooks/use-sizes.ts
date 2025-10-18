import { useEffect, useState } from "react";
import { Direction, SnapPoint } from "@/types";
import { useDisposables } from "@/hooks/use-disposables";
import { resolveSnapPoint } from "@/utils/snap-point";
import { getAxis } from "@/utils/get-axis";
import { match } from "@/utils/match";

type UseMaxSizeProps = {
  headerRef: React.RefObject<HTMLElement | null>;
  bodyRef: React.RefObject<HTMLElement | null>;
  actionsRef: React.RefObject<HTMLElement | null>;
  snapPoints: SnapPoint[];
  offset: number;
  padding: number;
  direction: Direction;
  enable: boolean;
};

export function useSizes(props: UseMaxSizeProps) {
  const {
    headerRef,
    bodyRef,
    actionsRef,
    snapPoints,
    offset,
    padding,
    direction,
    enable,
  } = props;

  const d = useDisposables();

  const [sizes, setSizes] = useState({
    maxSize: -1,
    autoSize: -1,
  });

  useEffect(() => {
    if (!enable) return;

    const calculateSizes = () => {
      d.dispose();
      d.nextFrame(() => {
        const axis = getAxis(direction);

        const headerSize = match(axis, {
          x: 0,
          y: headerRef.current?.offsetHeight || 0,
        });

        const actionsSize = match(axis, {
          x: 0,
          y: actionsRef.current?.offsetHeight || 0,
        });

        const bodySize = match(axis, {
          x: () => {
            const childHeight = bodyRef.current!.children[0] as HTMLElement;
            return childHeight.offsetWidth;
          },
          y: () => {
            const childHeight = bodyRef.current!.children[0] as HTMLElement;
            return childHeight.offsetHeight;
          },
        });

        let autoSize = match(axis, {
          x: () => Math.max(headerSize, actionsSize, bodySize),
          y: () => headerSize + actionsSize + bodySize,
        });

        const windowBounds = match(axis, {
          x: window.innerWidth - offset - padding,
          y: window.innerHeight - offset - padding,
        });

        autoSize = Math.min(
          autoSize,
          windowBounds,
        );

        let maxSize = Math.max(autoSize, windowBounds);
        snapPoints.forEach((current) => {
          const resolved = resolveSnapPoint(current, autoSize, maxSize);
          if (resolved > maxSize) maxSize = resolved;
        });

        if (maxSize !== sizes.maxSize || autoSize !== sizes.autoSize) {
          setSizes({
            maxSize,
            autoSize,
          });
        }
      });
    };

    const observer = new ResizeObserver(calculateSizes);

    if (headerRef.current) observer.observe(headerRef.current);
    if (bodyRef.current) observer.observe(bodyRef.current);
    if (actionsRef.current) observer.observe(actionsRef.current);

    window.addEventListener("resize", calculateSizes);

    calculateSizes();

    return () => {
      window.removeEventListener("resize", calculateSizes);
      observer.disconnect();
    };
  }, [snapPoints, direction, enable]);

  return sizes;
}
