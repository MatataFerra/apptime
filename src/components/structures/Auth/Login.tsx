import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";

type Props = {
  handleLogin: () => void;
};

function Login({ handleLogin }: Props) {
  const t = useTranslations("nav");

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      classes="w-full rounded-2xl"
      onClick={handleLogin}
    >
      {t("log_in")}
    </Button>
  );
}

export default Login;
