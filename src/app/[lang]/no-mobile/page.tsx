import { getDictionary } from "#/i18n/get-dictonaries";
import type { Locale } from "#/i18n/i18n-config";
import { ScreenDetector } from "@/modules";



export default async function NoMobile({params} : {params: {lang: Locale}}){
  

  const defaultLocale: Locale = ["es", "en"].includes(params.lang) ? params.lang : "en";
  const locale = await getDictionary(defaultLocale);
  return <ScreenDetector />;
}
