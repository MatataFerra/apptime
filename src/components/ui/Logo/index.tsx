"use client";

import { useRouter } from "next/navigation";

import Img from "@/components/ui/Image";
import Text from "@/components/ui/Text";

interface Props {
  withText?: boolean;
}

function Logo({ withText }: Props) {
  const router = useRouter();
  return (
    <picture
      className="flex cursor-pointer items-center justify-start gap-2"
      onClick={() => router.push("/")}
    >
      <Img src="/assets/apptime-logo.svg" alt="App time logo" width={50} height={50} />
      {withText ? (
        <Text as="h1" gradient="secondary" classes={`text-2xl font-bold`}>
          App Time
        </Text>
      ) : null}
    </picture>
  );
}

export default Logo;
