"use client";

import { useTheme } from '@/lib/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-opacity-50"
      aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-primary-400 transition-transform duration-200 rotate-0" />
      ) : (
        <Moon size={20} className="text-primary-600 transition-transform duration-200 rotate-0" />
      )}
    </button>
  );
} 