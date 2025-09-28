import { RefObject, useEffect } from "react";
import { animate } from "motion/react";
import { SnapPoint } from "@/types";
import { set } from "@/utils/set";
import { resolveSnapPoint } from "@/utils/snap-point";

type UseAnimateInProps = {
  drawerRef: RefObject<HTMLElement | null>;
  open: boolean;
  snapPoint: SnapPoint;
  autoSize: number;
  maxSize: number;
  onAnimateEnd: () => void;
  enable: boolean;
};

export function useAnimateIn(props: UseAnimateInProps) {
  const {
    drawerRef,
    open,
    snapPoint,
    autoSize,
    maxSize,
    onAnimateEnd,
    enable,
  } = props;

  useEffect(() => {
    if (!enable) return;
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const resolvedSnapPoint = resolveSnapPoint(snapPoint, autoSize, maxSize);
    set(drawer, {
      height: `${resolvedSnapPoint}px`,
      transform: "translateY(100%)",
    });
    animate(
      drawer,
      {
        y: 0,
      },
      {
        type: "spring",
        damping: 100,
        stiffness: 1200,
        mass: 1,
        onComplete() {
          onAnimateEnd();
        },
      },
    );
  }, [enable, open]);
}
