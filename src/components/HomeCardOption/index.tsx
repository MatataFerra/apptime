"use client";

import { useRouter } from "next/navigation";

import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  title: string;
  path: string;
};

function HomeCardOption({ title, path }: Props) {
  const router = useRouter();

  return (
    <Stack
      orientation="vertical"
      justifyContent="center"
      alignItems="center"
      onClick={() => router.push(path)}
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        classes={`size-12 cursor-pointer rounded-lg p-2 shadow-input active:shadow-inner`}
      >
        <div className={`size-fit`}>
          {title === "Fast" ? (
            <Icon.lightning />
          ) : title === "Track" ? (
            <Icon.clock width={26} height={26} />
          ) : title === "Production" ? (
            <Icon.box width={26} height={26} />
          ) : (
            <Icon.eye />
          )}
        </div>
      </Stack>
      <Text classes="text-xs font-medium">{title}</Text>
    </Stack>
  );
}

export default HomeCardOption;
