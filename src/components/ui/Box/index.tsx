import { forwardRef, PropsWithChildren, Ref } from "react";

type Props = {
  classes: string;
};

/**
 * @description Box component, use it to wrap other components when you need a forwardRef component without styles and to avoid modify existing components
 * @default <section> tag
 * @param props children of the component
 * @param ref forwardRef
 * @returns JSX.Element
 */
function Box(props: PropsWithChildren<Props>, ref: Ref<HTMLElement>) {
  return (
    <section className={props.classes} ref={ref} {...props}>
      {props.children}
    </section>
  );
}

export default forwardRef(Box);
