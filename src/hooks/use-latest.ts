import { useRef } from "react";
import { useIsomorphicEffect } from "./use-isomorphic-effect";

export function useLatest<T>(value: T) {
  const cache = useRef(value);

  useIsomorphicEffect(() => {
    cache.current = value;
  }, [value]);

  return cache;
}
