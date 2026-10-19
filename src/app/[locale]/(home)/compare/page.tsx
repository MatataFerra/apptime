import Content from "@/components/modules/Compare/Content";
import Stack from "@/components/ui/Stack";

export default async function Compare() {
  return (
    <>
      <Stack orientation="vertical" classes="h-fit w-full" spacing={5}>
        <Content />
      </Stack>
    </>
  );
}
