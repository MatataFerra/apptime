import Calculator from "@/components/structures/Incomes/Calculator";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export const dynamic = "force-static";

export default async function Incomes() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <ModuleTitle
        module={PATH_NAMES.INCOMES}
        title="Estimate"
        subtitle="What a stretch of work pays, before you work it."
      />
      <Calculator />
    </Stack>
  );
}
