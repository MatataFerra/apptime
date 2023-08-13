import { ScreenDetector } from "@/modules";
import LangProvider from "@/providers/LangProvider";
import { Locale, Params } from "@/types";

export default async function NoMobile({ params }: Params<Locale>) {
  return (
    <>
      <LangProvider locale={params.lang}>
        <ScreenDetector />
      </LangProvider>
    </>
  );
}
