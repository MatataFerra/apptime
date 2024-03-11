import { forwardRef, Ref } from "react";

type Props = {
  children: React.ReactNode;
};

/**
 * @description Box component, use it to wrap other components when you need a forwardRef component without styles and to avoid modify existing components
 * @default <section> tag
 * @param props children of the component
 * @param ref forwardRef
 * @returns JSX.Element
 */
function Box(props: Props, ref: Ref<HTMLElement>) {
  return <section ref={ref}>{props.children}</section>;
}

export default forwardRef(Box);
