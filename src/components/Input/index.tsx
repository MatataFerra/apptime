import { forwardRef, HTMLInputTypeAttribute, ReactElement, Ref } from "react";

import { CSSClassNames } from "@/types";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

type Variants = keyof typeof INPUT_VARIANTS;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  classes?: CSSClassNames;
  labelClasses?: CSSClassNames;
  variant?: Variants;
  type?: HTMLInputTypeAttribute;
  label?: string;
}

function Input(props: Props, ref: Ref<HTMLInputElement>): ReactElement<Props> {
  const { classes, variant = "default", type, label, labelClasses, ...rest } = props;

  return (
    <section className={cm(label ? "flex flex-col" : "contents")}>
      {label ? (
        <label className={cm("text-2xl", labelClasses)} htmlFor={label}>
          {label}
        </label>
      ) : null}
      <input
        id={label}
        ref={ref}
        type={type}
        autoComplete="new-password"
        className={cm(INPUT_VARIANTS[variant], classes, "rounded-lg px-2 py-1")}
        {...rest}
      />
    </section>
  );
}

export default forwardRef(Input);
