import { UserType } from "@/types";

import Text from "@/components/ui/Text";

import { shortEmail } from "@/utils/helpers/shortEmail";

interface Props {
  user?: UserType | null;
}

function WelcomeTitle({ user }: Props) {
  const name = user?.name
    ? user.name.split(" ")[0].trim()
    : user?.email
      ? shortEmail({ user })
      : null;

  return (
    <div className="flex flex-col gap-1">
      <Text as="p" variant="small">
        Welcome back
      </Text>
      <Text as="h1" variant="title" classes="balance_text text-4xl">
        {name ?? "Manage your work"}
      </Text>
    </div>
  );
}

export default WelcomeTitle;
