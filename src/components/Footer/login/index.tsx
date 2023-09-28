"use client";
import { signIn } from "next-auth/react";

import { CSSClassNames } from "@/types";

import Button from "@/components/Button";
import Img from "@/components/Image";
import Text from "@/components/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cm } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
}

function LoginFooter({ classes, ...props }: Props) {
  function onGoogleAuth() {
    signIn("google", {
      callbackUrl: PATH_NAMES.HOME,
    });
  }
  return (
    <footer className={cm("flex flex-col justify-center gap-2", classes)} {...props}>
      <Button type="submit" variant="primary" classes={cm("w-full text-2xl font-bold")}>
        Login
      </Button>
      <Button
        type="button"
        variant="google"
        classes="mx-0 my-auto grid w-full grid-cols-1 items-center"
        onClick={onGoogleAuth}
      >
        <Img
          classes="col-start-1 col-end-2 row-start-1 row-end-2"
          src="/assets/google-logo.webp"
          alt="Google logo"
          width={30}
          height={30}
        />
        <Text as="span" classes="col-start-1 col-end-2 row-start-1 row-end-2 text-2xl">
          Google
        </Text>
      </Button>
    </footer>
  );
}

export default LoginFooter;
