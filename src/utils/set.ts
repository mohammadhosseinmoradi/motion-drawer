interface Style {
  [key: string]: string;
}

export function set(el: HTMLElement | null | undefined, styles: Style) {
  if (!el) return;
  Object.entries(styles).forEach(([key, value]: [string, string]) => {
    el.style.setProperty(key, value);
  });
}
