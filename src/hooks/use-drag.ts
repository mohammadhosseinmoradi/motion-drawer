import { Vector2d } from "@/types";
import useEventListener from "@/hooks/use-event-listener";
import { RefObject, useRef } from "react";
import {
  getDirection,
  getDistance,
  getMovement,
  getPosition,
  getVelocity,
  isOverThreshold,
} from "@/utils/dnd";
import { usePreventTouchAction } from "@/hooks/use-prevent-touch-action";

export type DragEvent = {
  event: PointerEvent;
  direction: Vector2d;
  timestamp: number;
  movement: Vector2d;
  distance: Vector2d;
  velocity: Vector2d;
};

export type DragProps = {
  onInit?: (dragEvent: DragEvent) => void;
  onMove?: (dragEvent: DragEvent) => void;
  onRelease?: (dragEvent: DragEvent) => void;
};

export type DragConfig = {
  threshold?: Vector2d;
};

export function useDrag(props: DragProps, config?: DragConfig) {
  const { onInit, onMove, onRelease } = props;
  const { threshold = [0, 0] } = config || {};

  const ref = useRef<HTMLElement | null>(null);

  const allowPointerEvent = useRef(true);

  usePreventTouchAction({
    ref,
    onChange({ defaultPrevented }) {
      // When touch action is prevented, we need to allow pointer events
      allowPointerEvent.current = defaultPrevented;
    },
  });

  const tracked = useRef({
    timestamp: 0,
    initialPosition: null as Vector2d | null,
    position: [0, 0] as Vector2d,
    distance: [0, 0] as Vector2d,
    velocity: [0, 0] as Vector2d,
    activated: false,
  });

  function resetTracked() {
    tracked.current = {
      timestamp: 0,
      initialPosition: null as Vector2d | null,
      position: [0, 0] as Vector2d,
      distance: [0, 0] as Vector2d,
      velocity: [0, 0] as Vector2d,
      activated: false,
    };
  }

  function handleStart(event: PointerEvent) {
    const timestamp = Date.now();
    const position = getPosition(event);

    tracked.current = {
      initialPosition: position,
      position,
      timestamp,
      distance: [0, 0],
      velocity: [0, 0],
      activated: false,
    };

    onInit?.({
      event,
      direction: [0, 0],
      timestamp,
      movement: [0, 0],
      distance: [0, 0],
      velocity: [0, 0],
    });
  }
  function handleMove(event: PointerEvent) {
    if (!allowPointerEvent.current) return;
    if (!tracked.current.initialPosition) return;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    const timestamp = Date.now();
    const deltaTime = timestamp - tracked.current.timestamp;
    const position = getPosition(event);
    const distance = getDistance(position, tracked.current.position);
    let velocity = getVelocity(distance, deltaTime);
    const movement = getMovement(position, tracked.current.initialPosition);
    const activated =
      tracked.current.activated || isOverThreshold(movement, threshold);

    tracked.current = {
      ...tracked.current,
      position,
      timestamp,
      distance,
      velocity,
      activated,
    };

    if (!activated) return;

    onMove?.({
      event,
      direction: getDirection(distance),
      timestamp,
      movement: getMovement(position, tracked.current.initialPosition!),
      distance,
      velocity,
    });
  }
  function handleEnd(event: PointerEvent) {
    if (!allowPointerEvent.current) return;
    if (!tracked.current.initialPosition || !tracked.current.activated) {
      resetTracked();
      return;
    }
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);

    const timestamp = tracked.current.timestamp;
    const position = tracked.current.position;
    const distance = tracked.current.distance;
    const velocity = tracked.current.velocity;

    onRelease?.({
      event,
      direction: getDirection(distance),
      timestamp,
      movement: getMovement(position, tracked.current.initialPosition),
      distance,
      velocity,
    });

    resetTracked();
  }

  function handleCancel(event: PointerEvent) {
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    resetTracked();
  }

  useEventListener("pointerdown", handleStart, ref as RefObject<HTMLElement>);
  useEventListener("pointermove", handleMove, ref as RefObject<HTMLElement>);
  useEventListener("pointerup", handleEnd, ref as RefObject<HTMLElement>);
  useEventListener(
    "pointercancel",
    handleCancel,
    ref as RefObject<HTMLElement>,
  );

  return { ref };
}
