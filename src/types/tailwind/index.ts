// Loose typing for colour utility props (e.g. <Line color="bg-border" />).
// Prefer semantic tokens defined in src/app/globals.css.
export type TAILWIND_COLOR = `${"bg" | "text" | "border"}-${string}`;
