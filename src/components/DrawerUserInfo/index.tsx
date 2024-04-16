import UserService from "@/services/User";

import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

async function DrawerUserInfo() {
  const user = await UserService.getSessionUser();
  const splitEmail = user?.email.split("@")!;
  const shortEmail =
    splitEmail[0].length < 15
      ? splitEmail[0].slice(0, 15)
      : splitEmail[0].slice(0, 7) +
        "..." +
        splitEmail[0].slice(splitEmail[0].length - 5, splitEmail[0].length - 1);
  const joinEmail = [shortEmail, splitEmail[1]].join("@");

  return (
    <>
      <Stack spacing={4} alignItems="center" classes="p-4">
        {user?.image && (
          <Image classes="rounded-full" src={user.image} alt="logo" width={50} height={50} />
        )}
        <Stack orientation="vertical" spacing={0}>
          <Text classes="text-sm font-medium">{joinEmail}</Text>
        </Stack>
      </Stack>
    </>
  );
}

export default DrawerUserInfo;
