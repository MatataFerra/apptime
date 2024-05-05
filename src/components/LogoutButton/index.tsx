import Stack from "@/components/ui/Stack";
import Icon from "@/components/ui/Icons";

type Props = {
  handleLogout: () => void;
};

function LogoutButton({ handleLogout }: Props) {
  return (
    <Stack as="button" classes="cursor-pointer" onClick={handleLogout}>
      <Icon.logout className="size-10 justify-self-center" />
    </Stack>
  );
}

export default LogoutButton;
