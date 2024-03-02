export type TAILWIND_COLOR =
  | `${keyof typeof TAILWIND_TYPE_COLOR}-${keyof typeof TAILWIND_COLORS}-${keyof typeof TAILWIND_NUMBER_COLORS}`
  | `${keyof typeof TAILWIND_TYPE_COLOR}-${EXTENDED_COLORS}`
  | `${keyof typeof TAILWIND_TYPE_COLOR}-${BASE_COLORS}`;

export type BG_TAILWIND_COLOR =
  `${Extract<keyof typeof TAILWIND_TYPE_COLOR, "bg">}-${keyof typeof TAILWIND_COLORS}-${keyof typeof TAILWIND_NUMBER_COLORS}`;

export type FROM_TO_TAILWIND_COLOR = {
  from:
    | `from-${keyof typeof TAILWIND_COLORS}-${keyof typeof TAILWIND_NUMBER_COLORS}`
    | `from-[#${string}]`;
  to:
    | `to-${keyof typeof TAILWIND_COLORS}-${keyof typeof TAILWIND_NUMBER_COLORS}`
    | `to-[#${string}]`;
};

type EXTENDED_COLORS =
  | "aquatic"
  | "common_orange"
  | "light-gold"
  | "hard-pink"
  | "light-blue"
  | "post-it-button";

type BASE_COLORS = "black" | "white";

const TAILWIND_NUMBER_COLORS = {
  50: 50,
  100: 100,
  200: 200,
  300: 300,
  400: 400,
  500: 500,
  600: 600,
  700: 700,
  800: 800,
  900: 900,
} as const;

const TAILWIND_TYPE_COLOR = {
  bg: "bg",
  text: "text",
  border: "border",
} as const;

const TAILWIND_COLORS = {
  red: "red",
  orange: "orange",
  amber: "amber",
  yellow: "yellow",
  lime: "lime",
  green: "green",
  emerald: "emerald",
  teal: "teal",
  cyan: "cyan",
  lightBlue: "lightBlue",
  blue: "blue",
  indigo: "indigo",
  violet: "violet",
  purple: "purple",
  fuchsia: "fuchsia",
  pink: "pink",
  rose: "rose",
  gray: "gray",
  stone: "stone",
} as const;
