import { useEffect } from "react";
import { useLatest } from "@/hooks/use-latest";

export function useWindowEvent<TType extends keyof WindowEventMap>(
  enabled: boolean,
  type: TType,
  listener: (ev: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  let listenerRef = useLatest(listener);

  useEffect(() => {
    if (!enabled) return;

    function handler(event: WindowEventMap[TType]) {
      listenerRef.current(event);
    }

    window.addEventListener(type, handler, options);
    return () => window.removeEventListener(type, handler, options);
  }, [enabled, type, options]);
}
