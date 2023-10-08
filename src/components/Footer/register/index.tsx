"use client";
import { CSSClassNames } from "@/types";

import Button from "@/components/Button";
import Footer from "@/components/Footer";

import { usePasswordValid } from "@/providers/PasswordValid";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cm } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  idForm?: string;
}

function RegisterFooter({ classes, idForm }: Props) {
  const { isPasswordValid } = usePasswordValid();
  return (
    <Footer classes={classes}>
      <Button
        type="submit"
        variant="primary"
        classes={cm("w-full text-2xl font-bold", !isPasswordValid && "bg-gray-400 text-gray-600")}
        disabled={!isPasswordValid}
        form={idForm}
      >
        Register
      </Button>
      <Button
        variant="outlined"
        classes={cm("w-full text-2xl transition-all hover:bg-gray-200")}
        as="a"
        href={PATH_NAMES.LOGIN}
      >
        Login
      </Button>
    </Footer>
  );
}

export default RegisterFooter;
