/**
 * Deep copy of plain data (objects, arrays, dates), like shifts and their
 * taxes. Does what lodash's cloneDeep did for them without its ~25 KB of
 * internals in every page that computes earnings. Class instances come
 * back as plain objects.
 */
export function clonePlain<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => clonePlain(item)) as T;
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (value !== null && typeof value === "object") {
    const copy: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) copy[key] = clonePlain(item);
    return copy as T;
  }
  return value;
}
