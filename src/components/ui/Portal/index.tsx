"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { CSSClassNames } from "@/types";

import { generateRandomID } from "@/utils/helpers/generateRandomID";
import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  id?: string;
  isOn: boolean;
  targetSelector?: string;
  children: React.ReactNode;
  classes?: CSSClassNames;
  handleOutsideClick?: () => void;
}

function Portal({
  children,
  isOn,
  classes,
  id,
  handleOutsideClick,
  targetSelector,
  ...props
}: Props) {
  const isWindow = useMemo(() => typeof window !== "undefined", []);
  const container = useRef<HTMLElement | null>(null);

  // create nav element
  useEffect(() => {
    const targetElement: HTMLElement | null =
      targetSelector && typeof targetSelector === "string"
        ? document.querySelector(targetSelector)
        : null;

    if (targetElement) {
      container.current = targetElement;
    } else {
      const newTargetElement = document.createElement("div");
      document.body.appendChild(newTargetElement);
      container.current = newTargetElement;
    }

    return () => {
      if (container.current && document.body.contains(container.current)) {
        document.body.removeChild(container.current);
        container.current.remove();
      }
    };
  }, [targetSelector]);

  // set attributes
  useEffect(() => {
    if (!isWindow) return;
    if (!container.current) return;

    for (const [key, value] of Object.entries(props)) {
      container.current.setAttribute(key, value as string);
    }

    return () => {
      if (container.current) {
        for (const key of Object.keys(props)) {
          container.current.removeAttribute(key);
        }
      }
    };
  }, [isOn, isWindow, props]);

  // set id
  useEffect(() => {
    if (isOn && container.current && isWindow) {
      container.current.id = id || generateRandomID();
    }

    return () => {
      if (container.current) {
        container.current.removeAttribute("id");
      }
    };
  }, [id, isWindow, isOn]);

  // set classes
  useEffect(() => {
    if (isOn && container.current && isWindow) {
      container.current.className = cn(classes);
    }

    return () => {
      if (container.current) {
        container.current.removeAttribute("class");
      }
    };
  }, [classes, isWindow, isOn]);

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
    <>{isWindow && isOn && container.current ? createPortal(children, container.current) : null}</>
  );
}

export default Portal;
