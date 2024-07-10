import {
  type Dispatch,
  PropsWithChildren,
  ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

type Props = {
  page: number;
  maxPages: number;
  userNotification?: ReactNode;
  setSearch?: (value: string) => void;
  setPage: Dispatch<SetStateAction<number>>;
};

const START_PAGINATION = 1;

function Buttons({ page, maxPages, setSearch, setPage, userNotification }: Props) {
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
    if (page === maxPages) {
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
        classes="size-10 border-none p-2 font-medium"
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
        classes="size-10 p-2 font-medium"
        disabled={disabled.right}
        onClick={() => {
          if (page === maxPages) return;
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
