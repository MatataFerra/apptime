import { useCallback, useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import isEmpty from "lodash/isEmpty";
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
              config: true,
            }) as unknown as SuccessApiResponse<UserType>,
        })
        .then((res: any) => {
          if (isEmpty(res?.user)) return;
          return setUser(res?.user);
        });
    }

    return user;
  }, [data, queryClient, session.data?.user?.email, user]);

  useEffect(() => {
    if (!isLoading) return;

    fetchUser()
      .then((user) => {
        if (isEmpty(user)) {
          return setIsloading(true);
        }
        setIsloading(false);
      })
      .catch((err) => {
        setIsloading(false);
      });
  }, [fetchUser, isLoading]);

  return { data: user, isLoading };
}

export default useUser;
