
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationContextType } from '../types';
import { googleTranslateService } from '../services/gemini';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within a TranslationProvider');
  return context;
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const contextValue: TranslationContextType = {
    language,
    setLanguage,
    translate: async (text: string) => googleTranslateService.translateText(text, language),
    isTranslating,
    setIsTranslating: (val: boolean) => setIsTranslating(val)
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const TranslatableText: React.FC<{ text: string }> = ({ text }) => {
  const { language, setIsTranslating } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [translationError, setTranslationError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const doTranslate = async () => {
      if (language === 'en') {
        setTranslatedText(text);
        setTranslationError(false);
        return;
      }

      setIsTranslating(true);
      setTranslationError(false);

      try {
        const result = await googleTranslateService.translateText(text, language);
        if (isMounted) {
          setTranslatedText(result || text);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(text);
          setTranslationError(true);
        }
      } finally {
        if (isMounted) setIsTranslating(false);
      }
    };

    doTranslate();
    return () => { isMounted = false; };
  }, [text, language]);

  return <span className={translationError ? 'opacity-75' : ''}>{translatedText}</span>;
};
