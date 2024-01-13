"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { CSSClassNames } from "@/types";

import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

import { useNotesStore } from "@/store/useNotesStore";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  children: React.ReactNode;
  classes?: CSSClassNames;
}

function Portal({ children, classes }: Props) {
  const { isOn, isNotesOpen } = useNotesStore((state) => state);

  const container = useRef<HTMLElement | null>(null);

  useEffect(() => {
    container.current = document.querySelector("#notes");
    document.body.appendChild(container.current!);
  }, []);

  useEffect(() => {
    if (isOn) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOn]);

  return (
    <nav
      id="notes"
      ref={container}
      className={cn(
        isNotesOpen
          ? "[&>section]:animate-fade-down"
          : "[&>section]:animate-dissapear-up [&>section]:transition-all"
      )}
    >
      {isOn &&
        document.body &&
        createPortal(
          <>
            <Stack
              classes={cn(
                "absolute top-0 h-52 w-full rounded-lg bg-white p-4 shadow-lg",
                classes ? classes : ""
              )}
            >
              {children}
            </Stack>
          </>,
          container?.current!
        )}
    </nav>
  );
}

export default Portal;
