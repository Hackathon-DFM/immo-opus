'use client';

import { useTheme } from '@/lib/hooks/use-theme';
import { useEffect, useState } from 'react';

export function DebugTheme() {
  const { isDark, toggleTheme } = useTheme();
  const [classList, setClassList] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setClassList(document.documentElement.className);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 text-sm">
      <div className="space-y-2">
        <div>isDark: {isDark ? 'true' : 'false'}</div>
        <div>HTML classes: {classList || 'none'}</div>
        <div>localStorage: {typeof window !== 'undefined' ? localStorage.getItem('immo-theme-v2') || 'none' : 'SSR'}</div>
        <button 
          onClick={toggleTheme}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}