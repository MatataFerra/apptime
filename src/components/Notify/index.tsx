import Button from "../Button";
import Input from "../Input";
import Text from "../Text";

function Notify() {
  return (
    <div className="w-4/5 z-50 mt-auto px-8 py-4 bg-gray-700 rounded-lg space-y-8 col-start-2 row-start-3 row-end-[-2] justify-self-end">
      <Text classes="text-white text-lg">
        Do you want to get notice when the app is available for desktop?
      </Text>
      <div className="flex gap-2 justify-between">
        <Input
          variants="default"
          placeholder="username@email.com"
          classes="w-full"
        />
        <Button variants="gradient" classes="p-1 animate-text">
          <div className="py-1 px-3 items-center justify-center bg-gray-800 rounded-[inherit] hover:bg-gray-900 transition-all">
            <Text classes="font-black text-white">Notify Me</Text>
          </div>
        </Button>
      </div>
    </div>
  );
}

export default Notify;
