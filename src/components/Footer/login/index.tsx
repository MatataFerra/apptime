"use client";
import ut from "@/services/Utilities/client";

import Button from "@/components/Button";
import Img from "@/components/Image";
import Text from "@/components/Text";

function LoginFooter() {
  function onClick() {
    // eslint-disable-next-line no-console
    console.log("click");
  }
  return (
    <footer className="flex flex-col justify-center gap-2">
      <Button variant="primary" classes="w-full text-2xl font-bold" onClick={onClick}>
        Login
      </Button>
      <Button
        variant="google"
        classes="mx-0 my-auto grid w-full grid-cols-1 items-center"
        onClick={onClick}
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
