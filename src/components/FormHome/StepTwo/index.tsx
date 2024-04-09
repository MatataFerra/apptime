"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Profile } from "@prisma/client";

import ShiftService from "@/services/Shift";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useFormStore } from "@/store/useFormStore";

function StepTwo() {
  const { register, setFocus } = useForm();
  const { profile, setProfile, detectInputType, formErrors } = useFormStore();

  useEffect(() => {
    if (formErrors.hourlyRate) return setFocus("hourlyRate");
    if (formErrors.startHour) return setFocus("startHour");
    if (formErrors.endHour) return setFocus("endHour");
  }, [formErrors.endHour, formErrors.hourlyRate, formErrors.startHour, setFocus]);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setProfile({ [name]: detectInputType(value) } as unknown as Omit<Profile, "id" | "userId">);
  }

  return (
    <Stack orientation="vertical" classes="mt-4">
      <Stack classes="mb-10"></Stack>

      <Stack orientation="horizontal">
        <Text classes="font-bold">When you start and finish your shift?</Text>
      </Stack>
      <Stack classes="w-3/4"></Stack>
    </Stack>
  );
}

export default StepTwo;
