"use client";
import { useForm } from "react-hook-form";

import { Profile } from "@prisma/client";

import ProfileService from "@/services/Profile";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useFormStore } from "@/store/useFormStore";

function StepTwo() {
  const { register } = useForm();
  const { profile, setProfile, detectInputType } = useFormStore();

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setProfile({ [name]: detectInputType(value) } as unknown as Omit<Profile, "id" | "userId">);
  }

  return (
    <Stack orientation="vertical" classes="mt-4">
      <Stack classes="mb-10">
        <Input
          classes="w-2/6"
          isRequired
          type="number"
          label="Hour value"
          measure="$"
          measurePlace="left"
          {...register("hourlyRate", {
            onChange: onInputChange,
            value: !!profile.hourlyRate && profile.hourlyRate,
          })}
        />
        {/* <Input
          type="number"
          label="Extra for shift?"
          description="By default is 0"
          measure="$"
          measurePlace="left"
          {...register("extraNightShiftPay", {
            onChange: onInputChange,
            value: !!profile.extraNightShiftPay && profile.extraNightShiftPay,
          })}
        /> */}
      </Stack>

      <Stack orientation="horizontal">
        <Text classes="font-bold">When you start and finish your shift?</Text>
      </Stack>
      <Stack classes="w-3/4">
        <Input
          isRequired
          type="time"
          label="Start time"
          {...register("startHour", {
            onChange: onInputChange,
            value: ProfileService.convertFloatInHour(profile.startHour),
          })}
        />
        <Input
          isRequired
          type="time"
          label="Finish time"
          {...register("endHour", {
            onChange: onInputChange,
            value: ProfileService.convertFloatInHour(profile.endHour),
          })}
        />
      </Stack>
    </Stack>
  );
}

export default StepTwo;
