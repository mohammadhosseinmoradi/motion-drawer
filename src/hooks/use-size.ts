import { useEffect, useState } from "react";
import { SnapPoint } from "@/types";
import { resolveSnapPoint } from "@/utils/resolve-snap-point";
import { useDisposables } from "@/hooks/use-disposables";

type UseMaxSizeProps = {
  drawerRef: React.RefObject<HTMLElement | null>;
  headerRef: React.RefObject<HTMLElement | null>;
  bodyRef: React.RefObject<HTMLElement | null>;
  actionsRef: React.RefObject<HTMLElement | null>;
  snapPoints: SnapPoint[];
  offset: number;
  padding: number;
  enable: boolean;
};

export function useSize(props: UseMaxSizeProps) {
  const {
    drawerRef,
    headerRef,
    bodyRef,
    actionsRef,
    snapPoints,
    offset,
    padding,
    enable,
  } = props;

  const d = useDisposables();

  const [sizes, setSizes] = useState({
    maxSize: 0,
    autoSize: 0,
  });

  useEffect(() => {
    if (!enable) return;

    const calculateSizes = () => {
      d.dispose();
      d.nextFrame(() => {
        const headerSize = headerRef.current?.offsetHeight || 0;
        const actionsSize = actionsRef.current?.offsetHeight || 0;

        let autoSize = headerSize + actionsSize;
        if (bodyRef.current?.children) {
          Array.from(bodyRef.current.children).forEach((child) => {
            const childHeight = (child as HTMLElement).offsetHeight;
            autoSize += childHeight;
          });
        }

        autoSize = Math.min(
          autoSize + 4,
          window.innerHeight - offset - padding,
        );

        let maxSize = Math.max(autoSize, window.innerHeight - offset - padding);
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

    return () => {
      window.removeEventListener("resize", calculateSizes);
      observer.disconnect();
    };
  }, [snapPoints, enable]);

  return sizes;
}
