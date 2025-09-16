import { Props } from "@/utils/render/types";
import {
  ElementType,
  Ref,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { DrawerRenderPropArg, SnapPoint } from "@/types";
import { useRender } from "@/utils/render";
import { useDrag } from "@/hooks/use-drag";
import { syncRefs } from "@/utils/sync-refs";
import { DrawerContext, stateReducer } from "@/context";
import { useSize } from "@/hooks/use-size";
import { animate, DOMKeyframesDefinition, usePresence } from "motion/react";
import { VELOCITY_MULTIPLIER } from "@/constants";
import { useBorderRadius } from "@/hooks/use-border-radius";
import { useAnimateIn } from "@/hooks/use-animate-in";
import { useWindowDimensions } from "@/hooks/use-window-dimensions";
import { getNearestSnapPoint } from "@/utils/get-neareset-snap-point";
import { useControllable } from "@/hooks/use-controllable";
import { resolveSnapPoint } from "@/utils/resolve-snap-point";
import { useAnimateOut } from "@/hooks/use-animate-out";
import { set } from "@/utils/set";
import { clamp } from "@/utils/clamp";
import { rubberbandIfOutOfBounds } from "@/utils/rubberband-if-out-of-bounds";
import useEventListener from "@/hooks/use-event-listener";
import { useDisposables } from "@/hooks/use-disposables";

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
    /**
     * @default auto
     */
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
     * @default 16px
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
    isAnimating: true,
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

  const [isDrawerMaxSize, setIsDrawerMaxSize] = useState(false);
  const { maxSize, autoSize } = useSize({
    drawerRef,
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

      onMove({ movement, event }) {
        if (event.defaultPrevented) return;
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

      onRelease({ velocity, movement, direction, event }) {
        if (event.defaultPrevented) return;
        let size = getDrawerSize();
        size += velocity[1] * VELOCITY_MULTIPLIER * -direction[1];
        size = clamp(size, 0, maxSize);

        const isPrevSnapPointFirst = snapPoints?.[0] === snapPoint;
        const isBottom = direction[1] > 0;
        const isFast = velocity[1] > 1 && movement[1] > 50;
        const shouldClose = isPrevSnapPointFirst && isBottom && isFast;

        if (shouldClose) {
          animateOut(0, minSize, maxSize, () => {
            onOpenChange?.(false);
          });
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

          // We want to set immediately when is false
          // But set after complete when is true
          if (size !== maxSize) {
            setIsDrawerMaxSize(size === maxSize);
          }

          let isComplete = false;
          animate(
            drawerRef.current!,
            getReleaseKeyframes(size, minSize, maxSize),
            {
              damping: 20,
              stiffness: 100,
              mass: 0.5,
              onComplete() {
                if (isComplete) setIsDrawerMaxSize(size === maxSize);
                isComplete = true;
              },
            },
          );
        }

        tracked.current.initialSize = size;
        tracked.current.isDragging = false;
      },
    },
    {
      threshold: [0, 10],
    },
  );

  const windowDimensions = useWindowDimensions();

  const resizeDisposables = useDisposables();
  useEventListener("resize", () => {
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
        setIsDrawerMaxSize(shouldBeSize === maxSize);
      }
    });
  });

  useBorderRadius({
    elementRef: drawerRef,
    inputRange: windowDimensions?.innerHeight
      ? [maxSize - 50, maxSize]
      : [0, 0],
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
      const size = getDrawerSize();
      setIsDrawerMaxSize(size === maxSize);
    },
    enable: !!autoSize,
  });

  useAnimateOut({
    isClose: !open || !isPresent,
    onClose() {
      animateOut(0, minSize, maxSize, () => safeToRemove?.());
    },
  });

  const [state] = useReducer(stateReducer, {});

  const ourProps = {
    ref: syncRefs(ref, drawerRef, drag.ref),
    style: {
      ...style,
      touchAction: "none",
      position: "fixed",
      bottom: offset,
      translate: "calc(-1/2 * 100%)",
      left: "calc(1/2 * 100%)",
      zIndex: 50,
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
        ...state,
        drawerRef,
        headerRef,
        bodyRef,
        actionsRef,
        maxSize,
        isDrawerMaxSize,
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
