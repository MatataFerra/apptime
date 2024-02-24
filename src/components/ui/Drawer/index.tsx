"use client";

import { ReactElement } from "react";

import { CSSClassNames } from "@/types";

import Portal from "@/components/ui/Portal";
import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";
import useDelayed from "@/hooks/useDelayed";

interface Props extends React.HTMLAttributes<HTMLElement> {
  isOpen: boolean;
  classes?: CSSClassNames;
  children: ReactElement | ReactElement[];
  handleOutsideClick?: () => void;
}

function Drawer({ children, isOpen, ...rest }: Props) {
  //delay the animation of the drawer
  const isOpenDelayed = useDelayed(isOpen, 500);

  return (
    <>
      <Portal
        isOn={isOpenDelayed}
        classes={`w-1/2 transition-all ${isOpen ? "[&>section]:animate-show-left" : "[&>section]:animate-show-right"}`}
        {...rest}
      >
        {isOpen && (
          <Stack
            as="div"
            classes={`absolute top-0 h-svh w-full animate-backdrop-blurry bg-[#80808033] transition-all`}
            onClick={rest.handleOutsideClick}
          />
        )}
        <Stack
          orientation="vertical"
          classes={cn(`absolute inset-0 w-3/4 bg-white p-4`, rest.classes)}
        >
          {children}
        </Stack>
      </Portal>
    </>
  );
}

export default Drawer;
