import { useEffect, useState } from "react";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function useButtonStatus() {
  const { user, isShiftActive } = useShiftStateContext((state) => state);

  const [btnStatus, setbtnStatus] = useState({
    startButton: {
      disabled: true,
      apply_variant: false,
    },
    finishButton: {
      disabled: true,
      apply_variant: false,
    },
  });

  useEffect(() => {
    if (!user?.formCompleted)
      return setbtnStatus((prev) => ({
        ...prev,
        startButton: {
          disabled: true,
          apply_variant: false,
        },
        finishButton: {
          disabled: true,
          apply_variant: false,
        },
      }));

    if (user?.formCompleted) {
      if (typeof isShiftActive === "undefined")
        return setbtnStatus((prev) => ({
          ...prev,
          startButton: {
            disabled: false,
            apply_variant: true,
          },
          finishButton: {
            disabled: true,
            apply_variant: false,
          },
        }));

      if (!isShiftActive) {
        return setbtnStatus((prev) => ({
          ...prev,
          startButton: {
            disabled: true,
            apply_variant: false,
          },
          finishButton: {
            disabled: false,
            apply_variant: true,
          },
        }));
      }

      return setbtnStatus((prev) => ({
        ...prev,
        startButton: {
          disabled: false,
          apply_variant: true,
        },
        finishButton: {
          disabled: true,
          apply_variant: false,
        },
      }));
    }
  }, [isShiftActive, user?.formCompleted]);

  return btnStatus;
}

export default useButtonStatus;
