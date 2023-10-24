import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";

function UnfilledForm() {
  return (
    <Stack orientation="vertical" justifyContent="center" alignItems="center" spacing={8}>
      <Text classes="balance_pretty_text text-center text-2xl text-rose-400">
        Please fill the form before start
      </Text>
      <Button
        as="a"
        href={PATH_NAMES.FORM}
        variant="white"
        classes="remove_button_highlight select-none"
      >
        click here
      </Button>
    </Stack>
  );
}

export default UnfilledForm;
