import { RefObject, useEffect } from "react";
import { animate } from "motion/react";
import { SnapPoint } from "@/types";
import { set } from "@/utils/set";
import { resolveSnapPoint } from "@/utils/snap-point";

type UseAnimateInProps = {
  drawerRef: RefObject<HTMLElement | null>;
  snapPoint: SnapPoint;
  offset: number;
  padding: number;
  enable: boolean;
};

export function useAnimateIn(props: UseAnimateInProps) {
  const { drawerRef, snapPoint, offset, padding, enable } = props;

  useEffect(() => {
    if (!enable) return;
    if (!drawerRef.current) return;

    set(drawerRef.current, {
      height: snapPoint,
      "max-height": `calc(100dvh - ${offset}px - ${padding}px)`,
      transform: "translateY(100%)",
    });

    animate(
      drawerRef.current,
      {
        y: 0,
      },
      {
        type: "spring",
        damping: 100,
        stiffness: 1200,
        mass: 1,
      },
    );
  }, [enable]);
}
