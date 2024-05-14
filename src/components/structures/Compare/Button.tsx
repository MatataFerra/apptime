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
        variant="gradient_secondary"
        classes="order-2 shadow-button active:shadow-button-inner"
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
          variant="white"
          classes="order-1 w-fit animate-show-left shadow-button active:shadow-button-inner"
          onClick={() => reset()}
        >
          <Icon.reset width={"100%"} height="100%" className="scale-50 transform" />
        </Button>
      ) : null}
    </Stack>
  );
}

export default CompareButton;
