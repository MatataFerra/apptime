"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/helpers/styleMerger";

import { useNotesStore } from "@/store/useNotesStore";

interface Props {
  children: React.ReactNode;
}

function Portal({ children }: Props) {
  const { isOn, isNotesOpen } = useNotesStore();

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
            <section className={cn("absolute top-0 h-52 w-full rounded-lg bg-white p-4 shadow-lg")}>
              {children}
            </section>
          </>,
          container?.current!
        )}
    </nav>
  );
}

export default Portal;
