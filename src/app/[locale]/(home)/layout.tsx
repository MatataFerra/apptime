import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

export default async function HomeLayout({ children }: Props) {
  return <main className="grid h-[100dvh] grid-rows-[auto,1fr] gap-8 p-7">{children}</main>;
}
