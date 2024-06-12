import Content from "@/components/modules/Compare/Content";
import Stack from "@/components/ui/Stack";

export const dynamic = "force-static";

export default async function Compare() {
  return (
    <>
      <Stack orientation="vertical" classes="h-fit w-full overflow-hidden" spacing={8}>
        <Content />
      </Stack>
    </>
  );
}
