"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  children: React.ReactNode;
  isOn: boolean;
  isNotesOpen: boolean;
}

function Portal({ children, isOn, isNotesOpen }: Props) {
  const container = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // create element
    if (!container.current) {
      container.current = document.createElement("nav");
      container.current.id = "notes";
    }
    container.current.className = cn(
      isNotesOpen
        ? "[&>section]:animate-fade-down"
        : "[&>section]:animate-dissapear-up [&>section]:transition-all"
    );

    document.body.appendChild(container.current);

    return () => {
      container.current && document.body.removeChild(container.current);
    };
  }, [isNotesOpen]);

  useEffect(() => {
    if (isOn) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOn]);

  return (
    <>
      {isOn &&
        document.body &&
        createPortal(<>{children}</>, container.current ? container?.current : document.body)}
    </>
  );
}

export default Portal;
