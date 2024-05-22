import Form from "@/components/modules/Settings/Form";
import Submit from "@/components/structures/Settings/Submit";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

export default async function Settings() {
  return (
    <>
      <Stack orientation="vertical" spacing={4}>
        <ModuleTitle title="Settings" gradient="poison" />
        <Form />
      </Stack>
      <Submit />
    </>
  );
}
