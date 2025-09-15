import { RefObject, useEffect } from "react";
import { animate } from "motion";
import { SnapPoint } from "@/types";
import { resolveSnapPoint } from "@/utils/resolve-snap-point";

type UseAnimateInProps = {
  drawerRef: RefObject<HTMLElement | null>;
  open: boolean;
  snapPoint: SnapPoint;
  autoSize: number;
  maxSize: number;
  enable: boolean;
};

export function useAnimateIn(props: UseAnimateInProps) {
  const { drawerRef, open, snapPoint, autoSize, maxSize, enable } = props;

  useEffect(() => {
    if (!enable) return;
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const resolvedSnapPoint = resolveSnapPoint(snapPoint, autoSize, maxSize);
    drawer.style.setProperty("height", `${resolvedSnapPoint}px`);
    drawer.style.setProperty("transform", "translateY(100%");
    animate(
      drawer,
      {
        y: 0,
      },
      {
        ease: [0.4, 0.2, 0, 1],
        duration: 0.4,
      },
    );
  }, [enable, open]);
}
