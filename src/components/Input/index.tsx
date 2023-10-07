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
  isError?: boolean;
  label?: string;
}

function Input(props: Props, ref: Ref<HTMLInputElement>): ReactElement<Props> {
  const { classes, variant = "default", type, label, labelClasses, isError, ...rest } = props;

  return (
    <>
      {label ? (
        <label className={cm("text-2xl", labelClasses)}>
          {label}
          <input
            ref={ref}
            type={type}
            autoComplete="off"
            className={cm(
              INPUT_VARIANTS[variant],
              classes,
              "rounded-lg px-2 py-1",
              isError && "border-red-600 focus:ring-red-600"
            )}
            {...rest}
          />
        </label>
      ) : (
        <input
          ref={ref}
          type={type}
          autoComplete="off"
          className={cm(
            INPUT_VARIANTS[variant],
            classes,
            "rounded-lg px-2 py-1",
            isError && "border-red-600 focus:ring-red-600"
          )}
          {...rest}
        />
      )}
    </>
  );
}

export default forwardRef(Input);
