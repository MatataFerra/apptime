import UserService from "@/services/User";

import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

async function DrawerUserInfo() {
  const user = await UserService.getSessionUser();

  return (
    <>
      <Stack spacing={4}>
        {user?.image && (
          <Image classes="rounded-full" src={user.image} alt="logo" width={50} height={50} />
        )}
        <Stack orientation="vertical" spacing={0}>
          <Text gradient="secondary" classes="font-bold tracking-widest">
            {user?.name}
          </Text>
          <Text classes="w-full tracking-widest">menú</Text>
        </Stack>
      </Stack>
    </>
  );
}

export default DrawerUserInfo;
