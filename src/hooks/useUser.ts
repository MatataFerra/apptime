import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import api from "@/services/Api";

import type { UserType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

function useUser() {
  const session = useSession();
  const email = session.data?.user?.email;

  const fetchUser = useCallback(async () => {
    if (!email) return;

    return api.getUserByEmail({
      email: email,
      profile: true,
      shifts: true,
      config: true,
    }) as unknown as SuccessApiResponse<UserType>;
  }, [email]);

  const { data, isLoading } = useQuery({
    queryKey: ["user", email],
    queryFn: fetchUser,
    enabled: !!email,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 3600 * 10,
  });

  return { data: data?.user, isLoading };
}

export default useUser;
