"use client";

import {
  type ChangeEvent,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useSettingsStore } from "@/store/useSettingsStore";

type Props = {
  label: string;
  id: string;
  data?: string | null;
  fallbackData?: string;
  fallback?: ReactNode;
  loading?: boolean;
  onHandleChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

function InputForm({
  label,
  data,
  id,
  fallback,
  loading,
  fallbackData,
  onHandleChange,
  children,
}: PropsWithChildren<Props>) {
  const { currentInput, setCurrentInput } = useSettingsStore((state) => state);
  const [hover, setOnHover] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (hover) {
      inputRef.current?.focus();
    }
  }, [hover]);

  useEffect(() => {
    if (currentInput !== id) {
      setOnHover(false);
    }
  }, [currentInput, id]);

  function onDataChange(e: ChangeEvent<HTMLInputElement>) {
    onHandleChange && onHandleChange(e);
  }

  return (
    <>
      <Stack as="div" grid cols={"1fr auto"} alignItems="center" classes="group min-h-7 w-full">
        {hover ? (
          children ? (
            <>{children}</>
          ) : (
            <Input
              ref={inputRef}
              id={id}
              type="text"
              variant="underline"
              placeholder={data ?? label}
              name={label}
              classes="line-clamp-2 h-fit min-h-fit w-fit animate-fade-in p-0 px-4 text-xs transition-all"
              value={data ?? ""}
              onChange={onDataChange}
              onKeyDown={(e) => e.key === "Enter" && setOnHover(false)}
              onFocus={(e) => e.target.select()}
            />
          )
        ) : (
          <Stack as="div" orientation="horizontal" alignItems="center" classes="px-4 text-xs">
            <Text as="span" classes="font-semibold" color="text-ink-muted">
              {`${label}: `}
            </Text>
            {loading ? (
              fallback
            ) : (
              <Text as="span" color="text-ink-muted" classes={id === "week" ? "capitalize" : ""}>
                {!!data ? data : !!fallbackData ? fallbackData : "N/A"}
              </Text>
            )}
          </Stack>
        )}
        {!hover ? (
          <Button
            type="button"
            size="xs"
            variant="info"
            classes="invisible ml-auto animate-fade-out justify-self-end transition-all group-hover:visible group-hover:animate-fade-in active:shadow-button-inner"
            onClick={() => {
              setOnHover(!hover);
              setCurrentInput(id);
            }}
          >
            Edit
          </Button>
        ) : (
          <Button
            type="button"
            size="xs"
            variant="success"
            classes="invisible ml-auto animate-fade-out justify-self-end transition-all group-hover:visible group-hover:animate-fade-in active:shadow-button-inner"
            onClick={() => setOnHover(!hover)}
          >
            Save
          </Button>
        )}
      </Stack>
    </>
  );
}

export default InputForm;
