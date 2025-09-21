import { Props } from "@/utils/render/types";
import { ElementType, Ref, useEffect, useMemo, useRef } from "react";
import { useRender } from "@/utils/render";
import { DrawerRenderPropArg } from "@/types";
import { useDrawerContext } from "@/context";
import { syncRefs } from "@/utils/sync-refs";
import { useDrag } from "@/hooks/use-drag";
import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { VELOCITY_MULTIPLIER } from "@/constants";
import { clamp } from "@/utils/clamp";

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

  const { bodyRef, drawerRef, maxSize } = useDrawerContext();
  const ref = useRef<HTMLElement | null>(null);
  const tracked = useRef({
    initialScrollTop: null as number | null,
    isScrolled: false,
    allowScroll: false,
  });

  const motionScrollTop = useMotionValue(bodyRef.current?.scrollTop || 0);

  const drag = useDrag({
    onInit() {
      tracked.current.isScrolled = false;
      tracked.current.initialScrollTop = bodyRef.current!.scrollTop;
      tracked.current.allowScroll = drawerRef.current!.offsetHeight >= maxSize;
    },

    onMove({ event, movement }) {
      if (!tracked.current.allowScroll) return;
      if (tracked.current.initialScrollTop === null) return;

      const scrollTop = tracked.current.initialScrollTop + -movement[1];
      const maxScrollTop =
        bodyRef.current!.scrollHeight - bodyRef.current!.clientHeight;

      function scroll() {
        tracked.current.isScrolled = true;
        event.stopPropagation();
        if (scrollTop <= maxScrollTop + 40 && scrollTop >= -40) {
          motionScrollTop.set(scrollTop);
        } else if (scrollTop > 0) {
          motionScrollTop.set(maxScrollTop);
        } else {
          motionScrollTop.set(0);
        }
      }

      const isDrawerMaxSize = drawerRef.current!.offsetHeight >= maxSize;

      // Scroll down
      if (
        isDrawerMaxSize &&
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

      const maxScrollTop =
        bodyRef.current!.scrollHeight - bodyRef.current!.clientHeight;
      const fromSize = bodyRef.current!.scrollTop;
      let toSize = fromSize + velocity[1] * VELOCITY_MULTIPLIER * -direction[1];
      toSize = clamp(toSize, 0, maxScrollTop);

      animate(fromSize, toSize, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        onUpdate: (latest) => {
          bodyRef.current!.scrollTop = latest;
        },
      });
    },
  });

  useEffect(() => {
    motionScrollTop.set(bodyRef.current!.scrollTop);
  }, []);

  useMotionValueEvent(motionScrollTop, "change", (scrollTop) => {
    bodyRef.current!.scrollTop = scrollTop;
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
