import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, LANGUAGES, TRANSLATIONS, LanguageOption } from './translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  currentOption: LanguageOption;
}

const STORAGE_KEY_LANG = 'assetpulse_lang_v1';

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  dir: 'ltr',
  isRtl: false,
  currentOption: LANGUAGES[0],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && (saved === 'en' || saved === 'ar' || saved === 'es' || saved === 'fr' || saved === 'de' || saved === 'ja')) {
        return saved as LanguageCode;
      }
    } catch {
      // Ignore
    }
    return 'en';
  });

  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const dir = currentOption.dir;
  const isRtl = dir === 'rtl';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    } catch {
      // Ignore
    }
  }, [language, dir]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    return TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRtl, currentOption }}>
      <div dir={dir} className={isRtl ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
