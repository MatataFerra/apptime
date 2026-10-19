import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function FastChargePage() {
  return (
    <ModuleTitle
      module={PATH_NAMES.FAST_CHARGE}
      title="Fast charge"
      subtitle="Log a finished shift in one go."
    />
  );
}
