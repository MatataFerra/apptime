import Calculator from "@/components/structures/Incomes/Calculator";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

export const dynamic = "force-static";

export default async function Incomes() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <ModuleTitle title="Incomes" subtitle="calculate your incomes" />
      <Calculator />
    </Stack>
  );
}
