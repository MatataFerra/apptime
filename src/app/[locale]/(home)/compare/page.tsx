import { type LocaleParams } from "@/types";

import Content from "@/components/modules/Compare/Content";
import Stack from "@/components/ui/Stack";

export const dynamic = "force-static";

export default async function Compare({
  params,
  searchParams,
}: {
  params: LocaleParams;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      <Stack orientation="vertical" classes="h-fit w-full" spacing={8}>
        <Content />
      </Stack>
    </>
  );
}
