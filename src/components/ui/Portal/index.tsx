"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { CSSClassNames } from "@/types";

import { generateRandomID } from "@/utils/helpers/generateRandomID";
import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  id?: string;
  isOn: boolean;
  children: React.ReactNode;
  classes?: CSSClassNames;
  handleOutsideClick?: () => void;
}

function Portal({ children, isOn, classes, id, handleOutsideClick, ...props }: Props) {
  const isWindow = useMemo(() => typeof window !== "undefined", []);
  const container = useRef<HTMLElement | null>(isWindow ? document.createElement("nav") : null);

  useEffect(() => {
    // create element
    if (!container.current) {
      container.current = document.createElement("nav");
    }

    id ? (container.current.id = id) : null;
    classes ? (container.current.className = cn(classes)) : null;

    // set attributes
    for (const [key, value] of Object.entries(props)) {
      container.current.setAttribute(key, value as string);
    }

    // append to body
    if (isOn) {
      document.body.appendChild(container.current);
    }

    return () => {
      isOn && container.current && document.body.removeChild(container.current);
    };
  }, [classes, id, isOn, props]);

  useEffect(() => {
    if (isOn) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOn]);

  // detect click outside
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (container.current && !container.current.contains(event.target as Node)) {
        handleOutsideClick && handleOutsideClick();
      }
    }

    if (isOn) {
      document.addEventListener("mousedown", onClickOutside);
    } else {
      document.removeEventListener("mousedown", onClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [handleOutsideClick, isOn]);

  return (
    <>
      {isOn &&
        isWindow &&
        createPortal(<>{children}</>, container.current ? container?.current : document.body)}
    </>
  );
}

export default Portal;
