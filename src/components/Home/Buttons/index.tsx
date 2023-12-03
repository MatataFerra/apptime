"use client";

import { useMemo, useState } from "react";

import { User } from "@prisma/client";

import Button from "@/components/ui/Button";

type Props = {
  user: User | null;
};

function HomeButtons({ user }: Props) {
  const [userIsActive, setUserIsActive] = useState(user?.isActive);
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

  function onStartShift() {
    setUserIsActive(true);
  }

  function onFinishShift() {
    setUserIsActive(false);
  }

  return (
    <>
      <Button
        classes={`remove_button_highlight w-full shadow-button ${
          buttonStatus?.startButton.apply_variant ? "active:shadow-button-inner" : ""
        }`}
        variant={buttonStatus?.startButton.apply_variant ? "black" : "disabled"}
        disabled={buttonStatus?.startButton.disabled}
        onClick={onStartShift}
      >
        Start Shift
      </Button>
      <Button
        classes={`remove_button_highlight w-full shadow-button ${
          buttonStatus?.finishButton.apply_variant ? "active:shadow-button-inner" : ""
        }`}
        variant={buttonStatus?.finishButton.apply_variant ? "danger" : "disabled"}
        disabled={buttonStatus?.finishButton.disabled}
        onClick={onFinishShift}
      >
        Finish Shift
      </Button>
    </>
  );
}

export default HomeButtons;
