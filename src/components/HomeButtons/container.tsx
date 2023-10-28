import { getServerSession } from "next-auth";

import db from "@/services/Database";
import UserService from "@/services/User";

import HomeButtons from "@/components/HomeButtons";
import Stack from "@/components/ui/Stack/index";

async function HomeButtonsContainer() {
  const session = await getServerSession();
  const user = await UserService.findUniqueUser({
    email: session?.user?.email,
  });

  return (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <HomeButtons user={user} />
    </Stack>
  );
}

export default HomeButtonsContainer;
