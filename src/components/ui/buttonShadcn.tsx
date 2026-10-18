import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { type ButtonVariant,buttonVariants as baseButtonVariants } from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";

// shadcn-style API on top of the shared button styles in ui/Button.
const VARIANT: Record<string, ButtonVariant> = {
  default: "primary",
  destructive: "danger",
  outline: "outline",
  secondary: "secondary",
  ghost: "ghost",
  link: "link",
};

const SIZE = {
  default: "sm",
  sm: "xs",
  lg: "md",
  icon: "icon",
} as const;

type ShadcnVariant = keyof typeof VARIANT;
type ShadcnSize = keyof typeof SIZE;

function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: { variant?: ShadcnVariant | null; size?: ShadcnSize | null; className?: string } = {}) {
  return cn(
    baseButtonVariants({ variant: VARIANT[variant ?? "default"], size: SIZE[size ?? "default"] }),
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ShadcnVariant | null;
  size?: ShadcnSize | null;
  asChild?: boolean;
}

const ButtonShadCn = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
  }
);
ButtonShadCn.displayName = "Button";

export { ButtonShadCn, buttonVariants };
