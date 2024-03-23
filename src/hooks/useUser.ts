import { useCallback, useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import api from "@/services/Api";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

function useUser() {
  const [isLoading, setIsloading] = useState(true);
  const session = useSession();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<SuccessApiResponse<UserType>>([
    "user",
    session.data?.user?.email,
  ]);
  const [user, setUser] = useState<UserType | undefined>(data?.user);
  const fetchUser = useCallback(async () => {
    {
      if (!data && session.data?.user?.email) {
        await queryClient
          .fetchQuery({
            queryKey: ["user", session.data?.user?.email],
            queryFn: () =>
              api.getUserByEmail.bind(api)({
                email: session.data?.user?.email,
                hasEnvUrl: false,
                profile: true,
                shifts: true,
              }) as unknown as SuccessApiResponse<UserType>,
          })
          .then((res) => {
            setUser(res?.user);
          });
      }

      queryClient.invalidateQueries({
        queryKey: ["user", session.data?.user?.email],
      });
    }
  }, [data, queryClient, session.data?.user?.email]);

  useEffect(() => {
    fetchUser().then(() => setIsloading(false));
  }, [fetchUser]);

  return { data: user, isLoading };
}

export default useUser;
