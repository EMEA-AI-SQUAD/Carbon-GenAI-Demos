'use client';

/**
 * SpyreContext — global toggle between two LLM backends.
 *
 * useSpyre = false  →  local llama.cpp  (port 3001 proxy, normal IBM Power MMA)
 * useSpyre = true   →  IBM Spyre card   (SPYRE_URL env var, hardware accelerator)
 *
 * The preference is stored in localStorage so it survives page refreshes.
 * Students can toggle it live during the lab to compare response times.
 */

import { createContext, useContext, useState, useEffect } from 'react';

const SpyreContext = createContext({ useSpyre: false, setUseSpyre: () => {} });

export function SpyreProvider({ children }) {
  const [useSpyre, _setUseSpyre] = useState(false);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('useSpyre');
      if (stored === 'true') _setUseSpyre(true);
    } catch (_) {}
  }, []);

  const setUseSpyre = (val) => {
    _setUseSpyre(val);
    try { localStorage.setItem('useSpyre', String(val)); } catch (_) {}
  };

  return (
    <SpyreContext.Provider value={{ useSpyre, setUseSpyre }}>
      {children}
    </SpyreContext.Provider>
  );
}

export function useSpyre() {
  return useContext(SpyreContext);
}
