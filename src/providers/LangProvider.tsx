"use client";

import {
  MutableRefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Locale } from "@/types";
import i18n from "@/services/i18n";
import lang from "#/i18n/en/en.json";

export type DictionaryType = typeof lang;
interface Dictionary {
  [key: string]: string;
}

interface DictionaryContext {
  dictionary: DictionaryType;
}

interface LangProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

const DictionaryContext = createContext<DictionaryContext>({} as DictionaryContext);

function LangProvider({ children, locale }: LangProviderProps) {
  const [dictionary, setDictionary] = useState<DictionaryType>({} as DictionaryType);

  useEffect(() => {
    async function getDictionary() {
      const res = await i18n.getDictionary(locale);
      setDictionary(res);
    }

    getDictionary();
  }, [locale]);

  return (
    <>
      <DictionaryContext.Provider
        value={{
          dictionary,
        }}
      >
        {children}
      </DictionaryContext.Provider>
    </>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw new Error("useDictionary must be used within a LangProvider");
  }
  return context;
}

export default LangProvider;
