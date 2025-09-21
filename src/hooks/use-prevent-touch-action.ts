import { RefObject, useRef } from "react";
import useEventListener from "@/hooks/use-event-listener";
import { Vector2d } from "@/types";
import { getDirection, getDistance, getPosition } from "@/utils/dnd";
import { canScrollInDirection } from "@/utils/scroll";

type UsePreventTouchActionParams = {
  ref: RefObject<HTMLElement | null>;
  onChange: (arg: { defaultPrevented: boolean }) => void;
};

export function usePreventTouchAction(params: UsePreventTouchActionParams) {
  const { ref, onChange } = params;

  const tracked = useRef({
    initialPosition: null as Vector2d | null,
  });

  useEventListener(
    "touchstart",
    (e) => {
      onChange({
        defaultPrevented: false,
      });
      tracked.current = {
        initialPosition: getPosition(e),
      };
    },
    ref as RefObject<HTMLElement>,
    {
      passive: false,
    },
  );

  useEventListener(
    "touchmove",
    (e) => {
      if (!tracked.current.initialPosition) return;

      const position = getPosition(e);
      const distance = getDistance(position, tracked.current.initialPosition);
      const direction = getDirection(distance);

      const target = e.target as HTMLElement;
      const root = ref.current!;

      const canScroll = canScrollInDirection(target, root, direction);

      if (canScroll) {
        // Allow browser default scrolling
        onChange({
          defaultPrevented: false,
        });
      } else {
        // Block browser default scrolling
        e.preventDefault();
        onChange({
          defaultPrevented: true,
        });
      }
    },
    ref as RefObject<HTMLElement>,
    {
      passive: false,
    },
  );
}
