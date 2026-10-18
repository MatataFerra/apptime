import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function BodyPage() {
  return <ModuleTitle module={PATH_NAMES.SETTINGS} title="Settings" />;
}
