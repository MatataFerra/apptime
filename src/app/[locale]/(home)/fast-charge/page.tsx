import Form from "@/components/modules/FastCharge/Form";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

export const dynamic = "force-dynamic";

export default async function FastCharge() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <ModuleTitle title="Fast Charge" subtitle="charge your shift" />
      <Form />
    </Stack>
  );
}
