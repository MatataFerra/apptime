"use client";

import { useState } from "react";

import { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

interface Props
  extends Omit<React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>, "className"> {
  classes?: CSSClassNames;
}

function Ripple({ classes, children }: Props) {
  const [isRippled, setIsRippled] = useState(false);

  function handleRipple() {
    setIsRippled(true);
    setTimeout(() => {
      setIsRippled(false);
    }, 1000);
  }
  return (
    <div
      onClick={() => handleRipple()}
      className={cn(
        "relative w-fit translate-x-0 translate-y-0 rounded-full after:absolute after:inset-0 after:-z-10 after:rounded-full after:bg-accent-soft after:opacity-0",
        isRippled ? "after:animate-ripple" : "",
        classes
      )}
    >
      {children}
    </div>
  );
}

export default Ripple;
