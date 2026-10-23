import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";

type Props = {
  handleLogout: () => void;
};

function Logout({ handleLogout }: Props) {
  const t = useTranslations("nav");

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      classes="w-full rounded-2xl text-destructive"
      onClick={handleLogout}
    >
      <LogOut className="size-4.5" aria-hidden="true" />
      {t("log_out")}
    </Button>
  );
}

export default Logout;
