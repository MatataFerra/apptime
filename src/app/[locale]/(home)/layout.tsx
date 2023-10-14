import { ReactElement } from "react";

import Button from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import Text from "@/components/ui/Text";

interface Props {
  children: ReactElement;
}

export default function HomeLayout({ children }: Props) {
  return (
    <main className="grid h-[100dvh] grid-rows-[auto,1fr] gap-8 p-7">
      <Header position="between">
        <Button classes="flex flex-col p-0" variant="outlined">
          <div> -----</div>
          <div> --</div>
        </Button>
      </Header>
      {children}
    </main>
  );
}
