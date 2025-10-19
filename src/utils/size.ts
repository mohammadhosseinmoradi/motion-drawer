type GetSizeParams = {
  element: HTMLElement;
  width?: string;
  height?: string;
};

export function getComputedSize(params: GetSizeParams) {
  const { element, height, width } = params;

  const computedStyle = window.getComputedStyle(element);

  const clone = element.cloneNode(true) as HTMLElement;
  const cstyle = clone.style;

  cstyle.position = "absolute";
  cstyle.visibility = "hidden";
  cstyle.pointerEvents = "none";
  cstyle.contain = "layout";
  cstyle.boxSizing = computedStyle.boxSizing as any;

  cstyle.width = width || cstyle.width;
  cstyle.height = height || cstyle.height;

  document.body.appendChild(clone);
  const rect = clone.getBoundingClientRect();
  clone.remove();

  return {
    width: rect.width,
    height: rect.height,
  };
}

export function getSize(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
  };
}
