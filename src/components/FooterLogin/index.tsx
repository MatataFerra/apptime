"use client";
import { signIn } from "next-auth/react";

import { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import GoogleButton from "@/components/ui/Button/Google";
import Footer from "@/components/ui/Footer";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cm } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  idForm?: string;
}

function LoginFooter({ classes, idForm = "form" }: Props) {
  function onGoogleAuth() {
    signIn("google", {
      callbackUrl: PATH_NAMES.HOME,
    });
  }
  return (
    <Footer classes={classes}>
      <Button
        type="submit"
        variant="primary"
        classes={cm("w-full text-2xl font-bold")}
        form={idForm}
      >
        Login
      </Button>
      <GoogleButton onGoogleAuth={onGoogleAuth} />
    </Footer>
  );
}

export default LoginFooter;
