import { Props } from "@/utils/render/types";
import React, {
  CSSProperties,
  ElementType,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Direction, DrawerRenderPropArg, SnapPoint } from "@/types";
import { useRender } from "@/utils/render";
import { useDrag } from "@/hooks/use-drag";
import { syncRefs } from "@/utils/sync-refs";
import { DrawerContext } from "@/context";
import { useSizes } from "@/hooks/use-sizes";
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
import { useDisposables } from "@/hooks/use-disposables";
import { useWindowEvent } from "@/hooks/use-window-event";
import { getNearestSnapPoint, resolveSnapPoint } from "@/utils/snap-point";
import { match } from "@/utils/match";
import { getAxis } from "@/utils/get-axis";

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
    /**
     * Direction of the drawer. This adjusts the animations and the drag direction.
     *
     * @default bottom
     */
    direction?: Direction;
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
    direction = "bottom",
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

  const getDrawerMinSize = useCallback((): number => {
    const drawer = drawerRef.current!;
    const computedStyle = window.getComputedStyle(drawer);
    const axis = getAxis(direction);

    const clone = drawer.cloneNode(true) as HTMLElement;
    const cstyle = clone.style;

    cstyle.position = "absolute";
    cstyle.visibility = "hidden";
    cstyle.pointerEvents = "none";
    cstyle.contain = "layout";
    cstyle.boxSizing = computedStyle.boxSizing as any;

    if (axis === "y") {
      cstyle.width = computedStyle.width;
      cstyle.minHeight = "0";
      cstyle.height = snapPoints[0];
    } else {
      cstyle.height = snapPoints[0];
      cstyle.minWidth = "0";
      cstyle.width = computedStyle.minWidth;
    }

    document.body.appendChild(clone);
    const rect = clone.getBoundingClientRect();
    clone.remove();

    return match(axis, {
      x: () => rect.width,
      y: () => rect.height,
    });
  }, [direction, snapPoints]);

  const { maxSize, autoSize } = useSizes({
    headerRef,
    bodyRef,
    actionsRef,
    snapPoints,
    offset,
    padding,
    direction,
    enable: open,
  });

  const getDrawerSize = useCallback((direction: Direction) => {
    const axis = getAxis(direction);
    const rect = drawerRef.current!.getBoundingClientRect();
    return match(axis, {
      x: rect.width,
      y: rect.height,
    });
  }, []);

  const getKeyframes = useCallback(
    (
      size: number,
      minSize: number,
      maxSize: number,
    ): DOMKeyframesDefinition => {
      return match(getAxis(direction), {
        x: () => {
          const x = clamp(
            rubberbandIfOutOfBounds(size - minSize, -minSize, 0),
            -minSize,
            offset ? Infinity : 0,
          );
          if (direction === "left") {
            return {
              x,
            } as DOMKeyframesDefinition;
          } else {
            return {
              x: -x,
            } as DOMKeyframesDefinition;
          }
        },
        y: () => {
          if (direction === "top") {
            const y = clamp(
              rubberbandIfOutOfBounds(size - minSize, -minSize, minSize),
              -Infinity,
              offset ? Infinity : 0,
            );
            return {
              y,
            } as DOMKeyframesDefinition;
          } else {
            const sizeClamped = clamp(size, 0, maxSize);
            return {
              height: rubberbandIfOutOfBounds(size, minSize, maxSize),
              y: -(sizeClamped < minSize ? sizeClamped - minSize : 0),
            } as DOMKeyframesDefinition;
          }
        },
      });
    },
    [direction, offset],
  );

  const animateOut = useCallback(
    (
      size: number,
      minSize: number,
      maxSize: number,
      onComplete: () => void,
    ) => {
      let isComplete = false;
      animate(drawerRef.current!, getKeyframes(size, minSize, maxSize), {
        type: "spring",
        damping: 100,
        stiffness: 1200,
        mass: 1,
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
        tracked.current.initialSize = getDrawerSize(direction);
        tracked.current.isDragging = true;
      },

      onMove({ movement }) {
        let size = tracked.current.initialSize!;
        size += match(direction, {
          top: movement[1],
          right: -movement[0],
          bottom: -movement[1],
          left: movement[0],
        });

        if (releaseAnimationControl.current) {
          releaseAnimationControl.current.stop();
          releaseAnimationControl.current = null;
        }

        animate(
          drawerRef.current!,
          getKeyframes(size, getDrawerMinSize(), maxSize),
          {
            ease: "linear",
            duration: 0,
          },
        );
      },

      onRelease({
        velocity,
        movement,
        direction: movDir,
        prevTimestamp,
        timestamp,
      }) {
        let size = getDrawerSize(direction);
        size += velocity[1] * VELOCITY_MULTIPLIER * -movDir[1];
        size = clamp(size, 0, maxSize);

        const isPrevSnapPointFirst = snapPoints?.[0] === snapPoint;
        const isBottom = movDir[1] > 0;
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
          const nearestSnapPoint = getNearestSnapPoint(
            snapPoints,
            size,
            autoSize,
            maxSize,
          );
          size = resolveSnapPoint(nearestSnapPoint, autoSize, maxSize);
          onSnapPointChange?.(nearestSnapPoint);

          let isCompleted = false;
          releaseAnimationControl.current = animate(
            drawerRef.current!,
            getKeyframes(size, getDrawerMinSize(), maxSize),
            {
              type: "spring",
              damping: 100,
              stiffness: 1000,
              mass: 1,
              onComplete() {
                if (!isCompleted) {
                  isCompleted = true;
                  return;
                }
                if (direction === "bottom" && nearestSnapPoint === "auto") {
                  set(drawerRef.current, {
                    height: "auto",
                    "max-height": "100vh",
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

  const resizeDisposables = useDisposables();
  useWindowEvent(animatedIn, "resize", () => {
    resizeDisposables.dispose();
    resizeDisposables.nextFrame(() => {
      const size = getDrawerSize(direction);
      const shouldBeSize = resolveSnapPoint(snapPoint, autoSize, maxSize);
      if (size !== shouldBeSize) {
        animate(
          drawerRef.current!,
          getKeyframes(shouldBeSize, getDrawerMinSize(), maxSize),
          {
            duration: 0,
          },
        );
      }
    });
  });

  useBorderRadius({
    elementRef: drawerRef,
    direction,
    inputRange: [maxSize - 50, maxSize],
    outputRange: [borderRadius || 0, 0],
    onChange(radius) {
      set(
        drawerRef.current,
        match(direction, {
          top: {
            "border-bottom-left-radius": radius + "px",
            "border-bottom-right-radius": radius + "px",
          },
          bottom: {
            "border-top-left-radius": radius + "px",
            "border-top-right-radius": radius + "px",
          },
          left: {
            "border-top-right-radius": radius + "px",
            "border-bottom-right-radius": radius + "px",
          },
          right: {
            "border-top-left-radius": radius + "px",
            "border-bottom-left-radius": radius + "px",
          },
        }),
      );
    },
    enable: borderRadius !== null,
  });

  useAnimateIn({
    drawerRef,
    open,
    snapPoint: snapPoint || defaultSnapPoint || "auto",
    autoSize,
    maxSize,
    direction,
    onAnimateEnd() {
      setAnimatedIn(true);
    },
    enable: autoSize > 0,
  });

  useAnimateOut({
    isClose: !open || !isPresent,
    onClose() {
      animateOut(0, getDrawerMinSize(), maxSize, () => safeToRemove?.());
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

  const directionStyles = useMemo<CSSProperties>(
    () =>
      match(direction, {
        top: {
          top: offset,
          translate: "calc(-1/2 * 100%)",
          left: "calc(1/2 * 100%)",
          height: "0px",
        },
        right: {
          right: offset,
          translate: "0 calc(-1/2 * 100%)",
          transform: "translateX(100%)",
          top: "calc(1/2 * 100%)",
          width: "0px",
        },
        bottom: {
          bottom: offset,
          translate: "calc(-1/2 * 100%)",
          left: "calc(1/2 * 100%)",
          height: "0px",
        },
        left: {
          left: offset,
          translate: "0 calc(-1/2 * 100%)",
          transform: "translateX(-100%)",
          top: "calc(1/2 * 100%)",
          width: "0px",
        },
      }),
    [direction, offset],
  );

  const ourProps = {
    ref: syncRefs(ref, drawerRef, drag.ref),
    style: {
      ...style,
      position: "fixed",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      ...directionStyles,
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
        direction,
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
