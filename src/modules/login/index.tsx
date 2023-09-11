import { Input } from "@/components";
import LoginFooter from "@/components/Footer/login";
import Text from "@/components/Text";

import { GRADIENTS } from "@/utils/constants";

function LoginScreen() {
  return (
    <>
      <main className="flex h-[50dvh] flex-col gap-4 self-center">
        <form className="flex flex-col gap-4">
          <Input
            classes="shadow-input h-[69px] w-full rounded-md border border-gray-900 bg-white text-2xl"
            variants="default"
            type="email"
            label="email"
            labelClasses="m-0 text-sm"
          />
          <Input
            classes="shadow-input h-[69px] w-full rounded-md border border-gray-900 bg-white text-2xl"
            variants="default"
            type="password"
            label="password"
            labelClasses="m-0 text-sm"
          />
        </form>
      </main>
      <div className="bg-login" />
      <LoginFooter />
    </>
  );
}

export default LoginScreen;
