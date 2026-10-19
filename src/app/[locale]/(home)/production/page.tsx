import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function ProductionJobPage() {
  return (
    <ModuleTitle
      module={PATH_NAMES.PRODUCTION}
      title="Production"
      subtitle="Get paid per bin, box or piece."
    />
  );
}
