"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import GoogleButton from "@/components/ui/Button/Google";
import Footer from "@/components/ui/Footer";

import { PATH_NAMES } from "@/utils/constants/pathnames";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  idForm?: string;
}

function LoginFooter({ classes, idForm = "form" }: Props) {
  const params = useSearchParams();

  function onGoogleAuth() {
    signIn("google", {
      callbackUrl: params.get("redirect") ?? PATH_NAMES.HOME,
    });
  }
  return (
    <Footer classes={classes}>
      <Button
        type="submit"
        variant="black"
        classes="w-full text-base"
        form={idForm}
      >
        Login
      </Button>
      <GoogleButton onGoogleAuth={() => {}} disabled />
    </Footer>
  );
}

export default LoginFooter;
