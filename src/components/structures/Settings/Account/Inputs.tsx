"use client";

import { useEffect } from "react";

import InputForm from "@/components/structures/Settings/InputForm";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { SETTINGS_FIELDS } from "@/utils/constants/settings";
import useUser from "@/hooks/useUser";

import { useSettingsStore } from "@/store/useSettingsStore";

function Inputs() {
  const { data: user, isLoading } = useUser();
  const { setValue, values } = useSettingsStore((state) => state);

  useEffect(() => {
    if (isLoading) return;
    if (!user?.email || !user.name) return;
    setValue({
      account: {
        name: user.name,
        email: user.email,
      },
    });
  }, [setValue, user?.email, user?.name, isLoading]);

  function onChangeInputs(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, id } = e.target;

    setValue({
      account: {
        ...values.account,
        [id]: value,
      },
    });
  }

  return (
    <Stack as="div" orientation="vertical" classes="w-full" spacing={0}>
      <InputForm
        id="name"
        loading={isLoading}
        fallback={<Skeleton classes="h-5 w-20"></Skeleton>}
        label={SETTINGS_FIELDS.account.name}
        data={values.account.name}
        onHandleChange={onChangeInputs}
      />
      <InputForm
        id="email"
        loading={isLoading}
        fallback={<Skeleton classes="h-5 w-20"></Skeleton>}
        label={SETTINGS_FIELDS.account.email}
        data={values.account.email}
        onHandleChange={onChangeInputs}
      />
    </Stack>
  );
}

export default Inputs;
