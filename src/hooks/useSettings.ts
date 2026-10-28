import { useEffect } from "react";

import useUser from "@/hooks/useUser";

import { useSettingsStore } from "@/store/useSettingsStore";

function useSettings() {
  const { data: user, isLoading } = useUser();
  const { setValue, values, setDefaultValues } = useSettingsStore((state) => state);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    if (!user?.name) return;

    setValue({
      account: {
        name: user?.name,
        email: user?.email,
      },
    });

    setDefaultValues({
      account: {
        name: user?.name,
        email: user?.email,
      },
    });

    if (!user?.profile?.city || !user?.profile?.country) return;

    setValue({
      personal: {
        city: user?.profile?.city ?? "",
        country: user?.profile?.country ?? "",
      },
    });

    setDefaultValues({
      personal: {
        city: user?.profile?.city ?? "",
        country: user?.profile?.country ?? "",
      },
    });

    if (!user?.config?.weekStartsOn) return;

    setValue({
      configs: {
        weekStartsOn: user?.config?.weekStartsOn ?? "",
      },
    });

    setDefaultValues({
      configs: {
        weekStartsOn: user?.config?.weekStartsOn ?? "",
      },
    });
  }, [
    isLoading,
    setDefaultValues,
    setValue,
    user?.config?.weekStartsOn,
    user?.email,
    user?.name,
    user?.profile?.city,
    user?.profile?.country,
    user,
  ]);

  return { values, setValue, isLoading };
}

export default useSettings;
