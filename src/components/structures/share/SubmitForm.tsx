import { forwardRef, type Ref } from "react";

import Box from "@/components/ui/Box";
import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

type Props = {
  form: string;
};

function SubmitForm({ form }: Props, ref: Ref<HTMLElement>) {
  return (
    <Box classes="flex w-full justify-end">
      <Button type="submit" variant="black" form={form}>
        Submit
      </Button>
    </Box>
  );
}

export default forwardRef(SubmitForm);
