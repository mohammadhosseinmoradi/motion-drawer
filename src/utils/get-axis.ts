import { Direction } from "@/types";

export function getAxis(direction: Direction) {
  return direction === "top" || direction === "bottom" ? "y" : "x";
}
