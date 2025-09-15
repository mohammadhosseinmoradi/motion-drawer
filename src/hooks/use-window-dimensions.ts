import { useEffect, useState } from "react";
import useEventListener from "@/hooks/use-event-listener";

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    typeof window !== "undefined"
      ? {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        }
      : undefined,
  );

  useEffect(() => {
    setWindowDimensions({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
  }, []);

  useEventListener("resize", () => {
    setWindowDimensions({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
  });

  return windowDimensions;
}
