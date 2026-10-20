import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { TaxList } from "./lazy";

export default async function TaxesPage() {
  return (
    <div className="flex flex-col gap-6">
      <ModuleTitle
        module={PATH_NAMES.TAXES}
        title="Taxes"
        subtitle="Your taxes and contributions, and how many shifts use each one."
      />
      <TaxList />
    </div>
  );
}
