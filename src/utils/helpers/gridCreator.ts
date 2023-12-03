export function gap(gap: number) {
  return `gap-[${gap * 0.25}rem]`;
}

export function gridTemplate(element?: number | string) {
  if (!element) return undefined;

  if (typeof element === "string") {
    return element;
  }

  const max = Math.max(element, 1);

  return `repeat(${max}, minmax(0, 1fr))`;
}
