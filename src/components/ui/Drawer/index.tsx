"use client";

import { CSSClassNames } from "@/types";

import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";
import useDelayed from "@/hooks/useDelayed";

interface Props extends React.HTMLAttributes<HTMLElement> {
  isOpen: boolean;
  classes?: CSSClassNames;
  children: React.ReactElement | React.ReactElement[];
  handleOutsideClick?: () => void;
}

function Drawer({ children, isOpen, handleOutsideClick, ...rest }: Props) {
  //delay the animation of the drawer
  const delayOpen = useDelayed(isOpen, 100);

  return (
    <>
      {delayOpen && (
        <Stack
          data-testid="drawer-menu"
          spacing={0}
          orientation="vertical"
          classes={cn(
            `absolute transition-all ${isOpen ? "animate-fade-in" : "animate-fade-out"}`,
            rest.classes
          )}
        >
          {children}
        </Stack>
      )}
    </>
  );
}

export default Drawer;
