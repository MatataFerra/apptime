import { useMemo } from "react";

import { User } from "@prisma/client";

import { UserStore } from "@/types/store";

function useButtonStatus(user: UserStore, userIsActive: User["isActive"]) {
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
      if (userIsActive)
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

      if (!userIsActive)
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
  }, [user?.formCompleted, userIsActive]);

  return buttonStatus;
}

export default useButtonStatus;
