import type { Locale } from './i18n-config'

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () => import('./en/en.json').then((module) => module.default),
  es: () => import('./es/es.json').then((module) => module.default),
}

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]?.() ?? dictionaries.en()
}
