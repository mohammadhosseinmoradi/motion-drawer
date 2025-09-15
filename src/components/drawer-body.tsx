import { Props } from "@/utils/render/types";
import { ElementType, Ref, useCallback, useMemo, useRef } from "react";
import { useRender } from "@/utils/render";
import { DrawerRenderPropArg } from "@/types";
import { useDrawerContext } from "@/context";
import { syncRefs } from "@/utils/sync-refs";
import { useDrag } from "@/hooks/use-drag";
import { animate } from "motion/react";
import { VELOCITY_MULTIPLIER } from "@/constants";
import { getMaxScrollTop } from "@/utils/get-max-scroll-top";
import { isDrawerMaxSize } from "@/utils/is-drawer-max-size";
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
  const { style, children, ...theirProps } = props;

  const { bodyRef, drawerRef, maxSize } = useDrawerContext();
  const ref = useRef<HTMLElement | null>(null);
  const initialSizeRef = useRef<number | null>(null);
  const isScrolledRef = useRef(false);
  const allowScrollRef = useRef(false);

  const setScrollTop = useCallback((scrollTop: number) => {
    bodyRef.current!.scrollTop = scrollTop;
  }, []);

  const drag = useDrag({
    onInit() {
      isScrolledRef.current = false;
      initialSizeRef.current = bodyRef.current!.scrollTop;
      allowScrollRef.current = isDrawerMaxSize(drawerRef.current!, maxSize);
    },

    onMove({ event, movement }) {
      if (!allowScrollRef.current) return;
      if (initialSizeRef.current === null) return;

      const drawerMaxSize = isDrawerMaxSize(drawerRef.current!, maxSize);
      const scrollTop = initialSizeRef.current + -movement[1];
      const maxScrollTop = getMaxScrollTop(bodyRef.current!);

      function scroll() {
        isScrolledRef.current = true;
        if (scrollTop <= maxScrollTop + 40 && scrollTop >= -40) {
          setScrollTop(scrollTop);
        } else if (scrollTop > 0) {
          setScrollTop(maxScrollTop);
        } else {
          setScrollTop(0);
        }
        event.stopPropagation();
        event.preventDefault();
      }

      if (drawerMaxSize && initialSizeRef.current >= 0 && movement[1] <= 0) {
        scroll();
      } else if (
        drawerMaxSize &&
        initialSizeRef.current > 0 &&
        movement[1] > 0
      ) {
        scroll();
      } else {
        isScrolledRef.current = false;
      }
    },

    onRelease({ velocity, direction }) {
      if (!allowScrollRef.current) return;
      if (!isScrolledRef.current) return;
      const maxScrollTop = getMaxScrollTop(bodyRef.current!);

      const fromSize = bodyRef.current!.scrollTop;
      let toSize = fromSize + velocity[1] * VELOCITY_MULTIPLIER * -direction[1];
      toSize = clamp(toSize, 0, maxScrollTop);

      animate(fromSize, toSize, {
        damping: 10,
        stiffness: 1,
        mass: 1,
        onUpdate: (latest) => {
          bodyRef.current!.scrollTop = latest;
        },
      });
    },
  });

  const slot = useMemo(() => {
    return {};
  }, []);

  const ourProps = {
    ref: syncRefs(ref, bodyRef, drag.ref),
    style: {
      ...style,
      touchAction: "none",
      overflow: "auto",
      flexGrow: 1,
    },
    children: (
      <div>{typeof children === "function" ? children({}) : children}</div>
    ),
  } as DrawerBodyProps<TTag>;

  const render = useRender();

  return render({
    ourProps,
    theirProps,
    slot,
    name: "DrawerBody",
    defaultTag: DEFAULT_DRAWER_BODY_TAG,
  });
}
