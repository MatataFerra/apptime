import { LocaleParams } from "@/types";

import ProductionForm from "@/components/ProductionForm";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

export default async function ProductionJob({ params }: { params: LocaleParams }) {
  return (
    <>
      <Stack orientation="vertical" spacing={6}>
        <Stack orientation="vertical">
          <Text gradient="title" classes={`text-2xl font-bold`}>
            Production Job
          </Text>
          <Text>module to track your production work</Text>
        </Stack>
        <ProductionForm />
      </Stack>
    </>
  );
}
