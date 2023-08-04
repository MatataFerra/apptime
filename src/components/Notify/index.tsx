import Button from "../Button";
import Input from "../Input";
import Text from "../Text";

function Notify() {
  return (
    <div className="z-50 col-start-2 row-start-3 row-end-[-2] mt-auto w-4/5 space-y-8 justify-self-end rounded-lg bg-gray-700 px-8 py-4">
      <Text classes="text-lg text-white">
        Do you want to get notice when the app is available for desktop?
      </Text>
      <div className="flex justify-between gap-2">
        <Input
          variants="default"
          placeholder="username@email.com"
          classes="w-full"
        />
        <Button variants="gradient" classes="animate-text p-1">
          <div className="items-center justify-center rounded-[inherit] bg-gray-800 px-3 py-1 transition-all hover:bg-gray-900">
            <Text classes="font-black text-white">Notify Me</Text>
          </div>
        </Button>
      </div>
    </div>
  );
}

export default Notify;
