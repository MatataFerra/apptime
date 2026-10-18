import { LogOut } from "lucide-react";

import Button from "@/components/ui/Button";

type Props = {
  handleLogout: () => void;
};

function Logout({ handleLogout }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      classes="w-full rounded-2xl text-destructive"
      onClick={handleLogout}
    >
      <LogOut className="size-4.5" aria-hidden="true" />
      Log out
    </Button>
  );
}

export default Logout;
