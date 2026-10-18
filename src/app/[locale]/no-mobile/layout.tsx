import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}
