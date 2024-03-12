import { UserType } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

interface Props {
  user?: UserType | null;
}

function WelcomeTitle({ user }: Props) {
  return (
    <>
      <div className="flex flex-col gap-4">
        <Text variant="title" classes="text-5xl">
          Welcome
        </Text>

        {user?.name ? (
          <Text gradient="title" classes={`balance_text text-5xl font-bold`}>
            {user?.name.trim().slice(0, 10)}
          </Text>
        ) : (
          <Skeleton classes="h-9 w-52" />
        )}
      </div>
    </>
  );
}

export default WelcomeTitle;
