"use client";

import { useTranslations } from "next-intl";

import { CSSClassNames } from "@/types";

import Button, { buttonVariants } from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";

import { usePasswordValid } from "@/providers/PasswordValidProvider";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";

import { Link } from "@/i18n/navigation";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  idForm?: string;
}

function RegisterFooter({ classes, idForm }: Props) {
  const { isButtonBloqued } = usePasswordValid();
  const t = useTranslations("auth.register");
  return (
    <Footer classes={classes}>
      <Button
        type="submit"
        variant="black"
        classes="w-full text-base"
        disabled={isButtonBloqued}
        form={idForm}
      >
        {t("submit")}
      </Button>
      <Link
        href={PATH_NAMES.LOGIN}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full text-base")}
        role="button"
      >
        {t("login_link")}
      </Link>
    </Footer>
  );
}

export default RegisterFooter;
