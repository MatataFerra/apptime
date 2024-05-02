import UserService from "@/services/User";

import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { shortEmail } from "@/utils/helpers/shortEmail";

async function DrawerUserInfo() {
  const user = await UserService.getSessionUser();
  const splitEmail = user?.email.split("@")!;

  return (
    <>
      <Stack spacing={4} alignItems="center" classes="p-4">
        {user?.image && (
          <Image classes="rounded-full" src={user.image} alt="logo" width={50} height={50} />
        )}
        <Stack orientation="vertical" spacing={0}>
          <Text classes="text-sm font-medium">{shortEmail({ user })}</Text>
        </Stack>
      </Stack>
    </>
  );
}

export default DrawerUserInfo;
