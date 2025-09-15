import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export default function useUpdateEffect(
  effect: EffectCallback,
  deps: DependencyList
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
  }, deps);
}
