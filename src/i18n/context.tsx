"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Locale, Translations, translations } from "./translations";

interface I18nContextType {
  locale: Locale;
  t: Translations;
  toggle: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: translations.en,
  toggle: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const toggle = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "fr" : "en"));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
