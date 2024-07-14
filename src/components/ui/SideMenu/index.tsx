"use client";

import { type HTMLAttributes, type ReactNode, useRef } from "react";

import { useOnClickOutside } from "usehooks-ts";

import Box from "@/components/ui/Box";

import { cn } from "@/utils/helpers/styleMerger";
import useDelayed from "@/hooks/useDelayed";

interface Props extends HTMLAttributes<HTMLElement> {
  isOpen: boolean;
  classes?: string;
  children: ReactNode;
  handleOutsideClick?: () => void;
}

function SideMenu({ children, isOpen, handleOutsideClick, classes, ...rest }: Props) {
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
          role="dialog"
          classes={cn(
            `absolute flex flex-col transition-all duration-300 ${isOpen ? "animate-fade-in" : "animate-fade-out"} ${classes}`
          )}
          {...rest}
        >
          {children}
        </Box>
      )}
    </>
  );
}

export default SideMenu;
