import { forwardRef, type ReactElement, type ReactNode, type Ref } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import type { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

/**
 * Single source of truth for button styles.
 * Also used by `ButtonShadCn` so Radix/shadcn pieces look the same.
 *
 * Visual variants:
 * - primary: ink, the default action on a screen
 * - accent: green, money / start-the-clock actions
 * - secondary: quiet filled action
 * - outline: bordered surface, alternative action
 * - ghost: no chrome, for toolbars and icon buttons
 * - danger: destructive actions
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md text-center font-medium whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
    "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground shadow-xs hover:bg-accent/90",
        secondary: "bg-surface-sunken text-ink hover:bg-border",
        outline: "border border-border-strong bg-surface text-ink shadow-xs hover:bg-surface-sunken",
        ghost: "bg-transparent text-ink hover:bg-surface-sunken",
        danger: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        link: "h-auto bg-transparent p-0 text-accent underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

/**
 * Old variant names still used across the app, mapped to the new set.
 * Prefer the new names in new code.
 */
const LEGACY_VARIANTS = {
  black: "primary",
  info: "primary",
  gradient_primary: "primary",
  success: "accent",
  teal: "accent",
  outlined: "outline",
  white: "outline",
  google: "outline",
  gradient_secondary: "outline",
  warning: "secondary",
  "post-it": "secondary",
  disabled: "secondary",
  rounded: "ghost",
} as const satisfies Record<string, ButtonVariant>;

type Variants = ButtonVariant | keyof typeof LEGACY_VARIANTS;

export function resolveButtonVariant(variant: Variants): ButtonVariant {
  return variant in LEGACY_VARIANTS
    ? LEGACY_VARIANTS[variant as keyof typeof LEGACY_VARIANTS]
    : (variant as ButtonVariant);
}

// Fixed widths kept from the previous design so existing layouts don't shift.
const WIDTH = {
  xs: "w-16",
  sm: "w-20",
  md: "w-28",
  lg: "w-40",
  icon: "",
} as const;

export const ButtonDefaultAsType = "button" as const;

type ButtonOwnProps<E extends React.ElementType> = {
  children?: ReactNode;
  as?: E;
  classes?: CSSClassNames;
  variant?: Variants;
  size?: keyof typeof WIDTH;
};

type Props<E extends React.ElementType> = ButtonOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof ButtonOwnProps<E>>;

function Button<E extends React.ElementType = typeof ButtonDefaultAsType>(
  props: Props<E>,
  ref: Ref<HTMLButtonElement>
): ReactElement {
  const { as, classes, variant = "primary", children, size = "lg", ...rest } = props;
  const Component = as || ButtonDefaultAsType;
  const resolved = resolveButtonVariant(variant);

  return (
    <Component
      ref={ref}
      className={cn(
        buttonVariants({ variant: resolved, size }),
        WIDTH[size],
        variant === "rounded" && "rounded-full",
        classes?.trim()
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

const component = forwardRef<HTMLButtonElement, Props<"button">>(Button);

export default component;
