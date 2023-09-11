//! No borrar comentarios
//! una vez hecha la imple descomentar y utilizar esa implementación

import { ReactElement } from "react";

// import { headers } from "next/headers";
// import { ut } from "@/services";
import Header from "@/components/Header";

interface Props {
  children: ReactElement;
}

export default function LoginLayout({ children }: Props) {
  // const listHeaders = headers().get("user-agent") as string;
  // const isMobile = ut.isMobile({ headers: listHeaders });
  const isMobile = true;

  return (
    <>
      {isMobile ? (
        <main className="grid h-[100dvh] grid-rows-[auto,1fr,auto] justify-center gap-2 p-7">
          <Header position="center" />
          {children}
        </main>
      ) : (
        <main className="relative grid h-screen grid-rows-[auto,1fr] overflow-hidden">
          <Header position="start" classes="px-4 py-2 [&>h1]:text-xl [&>img]:h-6 [&>img]:w-6" />
          <section className="flex flex-col items-center justify-center p-2">{children}</section>
        </main>
      )}
    </>
  );
}
