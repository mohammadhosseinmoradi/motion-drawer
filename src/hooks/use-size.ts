import { useEffect, useState } from "react";
import { SnapPoint } from "@/types";
import { resolveSnapPoint } from "@/utils/resolve-snap-point";

type UseMaxSizeProps = {
  headerRef: React.RefObject<HTMLElement | null>;
  bodyRef: React.RefObject<HTMLElement | null>;
  actionsRef: React.RefObject<HTMLElement | null>;
  snapPoints: SnapPoint[];
  offset: number;
  padding: number;
};

export function useSize(props: UseMaxSizeProps) {
  const { headerRef, bodyRef, actionsRef, snapPoints, offset, padding } = props;

  const [size, setSize] = useState({
    maxSize: 0,
    autoSize: 0,
  });

  useEffect(() => {
    const calculateMaxSize = () => {
      const headerSize = headerRef.current?.offsetHeight || 0;
      const actionsSize = actionsRef.current?.offsetHeight || 0;

      let autoSize = headerSize + actionsSize;
      if (bodyRef.current?.children) {
        Array.from(bodyRef.current.children).forEach((child) => {
          const childHeight = (child as HTMLElement).offsetHeight;
          autoSize += childHeight;
        });
      }

      autoSize = Math.min(autoSize + 4, window.innerHeight - offset - padding);

      let maxSize = Math.max(autoSize, window.innerHeight - offset - padding);
      snapPoints.forEach((current) => {
        const resolved = resolveSnapPoint(current, autoSize, maxSize);
        if (resolved > maxSize) maxSize = resolved;
      });

      return { maxSize, autoSize };
    };

    setSize(calculateMaxSize());

    const observer = new ResizeObserver(() => {
      setSize(calculateMaxSize());
    });

    if (headerRef.current) observer.observe(headerRef.current);
    if (bodyRef.current) observer.observe(bodyRef.current);
    if (actionsRef.current) observer.observe(actionsRef.current);

    return () => observer.disconnect();
  }, [snapPoints]);

  return size;
}
