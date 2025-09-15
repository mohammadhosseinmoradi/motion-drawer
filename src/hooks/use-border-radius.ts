import {
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { RefObject, useEffect } from "react";

type UseBorderRadiusProps = {
  elementRef: RefObject<HTMLElement | null>;
  inputRange: [number, number];
  outputRange: [number, number];
  onChange: (radius: number) => void;
  enable: boolean;
};

export function useBorderRadius(props: UseBorderRadiusProps) {
  const { elementRef, inputRange, outputRange, onChange, enable } = props;

  const motionHeight = useMotionValue(0);

  const radios = useTransform(motionHeight, inputRange, outputRange);

  useEffect(() => {
    if (!enable) return;

    onChange(radios.get());

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === elementRef.current) {
          const rect = entry.target.getBoundingClientRect();
          motionHeight.set(rect.height);
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
