import { forwardRef } from "react";

import { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  value?: string;
  classes?: CSSClassNames;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function Textarea(props: TextareaProps, ref: React.Ref<HTMLTextAreaElement>) {
  const { value, onChange, ...rest } = props;
  return (
    <textarea ref={ref} className={cn(props.classes)} onChange={onChange} value={value} {...rest} />
  );
}

export default forwardRef(Textarea);
