import { Props } from "@/utils/render/types";
import { ElementType, Ref, useCallback, useMemo, useRef } from "react";
import { useRender } from "@/utils/render";
import { DrawerRenderPropArg } from "@/types";
import { useDrawerContext } from "@/context";
import { syncRefs } from "@/utils/sync-refs";
import { useDrag } from "@/hooks/use-drag";
import {
  animate,
  AnimationPlaybackControlsWithThen,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { VELOCITY_MULTIPLIER } from "@/constants";
import { clamp } from "@/utils/clamp";
import { set } from "@/utils/set";
import { getMaxScrollTop } from "@/utils/scroll";
import { ValueAnimationTransition } from "motion";

const DEFAULT_DRAWER_BODY_TAG = "div";

export type DrawerBodyProps<TTag extends ElementType> = Props<
  TTag,
  DrawerRenderPropArg,
  never,
  {
    ref?: Ref<HTMLElement>;
  }
>;

export function DrawerBody<
  TTag extends ElementType = typeof DEFAULT_DRAWER_BODY_TAG,
>(props: DrawerBodyProps<TTag>) {
  const { ...theirProps } = props;

  const { bodyRef, drawerRef, getComputedSnapPoints } = useDrawerContext();

  const ref = useRef<HTMLElement | null>(null);
  const tracked = useRef({
    initialScrollTop: null as number | null,
    isScrolled: false,
    allowScroll: false,
    maxSize: 0,
  });
  const releaseAnimationControl =
    useRef<AnimationPlaybackControlsWithThen | null>(null);

  const getIsDrawerMaxSize = useCallback(
    (drawer: HTMLElement, maxSize: number) => {
      return drawer.offsetHeight >= maxSize - 10;
    },
    [],
  );

  const motionScrollTop = useMotionValue(bodyRef.current?.scrollTop || 0);

  const drag = useDrag({
    onInit() {
      if (releaseAnimationControl.current)
        releaseAnimationControl.current.stop();
      tracked.current.isScrolled = false;
      tracked.current.initialScrollTop = bodyRef.current!.scrollTop;
      tracked.current.maxSize = Math.max(...getComputedSnapPoints());
      tracked.current.allowScroll = getIsDrawerMaxSize(
        drawerRef.current!,
        tracked.current.maxSize,
      );
    },

    onMove({ event, movement }) {
      if (!tracked.current.allowScroll) return;
      if (tracked.current.initialScrollTop === null) return;

      let scrollTop = tracked.current.initialScrollTop + -movement[1];

      function scroll() {
        tracked.current.isScrolled = true;
        event.stopPropagation();
        motionScrollTop.set(scrollTop);
      }

      const isDrawerMaxSize = getIsDrawerMaxSize(
        drawerRef.current!,
        tracked.current.maxSize,
      );

      const maxScrollTop = getMaxScrollTop(bodyRef.current!);

      // Scroll down
      if (
        isDrawerMaxSize &&
        maxScrollTop > 0 &&
        tracked.current.initialScrollTop >= 0 &&
        movement[1] <= 0
      ) {
        scroll();
        // Scroll up
      } else if (
        isDrawerMaxSize &&
        // Scroll to top only when scrolled
        tracked.current.initialScrollTop > 0 &&
        movement[1] > 0
      ) {
        scroll();
      } else {
        tracked.current.isScrolled = false;
      }
    },

    onRelease({ velocity, direction }) {
      if (!tracked.current.allowScroll) return;
      if (!tracked.current.isScrolled) return;
      if (!bodyRef.current) return;
      if (tracked.current.initialScrollTop === null) return;

      const maxScrollTop = getMaxScrollTop(bodyRef.current);
      const fromSize = motionScrollTop.get();
      const fromSizeClamped = clamp(fromSize, 0, maxScrollTop);
      const toSize =
        fromSize + velocity[1] * VELOCITY_MULTIPLIER * -direction[1];
      const toSizeClamped = clamp(toSize, 0, maxScrollTop);

      const isFromSizeOutOfBounds = fromSize !== fromSizeClamped;
      const isToSizeOutOfBounds = toSize !== toSizeClamped;

      const outOptions: ValueAnimationTransition<number> = {
        type: "spring",
        damping: 100,
        stiffness: 1000,
        mass: 1,
        onUpdate: (latest) => {
          motionScrollTop.set(latest);
        },
      };

      if (isFromSizeOutOfBounds) {
        releaseAnimationControl.current = animate(
          fromSize,
          toSizeClamped,
          outOptions,
        );
        return;
      }

      const overflow = Math.abs(toSize) - Math.abs(toSizeClamped);

      releaseAnimationControl.current = animate(fromSize, toSize, {
        type: "spring",
        damping: 100,
        stiffness: 1000,
        mass: 1,
        onUpdate: (latest) => {
          motionScrollTop.set(latest);
          if (!isToSizeOutOfBounds) return;
          // Back to toSizeClamped
          if (
            Math.abs(latest) >=
            Math.abs(toSizeClamped) + clamp(overflow / 2, 0, 256)
          ) {
            releaseAnimationControl.current?.stop();
            releaseAnimationControl.current = animate(
              latest,
              toSizeClamped,
              outOptions,
            );
          }
        },
      });
    },
  });

  useMotionValueEvent(motionScrollTop, "change", (scrollTop) => {
    if (!bodyRef.current) return;

    const maxScrollTop = getMaxScrollTop(bodyRef.current);

    let overflow = 0;
    let transformOrigin = "unset";
    if (scrollTop < 0) {
      overflow = Math.abs(scrollTop);
      transformOrigin = "top";
    } else if (scrollTop > maxScrollTop) {
      overflow = scrollTop - maxScrollTop;
      transformOrigin = "bottom";
    }

    const bodyChild = bodyRef.current!.children[0] as HTMLElement;

    set(bodyChild, {
      "transform-origin": transformOrigin,
      transform: `scaleY(${1 + overflow * 0.0001})`,
    });

    bodyRef.current!.scrollTop = clamp(scrollTop, 0, maxScrollTop);
  });

  const slot = useMemo(() => {
    return {};
  }, []);

  const ourProps = {
    ref,
  } as DrawerBodyProps<TTag>;

  const render = useRender();

  return (
    <div
      ref={syncRefs(bodyRef, drag.ref)}
      style={{
        position: "relative",
        touchAction: "none",
        overflowY: "auto",
        flexGrow: 1,
      }}
    >
      {render({
        ourProps,
        theirProps,
        slot,
        name: "DrawerBody",
        defaultTag: DEFAULT_DRAWER_BODY_TAG,
      })}
    </div>
  );
}
