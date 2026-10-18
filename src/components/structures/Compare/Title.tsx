import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

function Title() {
  return <ModuleTitle
      module={PATH_NAMES.COMPARE}
      title="Compare"
      subtitle="Per piece or per hour: which one pays more for the same day?"
    />;
}

export default Title;
