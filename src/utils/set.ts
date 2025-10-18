interface Style {
  [key: string]: string | undefined;
}

export function set(el: HTMLElement | null | undefined, styles: Style) {
  if (!el) return;
  Object.entries(styles).forEach(
    ([key, value]: [string, string | undefined]) => {
      if (value !== undefined) el.style.setProperty(key, value);
    },
  );
}
