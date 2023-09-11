import { forwardRef, HTMLInputTypeAttribute, ReactElement, Ref } from "react";

import { CSSClassNames } from "@/types";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

type Variants = keyof typeof INPUT_VARIANTS;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  classes?: CSSClassNames;
  labelClasses?: CSSClassNames;
  variants?: Variants;
  type?: HTMLInputTypeAttribute;
  label?: string;
}

function Input(props: Props, ref: Ref<HTMLInputElement>): ReactElement<Props> {
  const { classes, variants = "default", type, label, labelClasses, ...rest } = props;

  return (
    <fieldset className="flex flex-col">
      {label ? (
        <label className={cm("text-2xl", labelClasses)} htmlFor={label}>
          {label}
        </label>
      ) : null}
      <input
        name={label}
        ref={ref}
        type={type}
        className={cm(INPUT_VARIANTS[variants], classes, "rounded-lg px-2 py-1")}
        {...rest}
      />
    </fieldset>
  );
}

export default forwardRef(Input);
