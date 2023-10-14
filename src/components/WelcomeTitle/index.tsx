import { getServerSession } from "next-auth";

import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

type UserSession = {
  user: {
    name: string;
    email: string;
    image: string;
  };
};

interface Props {
  username?: string;
}

async function WelcomeTitle({ username }: Props) {
  const session: UserSession | null = await getServerSession();
  return (
    <>
      <div className="flex flex-col gap-4">
        <Text variant="title" classes="text-5xl">
          Welcome
        </Text>
        <Text variant="gradient" classes={`fit-text text-5xl font-bold ${GRADIENTS.gradient_2}`}>
          {username ? username.split(" ")[0] : session?.user.name.split(" ")[0]}
        </Text>
      </div>
    </>
  );
}

export default WelcomeTitle;
