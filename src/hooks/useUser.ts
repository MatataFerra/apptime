import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import api from "@/services/Api";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

function useUser() {
  const session = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["user", session.data?.user?.email],
    queryFn: () =>
      api.getUserByEmail.bind(api)({
        email: session.data?.user?.email,
        shifts: true,
        profile: true,
        config: true,
        hasEnvUrl: false,
      }) as unknown as Promise<SuccessApiResponse<UserType>>,
  });

  return { data: data?.user, isLoading };
}

export default useUser;
