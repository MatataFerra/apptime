import { type LocaleParams } from "@/types";

import CompareButton from "@/components/CompareButton";
import CompareForm from "@/components/CompareForm";
import CompareReport from "@/components/CompareReport";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

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
        <Stack as="article" orientation="vertical" spacing={2} classes="w-full">
          <Stack
            as="div"
            orientation="horizontal"
            alignItems="center"
            justifyContent="center"
            classes="w-full text-pretty"
            spacing={1}
          >
            <Text variant="subtitle" classes="text-salmon text-lg uppercase">
              Production
            </Text>
            <Text classes="font-bold italic">vs.</Text>
            <Text variant="subtitle" classes="text-ocean text-lg uppercase">
              Hourly
            </Text>
          </Stack>
          <Text classes="mx-auto my-0 w-3/4 text-pretty text-center text-[0.5rem]">
            Compare wages to see which option is{" "}
            <Text as="span" classes="underline">
              better
            </Text>
          </Text>
        </Stack>
        <CompareForm />
        <CompareButton />
        <CompareReport />
      </Stack>
    </>
  );
}
