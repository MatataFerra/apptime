import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useState } from "react";

import type { Contribution, Tax } from "@prisma/client";

import { ITEMS_PER_PAGE } from "@/components/structures/SalaryItems/SalaryItemsFromDB/SalaryItemsFromDB";
import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

type Props = {
  page: number;
  maxPages: number;
  classes?: string;
  salaryElements?: Tax[] | Contribution[];
  userNotification?: ReactNode;
  setPage: Dispatch<SetStateAction<number>>;
  setSearch?: (value: string) => void;
};

const START_PAGINATION = 1;

function Buttons({
  page,
  maxPages,
  classes,
  salaryElements,
  setSearch,
  setPage,
  userNotification,
}: Props) {
  const [disabled, setDisabled] = useState({
    back: false,
    forward: false,
  });

  useEffect(() => {
    if ((salaryElements?.length ?? 0) < ITEMS_PER_PAGE) {
      setDisabled({
        forward: true,
        back: true,
      });
    } else if (page >= maxPages) {
      setDisabled({
        forward: true,
        back: false,
      });
    } else {
      setDisabled({
        forward: false,
        back: true,
      });
    }
  }, [maxPages, page, salaryElements?.length]);

  return (
    <Stack classes="relative mt-4 w-full" justifyContent="end">
      <Button
        type="button"
        variant="white"
        size="sm"
        disabled={disabled.back}
        classes={`size-10 border-none p-2 font-medium transition-all ${classes}`}
        onClick={() => {
          setSearch && setSearch("");
          if (page === START_PAGINATION) return;
          setPage((prev) => prev - 1);
        }}
      >
        {"<"}
      </Button>
      <Button
        type="button"
        variant="black"
        size="sm"
        classes={`size-10 p-2 font-medium transition-all ${classes}`}
        disabled={disabled.forward}
        onClick={() => {
          if (page >= maxPages) return;
          setPage((prev) => prev + 1);
        }}
      >
        {">"}
      </Button>
      {userNotification}
    </Stack>
  );
}

export default Buttons;
