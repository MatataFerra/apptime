import Form from "@/components/modules/Production/Form";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

export const dynamic = "force-dynamic";

export default async function ProductionJobPage() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <ModuleTitle title="Production Job" subtitle="module to track your production work" />
      <Form />
    </Stack>
  );
}
