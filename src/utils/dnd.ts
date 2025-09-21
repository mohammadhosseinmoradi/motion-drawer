import { Vector2d } from "@/types";

function isTouchEvent(event: Event): event is TouchEvent {
  return (event as TouchEvent).touches !== undefined;
}

export function getPosition(event: PointerEvent | TouchEvent): Vector2d {
  if (isTouchEvent(event)) {
    return [event.touches[0].clientX, event.touches[0].clientY];
  }
  return [event.clientX, event.clientY];
}

export function getDirection(distance: Vector2d): Vector2d {
  const [dx, dy] = distance;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx > absDy) {
    return dx > 0 ? [-1, 0] : [1, 0];
  }
  return dy > 0 ? [0, 1] : [0, -1];
}

export function getDistance(position: Vector2d, target: Vector2d): Vector2d {
  return [position[0] - target[0], position[1] - target[1]];
}

export function getVelocity(distance: Vector2d, deltaTime: number): Vector2d {
  return [Math.abs(distance[0] / deltaTime), Math.abs(distance[1] / deltaTime)];
}

export function getMovement(
  position: Vector2d,
  initialPosition: Vector2d,
): Vector2d {
  return [position[0] - initialPosition[0], position[1] - initialPosition[1]];
}

export function isOverThreshold(
  movement: Vector2d,
  threshold: Vector2d,
): boolean {
  return (
    Math.abs(movement[0]) > threshold[0] || Math.abs(movement[1]) > threshold[1]
  );
}
