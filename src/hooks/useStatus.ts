import { useEffect, useState } from "react";

function useStatus(state: boolean | undefined) {
  const [status, setStatus] = useState(false);

  useEffect(() => {
    if (typeof state === "undefined") {
      setStatus(false);
      return;
    }
    if (!state) {
      return setStatus(false);
    }

    setStatus(true);
  }, [state]);

  return status;
}

export default useStatus;
