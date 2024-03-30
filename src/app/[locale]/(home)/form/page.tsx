import { redirect } from "next/navigation";

import UserService from "@/services/User";

import Buttons from "@/components/FormHome/Button";
import Content from "@/components/FormHome/Content";
import Stack from "@/components/ui/Stack";
import Stepper from "@/components/ui/Stepper";

export default async function Form() {
  const user = await UserService.getSessionUser();

  if (user?.formCompleted) {
    return redirect("/");
  }

  return (
    <Stack grid classes="grid-cols-1 grid-rows-[auto,70%,auto]">
      <Stepper />
      <Content />
      <Buttons />
    </Stack>
  );
}
