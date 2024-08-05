import { forwardRef, PropsWithChildren, Ref } from "react";

import { cn } from "../../../utils/helpers/styleMerger";

type Props = {
  classes?: string;
};

/**
 * @description Box component, use it to wrap other components when you need a forwardRef component without styles and to avoid modify existing components
 * @default <section> tag
 * @param props children of the component
 * @param ref forwardRef
 * @returns JSX.Element
 */
function Box({ classes, children, ...props }: PropsWithChildren<Props>, ref: Ref<HTMLElement>) {
  return (
    <section className={cn(classes)} ref={ref} {...props}>
      {children}
    </section>
  );
}

export default forwardRef(Box);
