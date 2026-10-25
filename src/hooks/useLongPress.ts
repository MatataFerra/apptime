"use client";

import { type MouseEvent, type PointerEvent, useEffect, useRef } from "react";

/** How long a press must last, and how far the finger may drift (a scroll cancels it). */
const HOLD_MS = 500;
const SLOP_PX = 10;

/**
 * Press and hold: calls `onLongPress` after HOLD_MS without lifting or
 * moving (moving means scrolling). The click that follows the release is
 * swallowed, so the element doesn't also do its normal tap action — even
 * when the long press re-renders a different element under the finger.
 * The phone's own long-press menu (copy, look up…) is turned off.
 */
function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  const callback = useRef(onLongPress);
  useEffect(() => {
    callback.current = onLongPress;
  });

  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  }

  useEffect(() => cancel, []);

  /** Eats the click the browser sends after the release, wherever it lands. */
  function swallowNextClick() {
    function stop(event: Event) {
      event.preventDefault();
      event.stopPropagation();
      clear();
    }
    function clear() {
      window.removeEventListener("click", stop, true);
    }
    window.addEventListener("click", stop, true);
    // No click came (the finger slid off): don't eat a later, real one.
    setTimeout(clear, 1000);
  }

  return {
    onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      fired.current = false;
      start.current = { x: event.clientX, y: event.clientY };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        fired.current = true;
        swallowNextClick();
        navigator.vibrate?.(15);
        callback.current();
      }, HOLD_MS);
    },
    onPointerMove(event: PointerEvent) {
      if (!start.current) return;
      const dx = event.clientX - start.current.x;
      const dy = event.clientY - start.current.y;
      if (dx * dx + dy * dy > SLOP_PX * SLOP_PX) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu(event: MouseEvent) {
      // Android fires this on a long press; the selection handles it instead.
      event.preventDefault();
    },
    onClick(event: MouseEvent) {
      if (!fired.current) return;
      fired.current = false;
      event.preventDefault();
    },
  };
}

export default useLongPress;
