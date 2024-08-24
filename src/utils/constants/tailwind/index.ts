export const TEXT_VARIANTS = {
  default: "text-gray-800 dark:text-gray-100",
  title: "text-4xl font-bold text-gray-800 dark:text-gray-100",
  subtitle: "text-xl font-bold text-gray-800 dark:text-gray-100",
  body: "text-base text-gray-800 dark:text-gray-100",
  small: "text-sm text-gray-800 dark:text-gray-100",
  label: "text-sm font-bold text-gray-800 dark:text-gray-100",
  error: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
};

export const GRADIENTS = {
  title: "from-hard-pink to-common-orange",
  secondary: "from-blue-600 via-purple-500 to-orange-500",
  error: "from-red-300 via-red-500 to-red-700",
  poison: "from-light-blue to-poison",
  aquatic: "from-aquatic to-salmon",
  broom: "from-common-orange to-slate-blue",
  ocean: "from-ocean to-hard-pink",
  logo: "from-light-blue via-slate-blue to-rose",
};

export const BUTTON_VARIANTS = {
  primary:
    "shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] bg-aquatic p-3 font-bold text-black",
  secondary: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100 p-3",
  danger:
    "bg-red-500 text-white p-3 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:bg-red-700/80 active:shadow-button-inner",
  success:
    "bg-green-500 text-white p-3 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] active:shadow-button-inner",
  warning: "bg-yellow-500 text-white p-3",
  info: "bg-blue-500 text-white p-3 font-bold text-white shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:bg-blue-600 transition-colors",
  rounded: "text-black p-3 rounded-full bg-transparent",
  gradient_primary: "border_gradient_1",
  gradient_secondary: "border_gradient_2",
  google: "bg-white text-black p-3 border border-gray-300 shadow-button",
  outlined: "bg-white text-black p-3",
  white: "bg-white text-black p-3 border border-slate-800 shadow-button",
  disabled: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-100 p-3 cursor-not-allowed",
  black:
    "bg-slate-950 text-white p-3 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]",
  teal: "bg-light-blue text-white p-3 text-black shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] active:shadow-button-inner",
  "post-it":
    "bg-post-it-button text-white p-3 text-black shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] active:shadow-button-inner",
};

export const INPUT_VARIANTS = {
  default:
    "h-full w-full rounded-md bg-white text-base shadow-input focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
  error:
    "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent",
  success:
    "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent",
  warning:
    "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent",
  info: "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
  outlined: "h-full w-full rounded-md bg-white text-base",
  radio: "",
  underline: "bg-transparent pl-0 rounded-none focus:outline-none",
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
  active: "bg-black text-white",
  inactive: "border border-stone-300 text-stone-400",
} as const;
