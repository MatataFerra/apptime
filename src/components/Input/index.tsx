import { forwardRef, HTMLInputTypeAttribute, ReactElement, Ref } from "react";

import { CSSClassNames } from "@/types";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

type Variants = keyof typeof INPUT_VARIANTS;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  classes?: CSSClassNames;
  variants?: Variants;
  type?: HTMLInputTypeAttribute;
}

function Input(props: Props, ref: Ref<HTMLInputElement>): ReactElement<Props> {
  const { classes, variants = "default", type, ...rest } = props;

  return (
    <input
      ref={ref}
      type={type}
      className={cm(INPUT_VARIANTS[variants], classes, "rounded-lg px-2 py-1")}
      {...rest}
    />
  );
}

export default forwardRef(Input);
