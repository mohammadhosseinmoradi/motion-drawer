import { createContext, RefObject, use } from "react";
import { Direction } from "@/types";

export const DrawerContext = createContext<{
  drawerRef: RefObject<HTMLElement | null>;
  headerRef: RefObject<HTMLElement | null>;
  bodyRef: RefObject<HTMLElement | null>;
  actionsRef: RefObject<HTMLElement | null>;
  maxSize: number;
  direction: Direction;
} | null>(null);

export function useDrawerContext() {
  const context = use(DrawerContext);
  if (context === null) {
    const error = new Error(
      "useDrawerContext must be used within a <DrawerContext>",
    );
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, useDrawerContext);
    }
    throw error;
  }
  return context;
}
