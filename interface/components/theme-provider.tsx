'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ThemeContext } from '@/lib/hooks/use-theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('immo-theme-v2');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Default to light mode if no saved preference
      setIsDark(false);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme to localStorage
    localStorage.setItem('immo-theme-v2', isDark ? 'dark' : 'light');
  }, [isDark, mounted]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setIsDark(theme === 'dark');
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => {}, setTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}