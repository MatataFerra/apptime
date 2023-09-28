import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

export default async function Layout({ children }: Props) {
  return <>{children}</>;
}
