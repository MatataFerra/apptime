import { User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import api from "@/services/Api";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

function useQueryUser() {
  const session = useSession();
  const query = useQueryClient();
  const data = query.getQueryData<SuccessApiResponse<UserType>>([
    "user",
    session.data?.user?.email,
  ]);

  if (!data) {
    query.prefetchQuery({
      queryKey: ["user", session.data?.user?.email],
      queryFn: () =>
        api.getUserByEmail.bind(api)({
          email: session.data?.user?.email as string,
          shifts: true,
          profile: true,
          hasEnvUrl: false,
        }),
    });
  }

  return data?.user;
}

export default useQueryUser;
