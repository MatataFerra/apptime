"use client";

import { UserType } from "@/types";

import Text from "@/components/ui/Text";

import { shortEmail } from "@/utils/helpers/shortEmail";
import useUser from "@/hooks/useUser";

interface Props {
  user?: UserType | null;
}

function WelcomeTitle({ user: userProp }: Props) {
  const { data } = useUser();
  const user = userProp ?? data;
  const name = user?.name
    ? user.name.split(" ")[0].trim()
    : user?.email
      ? shortEmail({ user })
      : null;

  return (
    <div className="flex flex-col gap-1">
      <Text as="p" variant="small">
        {name ? "Welcome back" : "Welcome"}
      </Text>
      <Text as="h1" variant="title" classes="balance_text text-4xl">
        {name ?? "Your work, in numbers"}
      </Text>
    </div>
  );
}

export default WelcomeTitle;
