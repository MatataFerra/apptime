import type { Hourly } from "@prisma/client";
import type { QueryClient } from "@tanstack/react-query";

import type { UserType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

/*
  Optimistic updates when user finish track shift
*/
export function optimisticFinishTrack(
  newShift: Partial<Hourly>,
  user: UserType | null,
  queryClient: QueryClient
) {
  const previousUserData = queryClient.getQueryData<SuccessApiResponse<UserType>>([
    "user",
    user?.email,
  ]);

  if (!previousUserData) return;

  queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
    queryClient.setQueryData(["user", user?.email], {
      ...previousUserData,
      user: {
        ...previousUserData?.user,
        shifts: {
          ...previousUserData?.user?.shifts,
          hourly: previousUserData?.user?.shifts?.hourly.map((shift) => {
            if (shift.id === newShift.id) {
              return {
                ...shift,
                ...newShift,
              };
            }
            return shift;
          }),
        },
      },
    });

    return { previousUserData };
  });
}

export function cancelTrackQuery(user: UserType | null, queryClient: QueryClient) {
  const previousUserData = queryClient.getQueryData<SuccessApiResponse<UserType>>([
    "user",
    user?.email,
  ]);

  queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
    queryClient.setQueryData(["user", user?.email], {
      ...previousUserData,
      user: {
        ...previousUserData?.user,
        profile: {
          ...previousUserData?.user.profile,
        },
        shifts: {
          ...previousUserData?.user.shifts,
          hourly: previousUserData?.user.shifts?.hourly,
        },
      },
    });

    return { previousUserData };
  });
}

/*
  =====================================================================================
  *************************************************************************************
  *************************************************************************************
  =====================================================================================
*/

/*
  Optimistic updates when user start track shift
*/

export function optimisticStartTrack(
  newShift: Hourly,
  user: UserType | null,
  queryClient: QueryClient
) {
  const previousUserData = queryClient.getQueryData<SuccessApiResponse<UserType>>([
    "user",
    user?.email,
  ]);

  if (!previousUserData) return;

  queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
    queryClient.setQueryData(["user", user?.email], {
      ...previousUserData,
      user: {
        ...previousUserData?.user,
        shifts: {
          ...previousUserData?.user?.shifts,
          hourly: [...(previousUserData?.user?.shifts?.hourly ?? []), { ...newShift }],
        },
      },
    });

    return { previousUserData };
  });
}
