import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

type Props = {
  page: number;
  maxPages: number;
  userNotification?: ReactNode;
  classes?: string;
  setPage: Dispatch<SetStateAction<number>>;
  setSearch?: (value: string) => void;
};

const START_PAGINATION = 1;

function Buttons({ page, maxPages, classes, setSearch, setPage, userNotification }: Props) {
  const [disabled, setDisabled] = useState({
    left: false,
    right: false,
  });

  useEffect(() => {
    if (page === START_PAGINATION) {
      setDisabled({
        right: false,
        left: true,
      });

      return;
    }
  }, [page]);

  useEffect(() => {
    if (page >= maxPages) {
      setDisabled({
        right: true,
        left: false,
      });

      return;
    }
  }, [maxPages, page]);

  return (
    <Stack classes="relative mt-4 w-full" justifyContent="end">
      <Button
        type="button"
        variant="white"
        size="sm"
        disabled={disabled.left}
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
        disabled={disabled.right}
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
