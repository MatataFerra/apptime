"use client";

import { HTMLAttributes, ReactNode, useRef } from "react";

import { useOnClickOutside } from "usehooks-ts";

import { CSSClassNames } from "@/types";

import Box from "@/components/ui/Box";

import { cn } from "@/utils/helpers/styleMerger";
import useDelayed from "@/hooks/useDelayed";

interface Props extends HTMLAttributes<HTMLElement> {
  isOpen: boolean;
  classes?: CSSClassNames;
  children: ReactNode;
  handleOutsideClick?: () => void;
}

function Drawer({ children, isOpen, handleOutsideClick, ...rest }: Props) {
  //delay the animation of the drawer
  const delayOpen = useDelayed(isOpen, 100);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside([ref], () => {
    isOpen && handleOutsideClick && handleOutsideClick();
  });

  return (
    <>
      {delayOpen && (
        <Box
          ref={ref}
          classes={cn(
            `absolute flex flex-col transition-all duration-300 ${isOpen ? "animate-fade-in" : "animate-fade-out"}`,
            rest.classes
          )}
          {...rest}
        >
          {children}
        </Box>
      )}
    </>
  );
}

export default Drawer;
