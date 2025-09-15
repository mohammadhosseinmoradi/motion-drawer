import { Props } from "@/utils/render/types";
import { ElementType, Ref, useMemo, useRef } from "react";
import { useRender } from "@/utils/render";
import { DrawerRenderPropArg } from "@/types";
import { useDrawerContext } from "@/context";
import { syncRefs } from "@/utils/sync-refs";

const DEFAULT_DRAWER_HEADER_TAG = "div";

export type DrawerHeaderProps<TTag extends ElementType> = Props<
  TTag,
  DrawerRenderPropArg,
  never,
  {
    ref?: Ref<HTMLElement>;
  }
>;

export function DrawerHeader<
  TTag extends ElementType = typeof DEFAULT_DRAWER_HEADER_TAG,
>(props: DrawerHeaderProps<TTag>) {
  const { style, ...theirProps } = props;

  const { headerRef } = useDrawerContext();
  const ref = useRef<HTMLElement | null>(null);

  const slot = useMemo(() => {
    return {};
  }, []);

  const ourProps = {
    ref: syncRefs(ref, headerRef),
    style: {
      ...style,
      touchAction: "none",
    },
  } as DrawerHeaderProps<TTag>;

  const render = useRender();

  return render({
    ourProps,
    theirProps,
    slot,
    name: "DrawerHeader",
    defaultTag: DEFAULT_DRAWER_HEADER_TAG,
  });
}
