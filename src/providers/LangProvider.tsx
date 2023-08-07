"use client"

import { getDictionary } from "#/i18n/get-dictonaries";
import { createContext, useContext, useEffect, useState } from "react";
import { Locale } from '../../i18n/i18n-config';
import ErrorFactory from "@/services/Error/factory";

interface Dictionary {
  [key: string]: string;
}

interface LangProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

const DictionaryContext = createContext<Dictionary>({} as Dictionary);

function LangProvider ({children, locale} : LangProviderProps){
  const [dictionary, setDictionary] = useState({} as Dictionary);

  const defaultLocale: Locale = ["es", "en"].includes(locale) ? locale : "en";
 
  useEffect(() => {
    getDictionary(defaultLocale).then((locale) => {
      setDictionary(locale as unknown as Dictionary);
    })

  }, [defaultLocale]);

  return (
    <>
      <DictionaryContext.Provider value={dictionary}>
        {children}
      </DictionaryContext.Provider>
    </>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw ErrorFactory.createError("CustomError", {
      message: "useDictionary must be used within a LangProvider",
    })
  }
  return context;
}

export default LangProvider;
