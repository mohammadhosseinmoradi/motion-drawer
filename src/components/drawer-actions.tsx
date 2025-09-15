import { Props } from "@/utils/render/types";
import { ElementType, Ref, useMemo, useRef } from "react";
import { useRender } from "@/utils/render";
import { DrawerRenderPropArg } from "@/types";
import { syncRefs } from "@/utils/sync-refs";
import { useDrawerContext } from "@/context";

const DEFAULT_DRAWER_ACTIONS_TAG = "div";

export type DrawerActionsProps<TTag extends ElementType> = Props<
  TTag,
  DrawerRenderPropArg,
  never,
  {
    ref?: Ref<HTMLElement>;
  }
>;

export function DrawerActions<
  TTag extends ElementType = typeof DEFAULT_DRAWER_ACTIONS_TAG,
>(props: DrawerActionsProps<TTag>) {
  const { style, ...theirProps } = props;

  const { actionsRef } = useDrawerContext();
  const ref = useRef<HTMLElement | null>(null);

  const slot = useMemo(() => {
    return {};
  }, []);

  const ourProps = {
    ref: syncRefs(ref, actionsRef),
    style: {
      ...style,
      touchAction: "none",
    },
  } as DrawerActionsProps<TTag>;

  const render = useRender();

  return render({
    ourProps,
    theirProps,
    slot,
    name: "DrawerActions",
    defaultTag: DEFAULT_DRAWER_ACTIONS_TAG,
  });
}
