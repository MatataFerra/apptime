"use client";

import { useRouter } from "next/navigation";

import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";

function HomeCards() {
  const router = useRouter();
  return (
    <Stack classes="h-full w-full" orientation="vertical" spacing={4}>
      <Stack
        justifyContent="center"
        alignItems="center"
        onClick={() => router.push(PATH_NAMES.FAST_CHARGE)}
        classes="bg-pos-0 hover:bg-pos-100 bg-size-200 group relative h-full w-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-tl from-teal-500 via-sky-300 to-blue-500 font-medium shadow-input transition-all duration-500"
      >
        <div className="bg-lightning absolute inset-0 h-full w-full bg-[length:80px] bg-left bg-no-repeat opacity-30 transition-all delay-75 duration-500 group-hover:bg-[length:200px] group-hover:bg-[-30%_center] group-hover:opacity-80" />
        <Text classes="group z-10 text-2xl transition-all group-hover:text-3xl group-hover:font-semibold">
          Fast Charge
        </Text>
      </Stack>
      <Stack
        justifyContent="center"
        alignItems="center"
        onClick={() => router.push(PATH_NAMES.TRACK)}
        classes="bg-pos-0 hover:bg-pos-100 bg-size-200 group relative h-full w-full cursor-pointer rounded-lg bg-gradient-to-tl from-green-500 via-lime-400 to-emerald-400 font-medium shadow-input transition-all duration-500"
      >
        <div className="bg-clock absolute inset-0 h-full w-full bg-[length:80px] bg-left bg-no-repeat opacity-30 transition-all delay-75 duration-500 group-hover:bg-[length:200px] group-hover:bg-[-30%_center] group-hover:opacity-80" />
        <Text classes="group z-10 text-2xl transition-all group-hover:text-3xl group-hover:font-semibold">
          Track your time
        </Text>
      </Stack>
      <Stack
        justifyContent="center"
        alignItems="center"
        onClick={() => router.push(PATH_NAMES.PRODUCTION)}
        classes="bg-pos-0 hover:bg-pos-100 bg-size-200 group relative h-full w-full cursor-pointer rounded-lg bg-gradient-to-tl from-red-500 via-amber-400 to-amber-400 font-medium shadow-input transition-all duration-500"
      >
        <div className="bg-box absolute inset-0 h-full w-full bg-[length:80px] bg-left bg-no-repeat opacity-30 transition-all delay-75 duration-500 group-hover:bg-[length:200px] group-hover:bg-[-30%_center] group-hover:opacity-80" />
        <Text classes="grooup z-10 text-2xl transition-all group-hover:text-3xl group-hover:font-semibold">
          Production Job
        </Text>
      </Stack>
    </Stack>
  );
}

export default HomeCards;
