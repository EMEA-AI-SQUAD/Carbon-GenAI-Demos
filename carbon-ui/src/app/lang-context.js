'use client';
import { createContext, useContext, useState } from 'react';

export const LangContext = createContext({ lang: 'ro', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ro');
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// Made with Bob
