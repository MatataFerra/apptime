import { UserType } from "@/types";

import Text from "@/components/ui/Text";

import { shortEmail } from "@/utils/helpers/shortEmail";

interface Props {
  user?: UserType | null;
}

function WelcomeTitle({ user }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="title" classes="text-2xl">
        Welcome
      </Text>

      {user?.name ? (
        <Text gradient="title" classes="balance_text text-2xl font-bold">
          {user.name.split(" ")[0].trim()}
        </Text>
      ) : user?.email ? (
        <Text gradient="title" classes="balance_text text-2xl font-bold">
          {shortEmail({ user })}
        </Text>
      ) : (
        <Text gradient="title" classes="balance_text animate-text text-base font-bold">
          Manage your work
        </Text>
      )}
    </div>
  );
}

export default WelcomeTitle;
