"use client";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";

import { useCompareStore } from "@/store/useCompareStore";

function CompareButton() {
  const { setIsComparing, setIsLoading, reset, isComparing } = useCompareStore((state) => state);

  return (
    <Stack justifyContent="end" alignItems="center" classes="w-full">
      <Button
        disabled={isComparing}
        size="md"
        variant="primary"
        classes="order-2"
        onClick={() => {
          setIsComparing(true);
          setIsLoading(true);

          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }}
      >
        Compare!
      </Button>
      {isComparing ? (
        <Button
          size="sm"
          variant="outline"
          aria-label="Reset comparison"
          classes="order-1 size-9 p-0"
          onClick={() => reset()}
        >
          <Icon.reset width={"100%"} height="100%" className="scale-50 transform" />
        </Button>
      ) : null}
    </Stack>
  );
}

export default CompareButton;
