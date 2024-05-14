import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

function SubmitForm() {
  return (
    <Stack justifyContent="end" classes="w-full">
      <Button type="submit" variant="black" form="production-job">
        Submit
      </Button>
    </Stack>
  );
}

export default SubmitForm;
