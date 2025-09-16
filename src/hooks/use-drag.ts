import useEventListener from "@/hooks/use-event-listener";
import { RefObject, useCallback, useRef } from "react";

export type Vector2d = [number, number];

type Event = TouchEvent | MouseEvent;

export type DragEvent = {
  event: Event;
  type: "mouse" | "touch";
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
  const { threshold } = config || {};

  const ref = useRef<HTMLElement | null>(null);

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

  const getPosition = useCallback((event: Event): Vector2d => {
    if (isTouchEvent(event)) {
      return [event.touches[0].clientX, event.touches[0].clientY];
    }
    return [event.clientX, event.clientY];
  }, []);

  const getDirection = useCallback((distance: Vector2d): Vector2d => {
    const [dx, dy] = distance;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      return dx > 0 ? [-1, 0] : [1, 0];
    }
    return dy > 0 ? [0, 1] : [0, -1];
  }, []);

  const getDistance = useCallback(
    (position: Vector2d, target: Vector2d): Vector2d => {
      return [position[0] - target[0], position[1] - target[1]];
    },
    [],
  );

  const getVelocity = useCallback(
    (distance: Vector2d, deltaTime: number): Vector2d => {
      return [
        Math.abs(distance[0] / deltaTime),
        Math.abs(distance[1] / deltaTime),
      ];
    },
    [],
  );

  const getMovement = useCallback(
    (position: Vector2d, initialPosition: Vector2d): Vector2d => {
      return [
        position[0] - initialPosition[0],
        position[1] - initialPosition[1],
      ];
    },
    [],
  );

  const getThreshold = useCallback((): Vector2d => {
    if (threshold) return threshold;
    return [0, 0];
  }, [threshold]);

  const isOverThreshold = useCallback(
    (movement: Vector2d, threshold: Vector2d): boolean => {
      return (
        Math.abs(movement[0]) > threshold[0] ||
        Math.abs(movement[1]) > threshold[1]
      );
    },
    [],
  );

  function handleStart(event: Event) {
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
      type: isTouchEvent(event) ? "touch" : "mouse",
      direction: [0, 0],
      timestamp,
      movement: [0, 0],
      distance: [0, 0],
      velocity: [0, 0],
    });
  }
  function handleMove(event: Event) {
    if (!tracked.current.initialPosition) return;

    const timestamp = Date.now();
    const deltaTime = timestamp - tracked.current.timestamp;
    const position = getPosition(event);
    const distance = getDistance(position, tracked.current.position);
    let velocity = getVelocity(distance, deltaTime);
    const movement = getMovement(position, tracked.current.initialPosition);
    const activated =
      tracked.current.activated || isOverThreshold(movement, getThreshold());

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
      type: isTouchEvent(event) ? "touch" : "mouse",
      direction: getDirection(distance),
      timestamp,
      movement: getMovement(position, tracked.current.initialPosition!),
      distance,
      velocity,
    });
  }
  function handleEnd(event: Event) {
    if (!tracked.current.initialPosition || !tracked.current.activated) {
      resetTracked();
      return;
    }

    const timestamp = tracked.current.timestamp;
    const position = tracked.current.position;
    const distance = tracked.current.distance;
    const velocity = tracked.current.velocity;

    onRelease?.({
      event,
      type: isTouchEvent(event) ? "touch" : "mouse",
      direction: getDirection(distance),
      timestamp,
      movement: getMovement(position, tracked.current.initialPosition),
      distance,
      velocity,
    });

    resetTracked();
  }

  useEventListener("touchstart", handleStart, ref as RefObject<HTMLElement>);
  useEventListener("touchmove", handleMove, ref as RefObject<HTMLElement>);
  useEventListener("touchend", handleEnd, ref as RefObject<HTMLElement>);

  // Only register mousedown on target
  useEventListener("mousedown", handleStart, ref as RefObject<HTMLElement>);
  useEventListener("mousemove", handleMove);
  useEventListener("mouseup", handleEnd);

  return { ref };
}

function isTouchEvent(event: Event): event is TouchEvent {
  return (event as TouchEvent).touches !== undefined;
}
