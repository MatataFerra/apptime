"use client";

import { useRouter } from "next/navigation";

import Img from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";

interface Props {
  withText?: boolean;
}

function Logo({ withText }: Props) {
  const router = useRouter();
  return (
    <Stack
      orientation="horizontal"
      alignItems="center"
      classes="cursor-pointer transition-all active:scale-95 active:transform"
      onClick={() => router.push(PATH_NAMES.HOME)}
    >
      <Img
        src="/assets/apptime-logo.svg"
        alt="Casual app logo"
        classes="size-8"
        width={0}
        height={0}
      />
      {withText ? (
        <Text
          as="h1"
          gradient="secondary"
          classes="select-none text-base font-bold active:animate-text active:duration-1000"
        >
          Casual app
        </Text>
      ) : null}
    </Stack>
  );
}

export default Logo;
