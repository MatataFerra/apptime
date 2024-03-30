import { useEffect, useState } from "react";

function useDelayed(state: unknown, delay: number) {
  const [stateDelayed, seStateDalayed] = useState(false);

  useEffect(() => {
    if (state) {
      seStateDalayed(true);
    } else {
      setTimeout(() => {
        seStateDalayed(false);
      }, delay);
    }
  }, [state, delay]);

  return stateDelayed;
}

export default useDelayed;
