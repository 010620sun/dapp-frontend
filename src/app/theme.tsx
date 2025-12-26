
// src/app/theme.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
const THEME_KEY = 'app-theme';

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyHtmlClass(theme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
    setModeState(saved);
    const target = saved === 'system' ? getSystemTheme() : saved;
    applyHtmlClass(target);
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyHtmlClass(media.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [mode]);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(THEME_KEY, m);
    const target = m === 'system' ? getSystemTheme() : m;
    applyHtmlClass(target);
  };

  const isDark = useMemo(() => {
    const target = mode === 'system' ? getSystemTheme() : mode;
    return target === 'dark';
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
