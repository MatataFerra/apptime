import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
function HomeButtons() {
  return (
    <Stack classes="h-full w-full" alignItems="center" justifyContent="between">
      <Button classes="remove_button_highlight shadow-button" variant="disabled" disabled={false}>
        Start Shift
      </Button>
      <Button variant="disabled">Finish Shift</Button>
    </Stack>
  );
}

export default HomeButtons;
