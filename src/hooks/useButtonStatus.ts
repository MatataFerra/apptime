import { useMemo } from "react";

import { User } from "@prisma/client";

import { UserStore } from "@/types/store";

function useButtonStatus(user: UserStore, userIsActive: User["isActive"] | undefined) {
  const buttonStatus = useMemo(() => {
    if (!user?.formCompleted)
      return {
        startButton: {
          disabled: true,
          apply_variant: false,
        },
        finishButton: {
          disabled: true,
          apply_variant: false,
        },
      };

    if (user?.formCompleted) {
      if (userIsActive || typeof userIsActive === "undefined") {
        return {
          startButton: {
            disabled: false,
            apply_variant: true,
          },
          finishButton: {
            disabled: true,
            apply_variant: false,
          },
        };
      }

      if (!userIsActive) {
        return {
          startButton: {
            disabled: true,
            apply_variant: false,
          },
          finishButton: {
            disabled: false,
            apply_variant: true,
          },
        };
      }
    }
  }, [user?.formCompleted, userIsActive]);

  return buttonStatus;
}

export default useButtonStatus;
