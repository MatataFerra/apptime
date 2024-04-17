import { useEffect, useState } from "react";

function useDelayed(state: unknown, delay: number) {
  const [stateDelayed, seStateDalayed] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (state && !stateDelayed) {
      seStateDalayed(true);
    } else if (!state && stateDelayed) {
      timeout = setTimeout(() => {
        seStateDalayed(false);
      }, delay);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [state, delay, stateDelayed]);

  return stateDelayed;
}

export default useDelayed;
