"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { Tax } from "@prisma/client";

import { observer } from "@/components/structures/Taxes/observer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

type TaxField = {
  [key: string]: string;
};

type Props = {
  addTax: (tax: Omit<Tax, "id">) => void;
};

function InputTax({ addTax }: Props) {
  const {
    register,
    watch,
    clearErrors,
    setError,
    setFocus,
    resetField,
    formState: { errors },
  } = useForm<TaxField>();

  /*
    Observes the submit of both forms and when they are done the callback is called
  */
  const { done, setDone } = observer();
  useEffect(() => {
    if (done) {
      clearErrors();
    }

    return () => {
      setDone(false);
    };
  }, [setDone, done, clearErrors]);

  function onAddingTax() {
    if (!watch("name")) {
      setError("name", {
        message: "Name of tax is required",
      });
      setFocus("name");
      return;
    }

    if (
      Number(watch("value")) <= 0 ||
      !watch("value") ||
      isNaN(Number(watch("value"))) ||
      Number(watch("value")) > 100
    ) {
      setError("value", {
        message: "Can't be 0 or more than 100%",
      });
      setFocus("value");
      return;
    }

    clearErrors();

    addTax({
      name: watch("name"),
      value: Number(watch("value")),
      description: watch("description"),
    });

    onRemovingTax();
  }

  function onRemovingTax() {
    resetField("name");
    resetField("value");
    resetField("description");
  }

  return (
    <Stack as="div" orientation="horizontal" grid cols={3} classes="w-full">
      <Input
        placeholder="Name of tax"
        classes="min-h-8 w-full text-sm"
        isError={!!errors["name"]}
        description={errors["name"]?.message}
        {...register("name", {
          onChange: () => {
            clearErrors("name");
          },
        })}
      />
      <Input
        placeholder="Value"
        type="number"
        max={100}
        classes="min-h-8 w-full text-sm"
        measure="%"
        isError={!!errors["value"]}
        description={errors["value"]?.message}
        {...register("value", {
          valueAsNumber: true,
          onChange: () => {
            clearErrors("value");
          },
        })}
      />
      <Input
        placeholder="add useful information..."
        classes="min-h-8 w-full text-sm"
        {...register("description")}
      />
      <Button
        type="button"
        variant="info"
        size="md"
        classes="col-span-3 w-full"
        onClick={() => onAddingTax()}
      >
        add tax
      </Button>
    </Stack>
  );
}

export default InputTax;
