import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { EmployerList } from "./lazy";

export default async function EmployersPage() {
  return (
    <div className="flex flex-col gap-6">
      <ModuleTitle
        module={PATH_NAMES.EMPLOYERS}
        title="Employers"
        subtitle="Where you work, with the details visa and tax forms ask for."
      />
      <EmployerList />
    </div>
  );
}
