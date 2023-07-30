import { CSSClassNames } from "@/types";
import { INPUT_VARIANTS } from "@/utils/constants";
import { cm } from "@/utils/helpers";
import { HTMLInputTypeAttribute, ReactElement } from "react";

type Variants = keyof typeof INPUT_VARIANTS;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  as?: "input";
  classes?: CSSClassNames;
  variants?: Variants;
  type?: HTMLInputTypeAttribute;
}

function Input({
  as: El = "input",
  classes,
  variants = "default",
  type,
  ...props
}: Props): ReactElement<Props> {
  const Component = El;
  return (
    <Component
      type={type}
      className={cm(INPUT_VARIANTS[variants], classes, "py-1 px-2 rounded-lg")}
      {...props}
    />
  );
}

export default Input;
