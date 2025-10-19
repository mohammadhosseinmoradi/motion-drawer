import {
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { RefObject, useEffect } from "react";
import { set } from "@/utils/set";
import { useWindowDimensions } from "@/hooks/use-window-dimensions";

type UseBorderRadiusProps = {
  drawerRef: RefObject<HTMLElement | null>;
  borderRadius: number;
  enable: boolean;
};

export function useBorderRadius(props: UseBorderRadiusProps) {
  const { drawerRef, borderRadius, enable } = props;

  const windowHeight = useWindowDimensions()?.innerHeight || 0;
  const motionHeight = useMotionValue(0);

  const setBorderRadius = (radius: number) => {
    set(drawerRef.current, {
      "border-top-left-radius": radius + "px",
      "border-top-right-radius": radius + "px",
    });
  };

  const radios = useTransform(
    motionHeight,
    [windowHeight - 50, windowHeight],
    [borderRadius, 0],
  );

  useEffect(() => {
    if (!enable) return;

    setBorderRadius(radios.get());

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === drawerRef.current) {
          const rect = entry.target.getBoundingClientRect();
          motionHeight.set(rect.height);
        }
      });
    });

    observer.observe(drawerRef.current!);

    return () => {
      observer.disconnect();
    };
  }, [enable]);

  useMotionValueEvent(radios, "change", setBorderRadius);
}
