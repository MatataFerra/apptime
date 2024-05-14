import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

type Props = {
  form: string;
};

function SubmitForm({ form }: Props) {
  return (
    <Stack justifyContent="end" classes="w-full">
      <Button type="submit" variant="black" form={form}>
        Submit
      </Button>
    </Stack>
  );
}

export default SubmitForm;
