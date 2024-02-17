import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import api from "@/services/Api";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

function useUser() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [isLoading, setIsloading] = useState(true);
  const data = queryClient.getQueryData<SuccessApiResponse<UserType>>([
    "user",
    session.data?.user?.email,
  ]);
  const [user, setUser] = useState<SuccessApiResponse<UserType> | undefined>(data);

  useEffect(() => {
    if (!data && session.data?.user?.email) {
      setIsloading(true);
      queryClient
        .fetchQuery({
          queryKey: ["user", session.data?.user?.email],
          queryFn: async () =>
            api.getUserByEmail.bind(api)({
              email: session.data?.user?.email,
              shifts: true,
              profile: true,
              hasEnvUrl: false,
            }) as unknown as SuccessApiResponse<UserType>,
        })
        .then((response) => {
          setUser(response);
          setIsloading(false);
        })
        .finally(() => {
          setIsloading(false);
        });
    } else {
      setIsloading(false);
    }
  }, [data, queryClient, session.data?.user?.email]);

  return { data: user, isLoading };
}

export default useUser;
