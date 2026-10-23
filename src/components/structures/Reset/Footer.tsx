"use client";

import { useTranslations } from "next-intl";

import type { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { Link } from "@/i18n/navigation";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  idForm?: string;
}

function ResetFooter({ classes, idForm }: Props) {
  const t = useTranslations("auth");
  return (
    <Footer classes={classes}>
      <Button
        type="submit"
        variant="black"
        size="lg"
        classes={
          "flex w-full items-center justify-center rounded-lg border border-border-strong text-lg"
        }
        // disabled={false}
        form={idForm}
      >
        {t("reset.submit")}
      </Button>
      <Link
        href={PATH_NAMES.HOME}
        className={
          "flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface p-3 text-center text-lg text-ink transition-all hover:bg-surface-sunken"
        }
        role="button"
      >
        {t("go_home")}
      </Link>
    </Footer>
  );
}

export default ResetFooter;
