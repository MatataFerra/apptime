"use client";

import { ReactElement } from "react";

import Portal from "@/components/ui/Portal";
import Stack from "@/components/ui/Stack";

import useDelayed from "@/hooks/useDelayed";

type Props = {
  children: ReactElement;
  isOpen: boolean;
  handleOutsideClick?: () => void;
};

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
        <Stack classes={`absolute inset-0 w-1/2 bg-slate-600 `}>{children}</Stack>
      </Portal>
    </>
  );
}

export default Drawer;
