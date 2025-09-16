import { Props } from "@/utils/render/types";
import {
  ElementType,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRender } from "@/utils/render";
import { DrawerRenderPropArg } from "@/types";
import { useDrawerContext } from "@/context";
import { syncRefs } from "@/utils/sync-refs";
import { useDrag } from "@/hooks/use-drag";
import { animate } from "motion/react";
import { VELOCITY_MULTIPLIER } from "@/constants";
import { getMaxScrollTop } from "@/utils/get-max-scroll-top";
import { getIsDrawerMaxSize } from "@/utils/get-is-drawer-max-size";
import { clamp } from "@/utils/clamp";
import { set } from "@/utils/set";

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

  const { bodyRef, drawerRef, maxSize, isDrawerMaxSize } = useDrawerContext();
  const ref = useRef<HTMLElement | null>(null);
  const tracked = useRef({
    initialScrollTop: null as number | null,
    isScrolled: false,
    allowScroll: false,
  });

  const setScrollTop = useCallback((scrollTop: number) => {
    bodyRef.current!.scrollTop = scrollTop;
  }, []);

  const drag = useDrag({
    onInit() {
      tracked.current.isScrolled = false;
      tracked.current.initialScrollTop = bodyRef.current!.scrollTop;
      tracked.current.allowScroll = getIsDrawerMaxSize(
        drawerRef.current!,
        maxSize,
      );
    },

    onMove({ event, movement }) {
      if (!tracked.current.allowScroll) return;
      if (tracked.current.initialScrollTop === null) return;

      const scrollTop = tracked.current.initialScrollTop + -movement[1];
      const maxScrollTop = getMaxScrollTop(bodyRef.current!);

      function scroll() {
        tracked.current.isScrolled = true;
        event.stopPropagation();
        event.preventDefault();
        if (scrollTop <= maxScrollTop + 40 && scrollTop >= -40) {
          setScrollTop(scrollTop);
        } else if (scrollTop > 0) {
          setScrollTop(maxScrollTop);
        } else {
          setScrollTop(0);
        }
      }

      const isDrawerMaxSize = getIsDrawerMaxSize(drawerRef.current!, maxSize);

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
      const maxScrollTop = getMaxScrollTop(bodyRef.current!);

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
    set(bodyRef.current, {
      overflow: isDrawerMaxSize ? "auto" : "hidden",
    });
  }, [isDrawerMaxSize]);

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
        touchAction: "none",
        overflow: "hidden",
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
