import {
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { RefObject, useEffect } from "react";
import { Direction } from "@/types";
import { getAxis } from "@/utils/get-axis";
import { match } from "@/utils/match";

type UseBorderRadiusProps = {
  elementRef: RefObject<HTMLElement | null>;
  direction: Direction;
  inputRange: [number, number];
  outputRange: [number, number];
  onChange: (radius: number) => void;
  enable: boolean;
};

export function useBorderRadius(props: UseBorderRadiusProps) {
  const { elementRef, direction, inputRange, outputRange, onChange, enable } =
    props;

  const motionSize = useMotionValue(0);

  const radios = useTransform(motionSize, inputRange, outputRange);

  useEffect(() => {
    if (!enable) return;

    const axis = getAxis(direction);

    onChange(radios.get());

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === elementRef.current) {
          const rect = entry.target.getBoundingClientRect();
          motionSize.set(
            match(axis, {
              x: rect.width,
              y: rect.height,
            }),
          );
        }
      });
    });

    observer.observe(elementRef.current!);

    return () => {
      observer.disconnect();
    };
  }, [enable]);

  useMotionValueEvent(radios, "change", onChange);
}
