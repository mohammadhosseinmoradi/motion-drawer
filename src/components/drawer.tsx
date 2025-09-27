import { Props } from "@/utils/render/types";
import React, {
  ElementType,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DrawerRenderPropArg, SnapPoint } from "@/types";
import { useRender } from "@/utils/render";
import { useDrag } from "@/hooks/use-drag";
import { syncRefs } from "@/utils/sync-refs";
import { DrawerContext } from "@/context";
import { useSizes } from "@/hooks/use-sizes";
import { animate, DOMKeyframesDefinition, usePresence } from "motion/react";
import { VELOCITY_MULTIPLIER } from "@/constants";
import { useBorderRadius } from "@/hooks/use-border-radius";
import { useAnimateIn } from "@/hooks/use-animate-in";
import { useControllable } from "@/hooks/use-controllable";
import { useAnimateOut } from "@/hooks/use-animate-out";
import { set } from "@/utils/set";
import { clamp } from "@/utils/clamp";
import { rubberbandIfOutOfBounds } from "@/utils/rubberband-if-out-of-bounds";
import { useDisposables } from "@/hooks/use-disposables";
import { useWindowEvent } from "@/hooks/use-window-event";
import { getNearestSnapPoint, resolveSnapPoint } from "@/utils/snap-point";

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
     * The minimum size of the drawer.
     * When dragging, the drawer cannot be smaller than this value.
     *
     * @default 0
     */
    minSize?: number;
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
    minSize = 0,
    closeFromFirstSnapPoint = false,
    ...theirProps
  } = props;

  const [isPresent, safeToRemove] = usePresence();
  const drawerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLElement | null>(null);
  const [animatedIn, setAnimatedIn] = useState(false);

  const ref = useRef<HTMLElement | null>(null);
  const tracked = useRef({
    initialSize: null as number | null,
    isDragging: false,
  });

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

  const { maxSize, autoSize } = useSizes({
    headerRef,
    bodyRef,
    actionsRef,
    snapPoints,
    offset,
    padding,
    enable: open,
  });

  const getDrawerSize = useCallback(() => {
    const rect = drawerRef.current!.getBoundingClientRect();
    return rect.height;
  }, []);

  const getReleaseKeyframes = useCallback(
    (
      size: number,
      minSize: number,
      maxSize: number,
    ): DOMKeyframesDefinition => {
      return {
        // Animate height until minSize
        height: rubberbandIfOutOfBounds(size, minSize, maxSize),
        // Animate y if size is less than minSize
        y: -(size < minSize ? size - minSize : 0),
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
      let isComplete = false;
      animate(drawerRef.current!, getReleaseKeyframes(size, minSize, maxSize), {
        ease: [0.6, 0.4, 0, 1],
        duration: 0.3,
        onComplete() {
          if (isComplete) onComplete();
          isComplete = true;
        },
      });
    },
    [],
  );

  const drag = useDrag(
    {
      onInit() {
        tracked.current.initialSize = getDrawerSize();
        tracked.current.isDragging = true;
      },

      onMove({ movement }) {
        let size = tracked.current.initialSize! + -movement[1];
        let sizeConstrained = size;
        if (size > maxSize) sizeConstrained = maxSize;

        animate(
          drawerRef.current!,
          {
            // Animate height until minSize
            height: rubberbandIfOutOfBounds(size, minSize, maxSize),
            // Animate y if size is less than minSize
            y: -(sizeConstrained < minSize ? sizeConstrained - minSize : 0),
          },
          {
            ease: "linear",
            duration: 0,
          },
        );
      },

      onRelease({ velocity, movement, direction, prevTimestamp, timestamp }) {
        let size = getDrawerSize();
        size += velocity[1] * VELOCITY_MULTIPLIER * -direction[1];
        size = clamp(size, 0, maxSize);

        // If all conditions are true should close the drawer
        const isPrevSnapPointFirst = snapPoints?.[0] === snapPoint;
        const isBottom = direction[1] > 0;
        const isFast = velocity[1] > 0.1;
        const isMovedEnough = movement[1] > 50;
        const isPaused = timestamp - prevTimestamp > 200;
        const closePoint = "0px";
        const isNearestClosePoint =
          getNearestSnapPoint(
            [closePoint, snapPoints[0]],
            size,
            autoSize,
            maxSize,
          ) === closePoint;

        const shouldClose =
          (closeFromFirstSnapPoint ? isPrevSnapPointFirst : true) &&
          isBottom &&
          isFast &&
          isMovedEnough &&
          !isPaused &&
          isNearestClosePoint;

        if (shouldClose) {
          onOpenChange?.(false);
        } else {
          if (snapPoints.length > 0) {
            const nearestSnapPoint = getNearestSnapPoint(
              snapPoints,
              size,
              autoSize,
              maxSize,
            );
            size = resolveSnapPoint(nearestSnapPoint, autoSize, maxSize);
            onSnapPointChange?.(nearestSnapPoint);
          }

          animate(
            drawerRef.current!,
            getReleaseKeyframes(size, minSize, maxSize),
            {
              damping: 20,
              stiffness: 100,
              mass: 0.5,
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

  const resizeDisposables = useDisposables();
  useWindowEvent(animatedIn, "resize", () => {
    resizeDisposables.dispose();
    resizeDisposables.nextFrame(() => {
      const size = getDrawerSize();
      const shouldBeSize = resolveSnapPoint(snapPoint, autoSize, maxSize);
      if (size !== shouldBeSize) {
        animate(
          drawerRef.current!,
          getReleaseKeyframes(shouldBeSize, minSize, maxSize),
          {
            duration: 0,
          },
        );
      }
    });
  });

  useBorderRadius({
    elementRef: drawerRef,
    inputRange: [maxSize - 50, maxSize],
    outputRange: [borderRadius || 0, 0],
    onChange(radius) {
      set(drawerRef.current, {
        "border-top-left-radius": radius + "px",
        "border-top-right-radius": radius + "px",
      });
    },
    enable: borderRadius !== null,
  });

  useAnimateIn({
    drawerRef,
    open,
    snapPoint: snapPoint || defaultSnapPoint || "auto",
    autoSize,
    maxSize,
    onAnimateEnd() {
      setAnimatedIn(true);
    },
    enable: autoSize > 0,
  });

  useAnimateOut({
    isClose: !open || !isPresent,
    onClose() {
      animateOut(0, minSize, maxSize, () => safeToRemove?.());
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
        maxSize,
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
