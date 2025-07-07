import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-colors duration-200 
        bg-gray-100 hover:bg-gray-200 
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-600 dark:text-gray-300
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 transition-opacity duration-200
            ${isDark ? 'opacity-0' : 'opacity-100'}
          `}
        />
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 transition-opacity duration-200
            ${isDark ? 'opacity-100' : 'opacity-0'}
          `}
        />
      </div>
    </button>
  );
};

export const ThemeSelector = ({ className = '' }) => {
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  return (
    <div className={`flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      <button
        onClick={setLightTheme}
        className={`
          p-2 rounded-md transition-colors duration-200
          ${theme === 'light' 
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }
        `}
        title="Light mode"
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={setDarkTheme}
        className={`
          p-2 rounded-md transition-colors duration-200
          ${theme === 'dark' 
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }
        `}
        title="Dark mode"
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ThemeToggle;
