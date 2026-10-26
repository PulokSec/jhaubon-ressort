"use client";

import { createContext, useContext } from "react";
import { getDictionary, type Locale } from "./index";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Dictionaries hold functions, so client components look them up locally instead of receiving them as props. */
export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: getDictionary(locale) };
}
