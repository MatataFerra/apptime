import UserService from "@/services/User";

import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

async function DrawerUserInfo() {
  const user = await UserService.getSessionUser();

  return (
    <>
      <Stack spacing={4}>
        {user?.image && (
          <Image classes="rounded-full" src={user.image} alt="logo" width={50} height={50} />
        )}
        <Stack orientation="vertical" spacing={0}>
          <Text variant="gradient" classes={`${GRADIENTS.gradient_1} font-bold tracking-widest`}>
            {user?.name}
          </Text>
          <Text classes="w-full tracking-widest">menú</Text>
        </Stack>
      </Stack>
    </>
  );
}

export default DrawerUserInfo;
