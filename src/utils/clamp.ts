export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}
