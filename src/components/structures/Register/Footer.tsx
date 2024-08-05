"use client";

import NextLink from "next/link";

import { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";

import { usePasswordValid } from "@/providers/PasswordValidProvider";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  idForm?: string;
}

function RegisterFooter({ classes, idForm }: Props) {
  const { isButtonBloqued } = usePasswordValid();
  return (
    <Footer classes={classes}>
      <Button
        type="submit"
        variant="black"
        classes={cn("w-full text-lg", isButtonBloqued && "bg-gray-400 text-gray-600")}
        disabled={isButtonBloqued}
        form={idForm}
      >
        Register
      </Button>
      <NextLink
        href={PATH_NAMES.LOGIN}
        className={cn(
          "h-12 w-full cursor-pointer rounded-lg border border-slate-800 bg-white p-3 text-center text-lg text-black transition-all hover:bg-gray-200"
        )}
        role="button"
      >
        {" "}
        Login
      </NextLink>
    </Footer>
  );
}

export default RegisterFooter;
