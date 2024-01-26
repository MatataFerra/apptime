"use client";

import { User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { SuccessApiResponse } from "@/types/api_response";

import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

interface Props {
  username?: string;
}

function WelcomeTitle({ username }: Props) {
  const session = useSession();
  const query = useQueryClient();
  const data = query.getQueryData<SuccessApiResponse<User>>(["user", session.data?.user?.email]);
  return (
    <>
      <div className="flex flex-col gap-4">
        <Text variant="title" classes="text-5xl">
          Welcome
        </Text>

        {data?.user?.name ? (
          <Text
            variant="gradient"
            classes={`balance_text text-5xl font-bold ${GRADIENTS.gradient_2}`}
          >
            {data?.user?.name}
          </Text>
        ) : (
          <Skeleton classes="h-9 w-52" />
        )}
      </div>
    </>
  );
}

export default WelcomeTitle;
