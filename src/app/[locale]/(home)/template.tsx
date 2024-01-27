import { ReactElement } from "react";

import Ham from "@/components/Ham";
import Header from "@/components/ui/Header";

interface Props {
  children: ReactElement;
}

export default async function Template({ children }: Props) {
  return (
    <>
      <Header position="between">
        <Ham />
      </Header>
      {children}
    </>
  );
}
