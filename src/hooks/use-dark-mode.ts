
import { useState, useEffect } from 'react';

export function useDarkMode() {
  // Check if localStorage is available (client-side)
  const isClient = typeof window !== 'undefined';
  
  // Initialize with dark mode by default
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (!isClient) return true;
    
    const storedPreference = localStorage.getItem('color-theme');
    if (storedPreference) {
      return storedPreference === 'dark';
    }
    
    // Default to dark mode if no preference is stored
    return true;
  });

  // Update the DOM and localStorage when the mode changes
  useEffect(() => {
    if (!isClient) return;
    
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    }
  }, [isDarkMode, isClient]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return {
    isDarkMode,
    toggleDarkMode
  };
}
