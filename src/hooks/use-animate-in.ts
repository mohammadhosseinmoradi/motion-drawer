import { RefObject, useEffect } from "react";
import { animate } from "motion/react";
import { Direction, SnapPoint } from "@/types";
import { set } from "@/utils/set";
import { resolveSnapPoint } from "@/utils/snap-point";
import { match } from "@/utils/match";
import { getAxis } from "@/utils/get-axis";

type UseAnimateInProps = {
  drawerRef: RefObject<HTMLElement | null>;
  open: boolean;
  snapPoint: SnapPoint;
  autoSize: number;
  maxSize: number;
  direction: Direction;
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
    direction,
    onAnimateEnd,
    enable,
  } = props;

  useEffect(() => {
    if (!enable) return;
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const resolvedSnapPoint = resolveSnapPoint(snapPoint, autoSize, maxSize);
    set(
      drawer,
      match(direction, {
        top: {
          height: `${resolvedSnapPoint}px`,
          transform: "translateY(-100%)",
        },
        right: {
          width: `${resolvedSnapPoint}px`,
          transform: "translateX(100%)",
        },
        bottom: {
          height: snapPoint,
          "max-height": "100vh",
          transform: "translateY(100%)",
        },
        left: {
          width: `${resolvedSnapPoint}px`,
          transform: "translateX(-100%)",
        },
      }),
    );
    animate(
      drawer,
      match(getAxis(direction), {
        x: {
          x: 0,
        },
        y: {
          y: 0,
        },
      }),
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
