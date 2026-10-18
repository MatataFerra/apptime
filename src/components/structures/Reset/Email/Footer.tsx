"use client";

import NextLink from "next/link";

import type { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";

import { PATH_NAMES } from "@/utils/constants/pathnames";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  idForm?: string;
}

function ResetFooter({ classes, idForm }: Props) {
  return (
    <Footer classes={classes}>
      <Button
        type="submit"
        variant="black"
        size="lg"
        classes="w-full text-lg"
        // disabled={false}
        form={idForm}
      >
        Send email to reset password
      </Button>
      <NextLink
        href={PATH_NAMES.HOME}
        className={
          "flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface p-3 text-center text-lg text-ink transition-all hover:bg-surface-sunken"
        }
        role="button"
      >
        {" "}
        Go back to home
      </NextLink>
    </Footer>
  );
}

export default ResetFooter;
