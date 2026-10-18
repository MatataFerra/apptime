/**
 * Text styles. Colours come from the semantic tokens in globals.css.
 */
export const TEXT_VARIANTS = {
  default: "text-ink",
  title: "font-display text-3xl font-semibold tracking-tight text-ink",
  subtitle: "font-display text-xl font-semibold tracking-tight text-ink",
  body: "text-base text-ink",
  small: "text-sm text-ink-muted",
  label: "text-sm font-medium text-ink",
  error: "text-sm text-destructive",
  success: "text-sm text-accent",
};

/**
 * @deprecated Gradient text was part of the old visual identity.
 * Kept so existing `gradient` props still type-check; they render as plain ink.
 */
export const GRADIENTS = {
  title: "",
  secondary: "",
  error: "",
  poison: "",
  aquatic: "",
  broom: "",
  ocean: "",
  logo: "",
};

export const INPUT_VARIANTS = {
  default:
    "h-full w-full rounded-md border border-border-strong bg-surface text-base transition-colors focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15",
  error:
    "bg-surface text-ink border border-destructive focus-within:ring-3 focus-within:ring-destructive/15",
  success:
    "bg-surface text-ink border border-accent focus-within:ring-3 focus-within:ring-accent/15",
  warning:
    "bg-surface text-ink border border-warning focus-within:ring-3 focus-within:ring-warning/15",
  info: "bg-surface text-ink border border-border-strong focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15",
  outlined:
    "h-full w-full rounded-md border border-border-strong bg-surface text-base focus-within:border-accent",
  radio: "",
  underline: "bg-transparent pl-0 rounded-none",
};

export const HEADER_POSITION = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export const STACK_ORIENTATION = {
  horizontal: "flex",
  vertical: "flex flex-col",
} as const;

export const STACK_JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export const STACK_ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
} as const;

export const BADGE_STATUS = {
  active: "bg-primary text-primary-foreground",
  inactive: "border border-border-strong text-ink-subtle",
} as const;
