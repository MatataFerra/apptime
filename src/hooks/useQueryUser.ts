import { User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { SuccessApiResponse } from "@/types/api_response";

function useQueryUser() {
  const session = useSession();
  const query = useQueryClient();
  const data = query.getQueryData<SuccessApiResponse<User>>(["user", session.data?.user?.email]);

  return data?.user;
}

export default useQueryUser;
