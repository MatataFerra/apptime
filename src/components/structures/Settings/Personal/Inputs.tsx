"use client";

import { useEffect } from "react";

import InputForm from "@/components/structures/Settings/InputForm";
import Dropdown from "@/components/structures/Settings/Personal/Dropdown";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { SETTINGS_FIELDS } from "@/utils/constants/settings";
import getCountryData from "@/utils/helpers/getCountryData";
import useUser from "@/hooks/useUser";

import { useSettingsStore } from "@/store/useSettingsStore";

function Inputs() {
  const { data: user, isLoading } = useUser();

  const { setValue, values } = useSettingsStore((state) => state);

  useEffect(() => {
    setValue({
      personal: {
        city: user?.profile?.city ?? "",
        country: user?.profile?.country ?? "",
        firstname: user?.profile?.firstName ?? "",
        lastname: user?.profile?.lastName ?? "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onChangeInputs(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, id } = e.target;

    setValue({
      personal: {
        ...values.personal,
        [id]: value,
      },
    });
  }

  return (
    <Stack as="div" orientation="vertical" classes="w-full" spacing={0}>
      <InputForm
        id="country"
        label="Country"
        loading={isLoading}
        fallback={<Skeleton classes="h-5 w-20"></Skeleton>}
        fallbackData={
          values.personal.country &&
          `${getCountryData(values.personal.country).flag} ${values.personal.country}`
        }
      >
        <Dropdown
          staleTitle="Select country"
          searchingTitle="Found your country"
          setSelected={(value) =>
            setValue({
              personal: {
                ...values.personal,
                country: value,
              },
            })
          }
        />
      </InputForm>
      <InputForm
        id="city"
        loading={isLoading}
        fallback={<Skeleton classes="h-5 w-20"></Skeleton>}
        label={SETTINGS_FIELDS.personal.city}
        data={values.personal.city}
        onHandleChange={onChangeInputs}
      />
    </Stack>
  );
}

export default Inputs;
