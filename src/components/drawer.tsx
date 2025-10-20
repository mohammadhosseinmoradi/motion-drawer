import { Props } from "@/utils/render/types";
import React, {
  ElementType,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { DrawerRenderPropArg, SnapPoint } from "@/types";
import { useRender } from "@/utils/render";
import { useDrag } from "@/hooks/use-drag";
import { syncRefs } from "@/utils/sync-refs";
import { DrawerContext } from "@/context";
import {
  animate,
  DOMKeyframesDefinition,
  usePresence,
  AnimationPlaybackControlsWithThen,
} from "motion/react";
import { VELOCITY_MULTIPLIER } from "@/constants";
import { useBorderRadius } from "@/hooks/use-border-radius";
import { useAnimateIn } from "@/hooks/use-animate-in";
import { useControllable } from "@/hooks/use-controllable";
import { useAnimateOut } from "@/hooks/use-animate-out";
import { set } from "@/utils/set";
import { clamp } from "@/utils/clamp";
import { rubberbandIfOutOfBounds } from "@/utils/rubberband-if-out-of-bounds";
import { getNearestSnapPoint, resolveSnapPoint } from "@/utils/snap-point";
import { getComputedSize, getSize } from "@/utils/size";

const DEFAULT_DRAWER_TAG = "div";

export type DrawerProps<TTag extends ElementType> = Props<
  TTag,
  DrawerRenderPropArg,
  never,
  {
    ref?: Ref<HTMLElement>;
    /**
     * An array of snap points that the drawer can snap to.
     * Each snap point can be specified in one of three formats:
     *
     * - Pixel values (e.g. `200px`): Sets a fixed height for the drawer
     * - Percentage values (e.g. `50%`): Sets height relative to the viewport height
     * - `auto`: Expands drawer to fit its content, up to maximum viewport height
     *
     * Snap points can be mixed-and-matched, for example,
     * `["200px", "50%", "auto"]`
     *
     * @default ["auto"]
     */
    snapPoints?: SnapPoint[];
    defaultSnapPoint?: SnapPoint;
    /**
     * The controlled snap point state.
     */
    snapPoint?: SnapPoint;
    /**
     * Event handler called when the snap point state changes.
     */
    onSnapPointChange?: (snapPoint: SnapPoint) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    /**
     * The border radius of the drawer.
     *
     * @default 16
     */
    borderRadius?: number | null;
    /**
     * The `offset` is the amount the drawer should be nudged from its origin.
     *
     * @default 0
     */
    offset?: number;
    /**
     * The `padding` is the spacing between the drawer and the window edge.
     *
     * @default 0
     */
    padding?: number;
    /**
     * Whether to close the drawer when dragging.
     *
     * `true`, the drawer will close when dragging down from the first snap point.
     * `false`, the drawer will close when dragging down.
     *
     * @default false
     */
    closeFromFirstSnapPoint?: boolean;
  }
>;

export function Drawer<TTag extends ElementType = typeof DEFAULT_DRAWER_TAG>(
  props: DrawerProps<TTag>,
) {
  const {
    snapPoints = ["auto"],
    defaultSnapPoint,
    snapPoint: theirSnapPoint,
    onSnapPointChange: theirOnSnapPointChange,
    open: theirOpen,
    onOpenChange: theirOnOpenChange,
    defaultOpen,
    borderRadius = 16,
    style,
    offset = 0,
    padding = 0,
    closeFromFirstSnapPoint = false,
    ...theirProps
  } = props;

  const [isPresent, safeToRemove] = usePresence();
  const drawerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLElement | null>(null);

  const ref = useRef<HTMLElement | null>(null);
  const tracked = useRef({
    initialSize: null as number | null,
    isDragging: false,
    minSize: 0,
    maxSize: 0,
  });
  const releaseAnimationControl =
    useRef<AnimationPlaybackControlsWithThen | null>(null);

  const [snapPoint, onSnapPointChange] = useControllable(
    theirSnapPoint,
    theirOnSnapPointChange,
    defaultSnapPoint || snapPoints?.[0] || "auto",
  );

  const [open, onOpenChange] = useControllable(
    theirOpen,
    theirOnOpenChange,
    defaultOpen,
  );

  const getDrawerSize = useCallback(() => {
    return getSize(drawerRef.current!);
  }, []);

  const getMaxSize = useCallback(() => {
    return Math.min(
      getComputedSize({
        element: drawerRef.current!,
        height: "auto",
      }).height,
      window.innerHeight - offset - padding,
    );
  }, [offset, padding]);

  const getMinSize = useCallback(() => {
    return Math.min(
      getComputedSize({
        element: drawerRef.current!,
        height: snapPoints[0],
      }).height,
      window.innerHeight - offset - padding,
    );
  }, [snapPoints, offset, padding]);

  const getKeyframes = useCallback(
    (
      size: number,
      minSize: number,
      maxSize: number,
    ): DOMKeyframesDefinition => {
      const sizeMaxClamped = clamp(size, -Infinity, maxSize);

      return {
        // Animate height until minSize
        height: clamp(
          rubberbandIfOutOfBounds(size, minSize, maxSize),
          minSize,
          Infinity,
        ),
        // Animate y if size is less than minSize
        y: -(sizeMaxClamped < minSize ? sizeMaxClamped - minSize : 0),
      };
    },
    [],
  );

  const animateOut = useCallback(
    (
      size: number,
      minSize: number,
      maxSize: number,
      onComplete: () => void,
    ) => {
      animate(drawerRef.current!, getKeyframes(size, minSize, maxSize), {
        type: "spring",
        damping: 100,
        stiffness: 1200,
        mass: 1,
        onComplete,
      });
    },
    [],
  );

  const drag = useDrag(
    {
      onInit() {
        tracked.current.initialSize = getDrawerSize().height;
        tracked.current.isDragging = true;
        tracked.current.minSize = getMinSize();
        tracked.current.maxSize = getMaxSize();
      },

      onMove({ movement }) {
        let size = tracked.current.initialSize! + -movement[1];
        let maxSize = tracked.current.maxSize;
        const minSize = tracked.current.minSize;
        maxSize = clamp(maxSize, minSize, maxSize);

        if (releaseAnimationControl.current) {
          releaseAnimationControl.current.stop();
          releaseAnimationControl.current = null;
        }

        animate(
          drawerRef.current!,
          {
            ...getKeyframes(size, minSize, maxSize),
            maxHeight: "unset",
          },
          {
            ease: "linear",
            duration: 0,
          },
        );
      },

      onRelease({ velocity, movement, direction, prevTimestamp, timestamp }) {
        let size = getDrawerSize().height;
        size += velocity[1] * VELOCITY_MULTIPLIER * -direction[1];
        let maxSize = tracked.current.maxSize;
        const minSize = tracked.current.minSize;
        maxSize = clamp(maxSize, minSize, maxSize);

        size = clamp(size, 0, maxSize);

        const isPrevSnapPointFirst = snapPoints?.[0] === snapPoint;
        const isBottom = direction[1] > 0;
        const isFast = velocity[1] > 0.1;
        const isMovedEnough = movement[1] > 50;
        const isPaused = timestamp - prevTimestamp > 200;
        const closePoint = "0px";
        const isNearestClosePoint =
          getNearestSnapPoint({
            drawer: drawerRef.current!,
            snapPoints: [closePoint, snapPoints[0]],
            size,
            offset,
            padding,
          }) === closePoint;

        const shouldClose =
          (closeFromFirstSnapPoint ? isPrevSnapPointFirst : true) &&
          isBottom &&
          isFast &&
          isMovedEnough &&
          !isPaused &&
          isNearestClosePoint;

        if (shouldClose) {
          animateOut(-(padding + offset), minSize, maxSize, () => {
            onOpenChange?.(false);
            safeToRemove?.();
          });
        } else {
          const nearestSnapPoint = getNearestSnapPoint({
            drawer: drawerRef.current!,
            snapPoints,
            size,
            offset,
            padding,
          });
          size = resolveSnapPoint({
            drawer: drawerRef.current!,
            snapPoint: nearestSnapPoint,
            offset,
            padding,
          });
          onSnapPointChange?.(nearestSnapPoint);

          releaseAnimationControl.current = animate(
            drawerRef.current!,
            getKeyframes(size, minSize, maxSize),
            {
              type: "spring",
              damping: 100,
              stiffness: 1000,
              mass: 1,
              onComplete() {
                if (nearestSnapPoint === "auto") {
                  releaseAnimationControl.current?.stop();
                  releaseAnimationControl.current = null;
                  requestAnimationFrame(() => {
                    set(drawerRef.current, {
                      height: "auto",
                      "max-height": `calc(100dvh - ${offset}px - ${padding}px)`,
                    });
                  });
                }
              },
            },
          );
        }

        tracked.current.isDragging = false;
      },
    },
    {
      threshold: [0, 10],
    },
  );

  useBorderRadius({
    drawerRef,
    borderRadius: borderRadius || 0,
    enable: borderRadius !== null,
  });

  useAnimateIn({
    drawerRef,
    snapPoint: snapPoint || defaultSnapPoint || "auto",
    offset,
    padding,
    enable: open,
  });

  useAnimateOut({
    enable: !open || !isPresent,
    onClose() {
      animateOut(-(padding + offset), getMinSize(), getMaxSize(), () =>
        safeToRemove?.(),
      );
    },
  });

  useEffect(() => {
    if (!snapPoints?.length) {
      const error = new Error(
        "The snapPoints array must contain at least one snap point value.",
      );
      if (Error.captureStackTrace) Error.captureStackTrace(error, Drawer);
      throw error;
    }
  }, [snapPoints]);

  const ourProps = {
    ref: syncRefs(ref, drawerRef, drag.ref),
    style: {
      ...style,
      position: "fixed",
      bottom: offset,
      translate: "calc(-1/2 * 100%)",
      left: "calc(1/2 * 100%)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: "0px",
    },
  } as DrawerProps<TTag>;

  const slot = useMemo(() => {
    return {};
  }, []);

  const render = useRender();

  return (
    <DrawerContext
      value={{
        drawerRef,
        headerRef,
        bodyRef,
        actionsRef,
        getMaxSize,
      }}
    >
      {render({
        ourProps,
        theirProps,
        slot,
        name: "Drawer",
        defaultTag: DEFAULT_DRAWER_TAG,
      })}
    </DrawerContext>
  );
}
