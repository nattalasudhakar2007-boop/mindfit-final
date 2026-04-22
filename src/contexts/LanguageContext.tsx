import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "te";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (en: string, te: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const t = (en: string, te: string) => (lang === "te" ? te : en);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
