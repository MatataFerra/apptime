import Input from "@/components/ui/Input";

import inputLoading from "@/hoc/InputLoading";

type Props = {
  name: string;
  id: string;
  label: string;
  description: string;
  variant:
    | "error"
    | "default"
    | "success"
    | "warning"
    | "info"
    | "plane"
    | "radio"
    | "underline"
    | undefined;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputForm({ ...props }: Props) {
  return <Input containerClasses="space-y-1" classes="w-full text-sm" {...props} />;
}

export default inputLoading(InputForm);
