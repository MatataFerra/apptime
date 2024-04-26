"use client";

import { useRouter } from "next/navigation";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  gradient: {
    from: `from-${string}-${string}` | `from-${string}`;
    via?: `via-${string}-${string}` | `via-${string}`;
    to: `to-${string}-${string}` | `to-${string}`;
  };

  title: string;
  path: string;
  bgImage: "bg-box" | "bg-lightning" | "bg-clock";
};

function HomeCardOption({ gradient: { from, via, to }, title, path, bgImage }: Props) {
  const router = useRouter();

  return (
    <Stack
      style={{
        backgroundSize: "200% 200%",
      }}
      justifyContent="center"
      alignItems="center"
      onClick={() => router.push(path)}
      classes={`group relative h-full w-full cursor-pointer rounded-lg bg-gradient-to-tl bg-pos-0 font-medium shadow-input transition-all duration-500 hover:bg-pos-100 ${from} ${via} ${to}`}
    >
      <div
        className={`absolute inset-0 h-full w-full ${bgImage} bg-[length:80px] bg-left bg-no-repeat opacity-10 transition-all delay-75 duration-500 group-hover:bg-[length:200px] group-hover:bg-[-30%_center] group-hover:opacity-50`}
      />
      <Text classes="group z-10 text-pretty text-2xl font-semibold">{title}</Text>
    </Stack>
  );
}

export default HomeCardOption;
