import { useEffect, useState } from "react";

/**
 * Follows `state`, but stays true for `delay` ms after it turns false,
 * so closing animations can finish.
 */
function useDelayed(state: unknown, delay: number) {
  const on = Boolean(state);
  const [previous, setPrevious] = useState(on);
  // Bumped on every true -> false change; each one starts a new timer.
  const [closing, setClosing] = useState(0);
  const [lingering, setLingering] = useState(false);

  if (previous !== on) {
    setPrevious(on);
    if (!on) {
      setLingering(true);
      setClosing((n) => n + 1);
    }
  }

  useEffect(() => {
    if (!closing) return;
    const timeout = setTimeout(() => setLingering(false), delay);
    return () => clearTimeout(timeout);
  }, [closing, delay]);

  return on || lingering;
}

export default useDelayed;
