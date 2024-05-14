"use client";

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
        variant="primary"
        classes={cn("w-full text-2xl font-bold", isButtonBloqued && "bg-gray-400 text-gray-600")}
        disabled={isButtonBloqued}
        form={idForm}
      >
        Register
      </Button>
      <Button
        variant="outlined"
        classes={cn("w-full text-2xl transition-all hover:bg-gray-200")}
        as="a"
        href={PATH_NAMES.LOGIN}
      >
        Login
      </Button>
    </Footer>
  );
}

export default RegisterFooter;
