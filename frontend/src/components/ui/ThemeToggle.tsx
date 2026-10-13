'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary"
      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
      title={theme === 'light' ? 'Cambiar a Dark Espresso' : 'Cambiar a Warm Cream'}
      type="button"
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          <span>Dark Espresso</span>
        </>
      ) : (
        <>
          <Sun size={16} />
          <span>Warm Cream</span>
        </>
      )}
    </button>
  );
}
