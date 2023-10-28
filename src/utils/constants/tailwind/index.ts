export const TEXT_VARIANTS = {
  default: "text-base text-gray-800 dark:text-gray-100",
  title: "text-4xl font-bold text-gray-800 dark:text-gray-100",
  gradient: "text-transparent bg-gradient-to-r bg-clip-text",
  subtitle: "text-xl font-bold text-gray-800 dark:text-gray-100",
  error: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
};

export const GRADIENTS = {
  gradient_1: "from-blue-600 via-purple-500 to-orange-500",
  gradient_2: "from-hard-pink to-common-orange",
  error: "from-red-300 via-red-500 to-red-700",
};

export const BUTTON_VARIANTS = {
  primary: "shadow-button bg-aquatic p-3 font-bold text-black",
  secondary: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100 p-3",
  danger: "bg-red-500 text-white p-3",
  success: "bg-green-500 text-white p-3",
  warning: "bg-yellow-500 text-white p-3",
  info: "bg-blue-500 text-white p-3 font-bold text-white shadow-button",
  gradient: "bg-gradient-to-r from-blue-600 p-3 via-purple-500 to-orange-500 text-white",
  google: "bg-white text-black p-3 border border-gray-300 shadow-button",
  outlined: "bg-white text-black p-3",
  white:
    "bg-white text-black p-3 border border-black shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]",
  disabled: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-100 p-3",
  black:
    "bg-black text-white p-3 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]",
};

export const INPUT_VARIANTS = {
  default:
    "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
  error:
    "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent",
  success:
    "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent",
  warning:
    "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent",
  info: "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
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
} as const;
